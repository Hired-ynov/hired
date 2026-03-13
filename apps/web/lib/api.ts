export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== 'undefined' ? '/api/backend' : 'http://localhost:3000');

export function setAuthToken(token: string | null) {
  if (!token) {
    localStorage.removeItem('token');
    return;
  }

  localStorage.setItem('token', token);
}

export function getAuthToken() {
  const token = localStorage.getItem('token');
  return token || null;
}

export async function fetchApi(path: string, opts: RequestInit = {}) {
  const url = path.startsWith('http')
    ? path
    : `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const token = localStorage.getItem('token');

  const headers = {
    ...opts.headers,
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };

  const res = await fetch(url, { ...opts, headers });
  const contentType = res.headers.get('content-type') || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  if (contentType.includes('application/json')) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  } else {
    body = await res.text();
  }

  if (body && typeof body === 'object') {
    if (body.ok === undefined) body.ok = res.ok;
    if (body.status === undefined) body.status = res.status;
    return body;
  }

  return { ok: res.ok, status: res.status, data: body };
}

export default fetchApi;
