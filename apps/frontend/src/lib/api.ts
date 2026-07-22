const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://cyber-cms-production.up.railway.app/api').replace(/\/+$/, '');

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
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
  
  // Try primary target URL first
  let targetUrl = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    let response = await fetch(targetUrl, {
      ...options,
      headers,
    });

    // If 404 on /api/..., retry with root base URL (or vice-versa)
    if (response.status === 404 && API_BASE_URL.endsWith('/api')) {
      const rootBaseUrl = API_BASE_URL.replace(/\/api$/, '');
      const retryUrl = `${rootBaseUrl}${cleanEndpoint}`;
      const retryResponse = await fetch(retryUrl, { ...options, headers });
      if (retryResponse.ok || retryResponse.status !== 404) {
        response = retryResponse;
      }
    } else if (response.status === 404 && !API_BASE_URL.endsWith('/api')) {
      const apiBaseUrl = `${API_BASE_URL}/api`;
      const retryUrl = `${apiBaseUrl}${cleanEndpoint}`;
      const retryResponse = await fetch(retryUrl, { ...options, headers });
      if (retryResponse.ok || retryResponse.status !== 404) {
        response = retryResponse;
      }
    }

    const text = await response.text();
    let data: any = {};

    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`Backend server error (${response.status}). Please try again in a few seconds.`);
      }
      throw new Error('Invalid response received from backend server.');
    }

    if (!response.ok) {
      throw new Error(data.message || `API error (${response.status}).`);
    }

    return data;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to backend server. Please verify your internet connection or backend deployment.');
    }
    throw err;
  }
}
