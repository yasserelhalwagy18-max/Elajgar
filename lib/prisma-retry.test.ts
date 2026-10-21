import { describe, it, expect, vi } from 'vitest';
import {
  createResilientOperation,
  isTransientConnectionError,
  resilientPromise,
} from './prisma-retry';

/**
 * Tests for the broken-connection recovery.
 *
 * A managed database that goes away and comes back leaves dead sockets
 * behind. These tests pin down the behaviour the app depends on: a broken
 * connection is repaired and the query is retried, and a query that failed
 * for a real reason is never retried.
 */

/** An error shaped like the ones Prisma throws. */
function prismaError(code: string): Error & { code: string } {
  return Object.assign(new Error(`Prisma error ${code}`), { code });
}

describe('isTransientConnectionError', () => {
  it('recognises the codes that mean the connection broke', () => {
    for (const code of ['P1001', 'P1007', 'P1010', 'P1017', 'P2024', 'P2028']) {
      expect(isTransientConnectionError(prismaError(code))).toBe(true);
    }
  });

  it('recognises the code on the errorCode property', () => {
    const error = Object.assign(new Error('boom'), { errorCode: 'P1001' });
    expect(isTransientConnectionError(error)).toBe(true);
  });

  it('recognises the code in the message', () => {
    const error = new Error("Can't reach database server at `host:3306`  code: 'P1001'");
    expect(isTransientConnectionError(error)).toBe(true);
  });

  it('does not treat a real query error as a connection problem', () => {
    for (const code of ['P2002', 'P2025', 'P2003']) {
      expect(isTransientConnectionError(prismaError(code))).toBe(false);
    }
  });

  it('does not treat an ordinary error as a connection problem', () => {
    expect(isTransientConnectionError(new Error('nope'))).toBe(false);
    expect(isTransientConnectionError(undefined)).toBe(false);
    expect(isTransientConnectionError('P1001')).toBe(false);
  });
});

