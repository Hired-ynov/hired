import { LoginDTO, RegisterDTO, UserDTO } from '@repo/models';

import apiFetch, { getAuthToken, setAuthToken } from '../api';

export async function login(loginDTO: LoginDTO) {
  const res = await apiFetch('/auth/login', {
    body: JSON.stringify(loginDTO),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });

  if (!res || res.ok === false) {
    const msg = Array.isArray(res?.message)
      ? res.message.join(' ')
      : (res?.message ?? res?.error ?? 'Login failed');
    throw new Error(String(msg));
  }

  if (!res.access_token) {
    throw new Error('No token received from server');
  }

  setAuthToken(res.access_token as string);
}

export async function logout() {
  try {
    const res = await apiFetch('/auth/logout', { method: 'POST' });
    setAuthToken(null);
    return res;
  } catch (error) {
    setAuthToken(null);
    throw error;
  }
}

export async function me() {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  const verify = await apiFetch('/auth/verify', {
    body: JSON.stringify({ token }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });

  if (!verify || verify.ok === false || !verify.sub) {
    setAuthToken(null);
    return null;
  }

  const userId = String(verify.sub);

  const res = await apiFetch(`/user/${userId}`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'GET',
  });

  if (res?.ok === false) {
    setAuthToken(null);
    return null;
  }

  if (!res?.id) {
    return null;
  }

  return {
    ...res,
    skills:
      typeof res.skills === 'string' ? JSON.parse(res.skills) : res.skills,
  } as UserDTO;
}

export async function register(RegisterDTO: RegisterDTO) {
  const res = await apiFetch('/auth/register', {
    body: JSON.stringify(RegisterDTO),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });

  if (res?.ok === false) {
    throw new Error(res.message ?? 'Registration failed');
  }

  if (!res.access_token) {
    throw new Error('No token received from server');
  }

  setAuthToken(res.access_token as string);
}

const authClient = { login, logout, me, register };

export default authClient;
