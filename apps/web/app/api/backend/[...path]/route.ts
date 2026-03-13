import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, await params);
}

async function proxy(
  request: NextRequest,
  params: { path: string[] },
): Promise<NextResponse> {
  const path = params.path?.join('/') ?? '';
  const search = request.nextUrl.search;
  const url = `${GATEWAY_URL.replace(/\/$/, '')}/${path}${search}`;
  const requestHeaders = new Headers();

  request.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'host') return;
    requestHeaders.set(key, value);
  });

  let body: string | undefined;
  try {
    body = await request.text();
  } catch {
    body = undefined;
  }

  const res = await fetch(url, {
    method: request.method,
    headers: requestHeaders,
    body: body || undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  let data: unknown;
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }
  } else {
    data = await res.text();
  }

  return NextResponse.json(data, { status: res.status });
}
