import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
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
