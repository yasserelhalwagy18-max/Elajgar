/**
 * Recovery from a broken database connection.
 *
 * A managed database that is powered off and on again leaves the old sockets
 * dead. The client keeps handing them out, and every query fails with
 * `Can't reach database server` (P1001) or `Server has closed the connection`
 * (P1017) until the process is restarted.
 *
 * Repairing the pool in place is much better than asking an operator to
 * restart the app every time the database blinks out.
 */

/**
 * The error codes that mean "the connection to the database is broken", not
 * "the query was wrong".
 *
 * A query that fails for any other reason - a unique constraint, a missing
 * row - is a real error and must be reported as it is.
 */
export const TRANSIENT_CONNECTION_ERRORS = new Set([
  'P1001', // Can't reach database server
  'P1002', // The database server was reached but timed out
  'P1007', // The database server was reached but timed out
  'P1008', // The database server was reached but timed out
  'P1010', // The database server rejected the connection
  'P1011', // TLS connection error
  'P1017', // Server has closed the connection
  'P2024', // Timed out fetching a new connection from the connection pool
  'P2028', // Transaction API error: unable to start a transaction
  'P2034', // Write conflict or deadlock - the transaction should be retried
]);

/**
 * Whether the error means the connection broke.
 *
 * `PrismaClientKnownRequestError` exposes the code as `code`;
 * `PrismaClientInitializationError` puts it in `errorCode` and repeats it in
 * the message, so all three are checked.
 */
export function isTransientConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as { code?: unknown; errorCode?: unknown; message?: unknown };

  for (const value of [candidate.code, candidate.errorCode]) {
    if (typeof value === 'string' && TRANSIENT_CONNECTION_ERRORS.has(value)) return true;
  }

  if (typeof candidate.message === 'string') {
    const message: string = candidate.message;
    return [...TRANSIENT_CONNECTION_ERRORS].some((code) => message.includes(code));
  }

  return false;
}

/**
 * Build the function that runs a database operation and repairs a broken
 * connection before trying once more.
 *
 * `reconnect` closes the dead pool and opens a new one. It is expected to
 * swallow its own errors: the retry that follows reports what really
 * happened.
 */
export function createResilientOperation(
  reconnect: () => Promise<void>,
  onReconnect?: () => void,
): <T>(operation: () => Promise<T>) => Promise<T> {
  return async function withReconnect<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientConnectionError(error)) throw error;

      onReconnect?.();
      await reconnect();

      try {
        return await operation();
      } catch (retryError) {
        // The database is still unreachable. Report the original failure - it
        // is the one that describes the situation.
        if (!isTransientConnectionError(retryError)) throw retryError;
        throw error;
      }
    }
  };
}

/**
 * Make a Prisma promise retry itself when the connection broke.
 *
 * Two things have to be right.
 *
 * 1. The result has to stay a *Prisma* promise, not a plain one. Prisma
 *    checks `promise[Symbol.toStringTag] === 'PrismaPromise'` before it
 *    accepts a query as part of `prisma.$transaction([...])`, and a plain
 *    promise fails that check with "All elements of the array need to be
 *    Prisma Client promises". The wrapper therefore carries the tag itself
 *    and forwards `requestTransaction` to the original.
 *
 * 2. The original promise must not be created until it is needed. Prisma
 *    starts an interactive transaction the moment `$transaction` is called,
 *    so creating one only to look at its shape would leave a second
 *    transaction open - and it would deadlock the real one.
 *
 * 3. The retry has to wrap the *execution* of the query, not the delivery
 *    of its result. `await` hands the promise a rejection handler, so a
 *    rejection would be passed straight to that handler and the retry would
 *    never see it. The promise is therefore awaited on its own, and only the
 *    settled value is handed to the caller's handlers.
 */
export function resilientPromise(
  createPromise: () => Promise<unknown>,
  withReconnect: <T>(operation: () => Promise<T>) => Promise<T>,
): unknown {
  let original: Promise<unknown> | null = null;
  const getOriginal = () => (original ??= createPromise());

  const wrapper: Record<string | symbol, unknown> = {
    then: (onFulfilled?: unknown, onRejected?: unknown) =>
      withReconnect(() => getOriginal()).then(
        onFulfilled as ((value: unknown) => unknown) | undefined,
        onRejected as ((reason: unknown) => unknown) | undefined,
      ),
    catch: (onRejected?: unknown) =>
      withReconnect(() => getOriginal()).catch(
        onRejected as ((reason: unknown) => unknown) | undefined,
      ),
    finally: (onFinally?: unknown) =>
      withReconnect(() => getOriginal()).finally(onFinally as (() => void) | undefined),
    /**
     * Prisma calls this on every element of `prisma.$transaction([...])` to
     * hand the query over to the transaction. It has to reach the original
     * promise, or the query would run outside the transaction.
     */
    requestTransaction: (tx: unknown) => {
      const source = getOriginal() as { requestTransaction?: (t: unknown) => unknown };
      return source.requestTransaction ? source.requestTransaction(tx) : source;
    },
    // Prisma decides whether a query may join an array transaction by
    // looking at this tag.
    [Symbol.toStringTag]: 'PrismaPromise',
  };

  return wrapper;
}
