import { User } from '../types';

let inMemoryToken: string | null = null;
let onTokenRefreshedCallbacks: ((token: string | null) => void)[] = [];

export const setInMemoryToken = (token: string | null) => {
  inMemoryToken = token;
  onTokenRefreshedCallbacks.forEach((cb) => cb(token));
};

export const getInMemoryToken = () => inMemoryToken;

export const subscribeToTokenChanges = (cb: (token: string | null) => void) => {
  onTokenRefreshedCallbacks.push(cb);
  return () => {
    onTokenRefreshedCallbacks = onTokenRefreshedCallbacks.filter((c) => c !== cb);
  };
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Custom fetch client with automatic Bearer token injection,
 * automatic refresh token on 401, and request replay queue.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (inMemoryToken) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }

  // Include credentials so the HTTP-only refreshToken cookie is transmitted
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error('Network error. Could not connect to ScribeSpace server.');
  }

  // If token is expired or unauthorized (401 / 403), attempt token refresh and replay
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/refresh')) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async (freshToken: string) => {
            headers.set('Authorization', `Bearer ${freshToken}`);
            const retryRes = await fetch(url, { ...config, headers });
            const data = await retryRes.json();
            resolve(data);
          },
          reject: (err) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const freshToken = refreshData.accessToken;
        setInMemoryToken(freshToken);
        processQueue(null, freshToken);

        // Replay original request
        headers.set('Authorization', `Bearer ${freshToken}`);
        const replayedRes = await fetch(url, { ...config, headers });
        const replayedData = await replayedRes.json();
        isRefreshing = false;
        return replayedData;
      } else {
        // Refresh token invalid or expired
        setInMemoryToken(null);
        processQueue(new Error('Session expired. Please log in again.'));
        isRefreshing = false;
        throw new Error('Session expired. Please log in.');
      }
    } catch (refreshErr) {
      setInMemoryToken(null);
      processQueue(refreshErr);
      isRefreshing = false;
      throw refreshErr;
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}
