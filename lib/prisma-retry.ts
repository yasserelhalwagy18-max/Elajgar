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
 *    Prisma Client promises". The original promise is therefore used as the
 *    prototype, so the tag and `requestTransaction` are kept.
 *
 * 2. The retry has to wrap the *execution* of the query, not the delivery
 *    of its result. `await` hands the promise a rejection handler, so a
 *    rejection would be passed straight to that handler and the retry would
 *    never see it. The promise is therefore awaited on its own, and only the
 *    settled value is handed to the caller's handlers.
 *
 * `createPromise` must return a fresh promise each time it is called - that
 * is what makes the retry run the query again.
 */
export function resilientPromise(
  createPromise: () => Promise<unknown>,
  withReconnect: <T>(operation: () => Promise<T>) => Promise<T>,
): unknown {
  // The first promise is only used as the prototype. A Prisma promise is
  // lazy, so nothing is sent to the database until it is awaited.
  const prototype = createPromise();
  const wrapper = Object.create(prototype) as Record<string | symbol, unknown>;

  const run = () => withReconnect(() => createPromise());

  wrapper.then = (onFulfilled?: unknown, onRejected?: unknown) =>
    run().then(
      onFulfilled as ((value: unknown) => unknown) | undefined,
      onRejected as ((reason: unknown) => unknown) | undefined,
    );
  wrapper.catch = (onRejected?: unknown) =>
    run().catch(onRejected as ((reason: unknown) => unknown) | undefined);
  wrapper.finally = (onFinally?: unknown) =>
    run().finally(onFinally as (() => void) | undefined);

  return wrapper;
}
