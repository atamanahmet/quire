import { NextResponse } from "next/server";

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonError(message: string, status: number, code?: string) {
  return NextResponse.json(
    { error: { message, ...(code !== undefined ? { code } : {}) } },
    { status },
  );
}
