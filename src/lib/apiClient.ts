import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://apimedsys.com.ua',
  headers: {
    'Content-Type': 'application/json',
    'x-forwarded-host': import.meta.env.VITE_SITE_HOST || 'no-alert.net',
  },
});

apiClient.interceptors.request.use((config) => {
  // Lazily import to avoid circular deps — sessionStore imports nothing from apiClient
  const token: string | null = (() => {
    try {
      const raw = localStorage.getItem('session-store');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { state?: { sessionToken?: string } };
      return parsed?.state?.sessionToken ?? null;
    } catch {
      return null;
    }
  })();

  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(new Error(body.error ?? 'Unknown API error'));
      }
      return { ...response, data: body.data };
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.error ?? error.message ?? 'Network error';
    return Promise.reject(new Error(message));
  },
);

export { apiClient };