describe('createResilientOperation', () => {
  it('returns the result without reconnecting when the query succeeds', async () => {
    const reconnect = vi.fn();
    const withReconnect = createResilientOperation(reconnect);

    const operation = vi.fn().mockResolvedValue('ok');

    await expect(withReconnect(operation)).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(1);
    expect(reconnect).not.toHaveBeenCalled();
  });

  it('reconnects and retries once when the connection broke', async () => {
    const reconnect = vi.fn().mockResolvedValue(undefined);
    const withReconnect = createResilientOperation(reconnect);

    const operation = vi
      .fn()
      .mockRejectedValueOnce(prismaError('P1001'))
      .mockResolvedValueOnce('recovered');

    await expect(withReconnect(operation)).resolves.toBe('recovered');
    expect(reconnect).toHaveBeenCalledTimes(1);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('does not retry a query that failed for a real reason', async () => {
    const reconnect = vi.fn();
    const withReconnect = createResilientOperation(reconnect);

    const operation = vi.fn().mockRejectedValue(prismaError('P2002'));

    await expect(withReconnect(operation)).rejects.toThrow('Prisma error P2002');
    expect(reconnect).not.toHaveBeenCalled();
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('gives up after one retry and reports the original failure', async () => {
    const reconnect = vi.fn().mockResolvedValue(undefined);
    const withReconnect = createResilientOperation(reconnect);

    const operation = vi.fn().mockRejectedValue(prismaError('P1001'));

    await expect(withReconnect(operation)).rejects.toThrow('Prisma error P1001');
    expect(reconnect).toHaveBeenCalledTimes(1);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('reports the original failure even when the retry fails differently', async () => {
    const reconnect = vi.fn().mockResolvedValue(undefined);
    const withReconnect = createResilientOperation(reconnect);

    const operation = vi
      .fn()
      .mockRejectedValueOnce(prismaError('P1001'))
      .mockRejectedValueOnce(prismaError('P2002'));

    // The retry failed for a real reason, so that is what the caller sees.
    await expect(withReconnect(operation)).rejects.toThrow('Prisma error P2002');
  });

  it('notifies the caller when it reconnects', async () => {
    const onReconnect = vi.fn();
    const withReconnect = createResilientOperation(async () => {}, onReconnect);

    const operation = vi
      .fn()
      .mockRejectedValueOnce(prismaError('P1017'))
      .mockResolvedValueOnce('ok');

    await withReconnect(operation);

    expect(onReconnect).toHaveBeenCalledTimes(1);
  });
});

/**
 * A stand-in for the promise Prisma returns.
 *
 * The shape matters: Prisma decides whether a query may join
 * `prisma.$transaction([...])` by looking at the `PrismaPromise` tag and
 * calling `requestTransaction`, so a replacement that loses either of them
 * breaks every array transaction in the app.
 *
 * Like a real Prisma promise it is lazy: the query only runs when `then` is
 * called.
 */
function fakePrismaPromise(run: () => Promise<unknown>) {
  return {
    then: (onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) =>
      run().then(onFulfilled, onRejected),
    catch: (onRejected?: (reason: unknown) => unknown) => run().catch(onRejected),
    finally: (onFinally?: () => void) => run().finally(onFinally),
    requestTransaction: (tx: unknown) => tx,
    [Symbol.toStringTag]: 'PrismaPromise',
  };
}

describe('resilientPromise', () => {
  const noReconnect = createResilientOperation(async () => {});

  it('keeps the PrismaPromise tag, so it can join an array transaction', () => {
    const original = fakePrismaPromise(async () => 'ok');
    const wrapped = resilientPromise(
      () => original as unknown as Promise<unknown>,
      noReconnect,
    ) as Record<symbol, unknown>;

    expect(wrapped[Symbol.toStringTag]).toBe('PrismaPromise');
  });

  it('keeps requestTransaction, so the transaction can claim the query', () => {
    const original = fakePrismaPromise(async () => 'ok');
    const wrapped = resilientPromise(
      () => original as unknown as Promise<unknown>,
      noReconnect,
    ) as { requestTransaction: (tx: unknown) => unknown };

    const descriptor = { kind: 'batch' };
    expect(wrapped.requestTransaction(descriptor)).toBe(descriptor);
  });

  it('resolves with the value of the original promise', async () => {
    const original = fakePrismaPromise(async () => 'the value');
    const wrapped = resilientPromise(
      () => original as unknown as Promise<unknown>,
      noReconnect,
    ) as Promise<string>;

    await expect(wrapped).resolves.toBe('the value');
  });

  it('reconnects and runs the query again when the connection broke', async () => {
    const reconnect = vi.fn().mockResolvedValue(undefined);
    const withReconnect = createResilientOperation(reconnect);

    let attempts = 0;
    // A fresh promise each time, like a real Prisma client method.
    const createPromise = () =>
      fakePrismaPromise(async () => {
        attempts++;
        if (attempts === 1) throw prismaError('P1001');
        return 'recovered';
      }) as unknown as Promise<unknown>;

    const wrapped = resilientPromise(createPromise, withReconnect) as Promise<string>;

    await expect(wrapped).resolves.toBe('recovered');
    expect(attempts).toBe(2);
    expect(reconnect).toHaveBeenCalledTimes(1);
  });

  it('rejects when the database stays unreachable', async () => {
    const reconnect = vi.fn().mockResolvedValue(undefined);
    const withReconnect = createResilientOperation(reconnect);

    let attempts = 0;
    const createPromise = () =>
      fakePrismaPromise(async () => {
        attempts++;
        throw prismaError('P1001');
      }) as unknown as Promise<unknown>;

    const wrapped = resilientPromise(createPromise, withReconnect) as Promise<string>;

    await expect(wrapped).rejects.toThrow('Prisma error P1001');
    expect(attempts).toBe(2);
  });
});
