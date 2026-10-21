'use client';

/**
 * A small client for the admin API.
 *
 * Every mutation goes through here so the error handling is the same
 * everywhere: the server's Persian message is shown as-is instead of a
 * generic "something went wrong".
 */
export interface AdminResponse<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number;
}

export async function adminRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<AdminResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        data: null,
        error: body?.error ?? 'خطا در ارتباط با سرور',
        status: res.status,
      };
    }

    return { ok: true, data: body as T, error: null, status: res.status };
  } catch {
    return {
      ok: false,
      data: null,
      error: 'ارتباط با سرور برقرار نشد',
      status: 0,
    };
  }
}

/** A PATCH request against an admin resource. */
export function adminPatch<T>(url: string, body: unknown) {
  return adminRequest<T>(url, { method: 'PATCH', body: JSON.stringify(body) });
}

/** A POST request against an admin resource. */
export function adminPost<T>(url: string, body: unknown) {
  return adminRequest<T>(url, { method: 'POST', body: JSON.stringify(body) });
}

/** A DELETE request against an admin resource. */
export function adminDelete<T>(url: string) {
  return adminRequest<T>(url, { method: 'DELETE' });
}
