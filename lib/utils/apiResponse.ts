import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'LIMIT_REACHED'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'INVALID_REQUEST'
  | 'INTERNAL_ERROR';

export function jsonError(params: { code: ApiErrorCode; message: string; status: number }) {
  const { code, message, status } = params;
  return NextResponse.json({ code, message }, { status });
}
