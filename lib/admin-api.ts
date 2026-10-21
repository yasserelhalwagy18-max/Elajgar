import 'server-only';

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { AdminAuthError } from './admin-guard';

/** A JSON error body. */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Turn any thrown value into a response.
 *
 * An authorisation failure keeps its own status and message; anything else
 * is an unexpected error and becomes a generic 500 so an internal message
 * never leaks to the client.
 */
export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return jsonError('رکوردی با این مشخصات از قبل وجود دارد', 409);
    }
    if (error.code === 'P2025') {
      return jsonError('رکورد مورد نظر یافت نشد', 404);
    }
  }

  console.error('Admin API error:', error);
  return jsonError('خطای غیرمنتظره در سرور', 500);
}

export interface Pagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/**
 * Read `page` and `pageSize` from the query string.
 *
 * Both are clamped: a negative page would produce a negative offset and a
 * huge `pageSize` would let a single request pull the whole table.
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaultPageSize = 20,
  maxPageSize = 100,
): Pagination {
  const rawPage = Number(searchParams.get('page'));
  const rawPageSize = Number(searchParams.get('pageSize'));

  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize >= 1
    ? Math.min(maxPageSize, Math.floor(rawPageSize))
    : defaultPageSize;

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

/** The standard shape of a paginated list response. */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginated<T>(
  items: T[],
  total: number,
  { page, pageSize }: Pagination,
): PaginatedResponse<T> {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Cast a plain object into a value Prisma accepts for a JSON column. */
export function toJson(value: unknown): Prisma.InputJsonValue {
  return (value ?? null) as Prisma.InputJsonValue;
}

export interface AuditEntry {
  actorId: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}

/**
 * Record who changed what.
 *
 * A failed audit write is logged but never fails the operation itself: the
 * admin's change is already committed, and losing it because the audit
 * insert failed would be worse than a gap in the trail.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        before: entry.before === undefined ? undefined : toJson(entry.before),
        after: entry.after === undefined ? undefined : toJson(entry.after),
      },
    });
  } catch (error) {
    console.error('Failed to write the audit log:', error);
  }
}

/**
 * Read a string field from an untyped body.
 *
 * Returns undefined when the field is absent and null when it was sent as
 * null - the difference matters for a PATCH, where absent means "leave it
 * alone" and null means "clear it".
 */
export function readString(
  body: Record<string, unknown>,
  field: string,
): string | null | undefined {
  if (!(field in body)) return undefined;

  const value = body[field];
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** Read a finite number from an untyped body. */
export function readNumber(
  body: Record<string, unknown>,
  field: string,
): number | null | undefined {
  if (!(field in body)) return undefined;

  const value = body[field];
  if (value === null || value === '') return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;

  return parsed;
}

/** Read a boolean from an untyped body. */
export function readBoolean(
  body: Record<string, unknown>,
  field: string,
): boolean | undefined {
  if (!(field in body)) return undefined;

  const value = body[field];
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;

  return undefined;
}

/**
 * Read a list of paragraphs from an untyped body.
 *
 * The body of an article is a list of paragraphs. A single string is accepted
 * as a convenience and split on blank lines, because that is how it is
 * usually pasted in.
 */
export function readParagraphs(
  body: Record<string, unknown>,
  field = 'content',
): string[] | null {
  const value = body[field];

  if (typeof value === 'string') {
    return value
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(value)) return null;
  if (!value.every((entry) => typeof entry === 'string')) return null;

  return (value as string[]).map((paragraph) => paragraph.trim()).filter(Boolean);
}

/**
 * Read a string array from an untyped body.
 *
 * A JSON column accepts an array of strings; anything else is rejected so a
 * malformed request fails loudly instead of storing a broken value.
 */
export function readStringArray(
  body: Record<string, unknown>,
  field: string,
): string[] | null | undefined {
  if (!(field in body)) return undefined;

  const value = body[field];
  if (value === null) return null;
  if (!Array.isArray(value)) return undefined;

  return value.every((entry) => typeof entry === 'string')
    ? (value as string[])
    : undefined;
}
