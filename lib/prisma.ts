import 'server-only';
import { PrismaClient } from '@prisma/client';
import { createResilientOperation, resilientPromise } from './prisma-retry';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Reuse the client across hot reloads in development so the database does not
// run out of connections.
const base = global.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') global.prismaGlobal = base;

/**
 * Drop the broken connections and open a fresh one.
 *
 * `$disconnect` closes the pool, `$connect` opens a new one against the
 * database that is now back up.
 */
let reconnecting: Promise<void> | null = null;

function reconnect(): Promise<void> {
  // Several requests can fail at the same moment. One reconnect serves them
  // all - the rest wait for it instead of each tearing the pool down again.
  if (!reconnecting) {
    reconnecting = (async () => {
      try {
        await base.$disconnect();
      } catch {
        // A pool that cannot be closed cleanly is still replaced below.
      }
      try {
        await base.$connect();
      } catch {
        // The database is still down. The retry will fail too and the error
        // is reported to the caller as it is.
      }
    })().finally(() => {
      reconnecting = null;
    });
  }
  return reconnecting;
}

const withReconnect = createResilientOperation(reconnect, () => {
  console.error('[prisma] the database connection was lost, reconnecting...');
});

/**
 * Wrap a client method so that a broken connection is repaired and the call
 * is retried once.
 *
 * The result is a Prisma promise, so it can still be passed to
 * `prisma.$transaction([...])`.
 */
function resilient<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) =>
    resilientPromise(
      () => fn(...args) as Promise<unknown>,
      withReconnect,
    ) as Promise<TResult>;
}

/**
 * Wrap `prisma.$transaction`.
 *
 * It has to be wrapped differently from a query. Prisma starts the
 * transaction the moment the method is called - it is not lazy - and it
 * returns a plain promise rather than a Prisma promise. Wrapping it like a
 * query would open a second transaction, and the first one would sit there
 * holding locks until the real one deadlocked against it.
 */
function resilientTransaction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => withReconnect(() => fn(...args));
}

/**
 * The Prisma client the app uses.
 *
 * Every model and every method is wrapped so that a lost connection is
 * repaired automatically. The static type is unchanged, so
 * `prisma.user.findUnique(...)` type-checks exactly as before.
 */
const prisma = new Proxy(base, {
  get(target, property, receiver) {
    const value = Reflect.get(target, property, receiver);

    if (typeof value === 'function') {
      // `$connect`, `$disconnect`, `$on` and `$use` are not queries - they
      // must not be retried, and `$disconnect` is used by the reconnect above.
      const passthrough = ['$connect', '$disconnect', '$on', '$use', '$extends'];
      if (typeof property === 'string' && passthrough.includes(property)) {
        return value.bind(target);
      }
      // `$transaction` starts its transaction eagerly, so it cannot be
      // wrapped the way a query is.
      if (property === '$transaction') {
        return resilientTransaction(value.bind(target));
      }
      return resilient(value.bind(target));
    }

    if (value && typeof value === 'object') {
      // A model delegate: `prisma.user`, `prisma.food`, ...
      return new Proxy(value as object, {
        get(delegate, method) {
          const member = Reflect.get(delegate, method);
          if (typeof member !== 'function') return member;
          return resilient(member.bind(delegate));
        },
      });
    }

    return value;
  },
}) as PrismaClient;

export default prisma;
