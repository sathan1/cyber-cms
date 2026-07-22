// Always use relative '/api' in browser context so Vercel App Router proxy handles requests
const API_BASE_URL = typeof window !== 'undefined'
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function getStoredUser(): any | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('auth_user');
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
  }
  return null;
}

export function setStoredUser(user: any | null) {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }
}

export function setAuthToken(token: string, user?: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    if (user) {
      setStoredUser(user);
    }
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers,
    });

    const text = await response.text();
    let data: any = {};

    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`Server error (${response.status}). Please try again.`);
      }
      throw new Error('Invalid response format received from server.');
    }

    if (!response.ok) {
      throw new Error(data.message || `API error (${response.status}).`);
    }

    return data;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw err;
  }
}
