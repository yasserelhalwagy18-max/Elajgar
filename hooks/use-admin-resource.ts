'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminResourceState<T> {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  /** The whole response body, for endpoints that return extra data. */
  data: PaginatedResponse<T> & Record<string, unknown> | null;
  reload: () => void;
}

/**
 * Load a paginated list from an admin endpoint.
 *
 * The request is aborted when the parameters change, so a slow response for
 * an old search cannot overwrite the result of a newer one.
 */
export function useAdminResource<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>,
): AdminResourceState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [data, setData] = useState<(PaginatedResponse<T> & Record<string, unknown>) | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // A stable key so the effect does not re-run on every render just because a
  // new object was passed in.
  const paramsKey = useMemo(
    () =>
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== '')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('&'),
    [params],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const query = paramsKey ? `?${paramsKey}` : '';
        const res = await fetch(`${endpoint}${query}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        const body = await res.json().catch(() => null);

        if (!res.ok) {
          setError(body?.error ?? 'خطا در دریافت اطلاعات');
          setItems([]);
          setTotal(0);
          setData(null);
          return;
        }

        const bodyData = body as PaginatedResponse<T> & Record<string, unknown>;

        // Some endpoints (the plans, for example) return a bare array
        // instead of the paginated envelope.
        if (Array.isArray(body)) {
          const list = body as T[];
          setData({ items: list, page: 1, pageSize: list.length, total: list.length, totalPages: 1 });
          setItems(list);
          setTotal(list.length);
          setTotalPages(1);
          setPage(1);
          return;
        }

        setData(bodyData);
        setItems(Array.isArray(bodyData.items) ? bodyData.items : []);
        setTotal(bodyData.total ?? 0);
        setTotalPages(bodyData.totalPages ?? 1);
        setPage(bodyData.page ?? 1);
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setError('ارتباط با سرور برقرار نشد');
        setItems([]);
        setData(null);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [endpoint, paramsKey, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { items, total, totalPages, page, isLoading, error, data, reload };
}

/**
 * A search box that only reports a term once the typing stops.
 *
 * Without the delay every keystroke would fire a request, and the list would
 * flicker through every intermediate prefix.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * The current page, reset to the first one whenever the filters change.
 *
 * The reset happens during the render rather than in an effect: React calls
 * this "adjusting state when a prop changes". An effect would render the
 * stale page first and then correct it, which shows an empty table for a
 * frame when the new filter has fewer results.
 */
export function usePageNumber(resetKey: string): [number, (page: number) => void] {
  const [page, setPage] = useState(1);
  const [previousKey, setPreviousKey] = useState(resetKey);

  if (previousKey !== resetKey) {
    setPreviousKey(resetKey);
    setPage(1);
  }

  return [page, setPage];
}
