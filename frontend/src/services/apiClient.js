import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token and Gemini API Key if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (
      apiKey &&
      typeof apiKey === 'string' &&
      apiKey.trim().length > 25 &&
      !apiKey.includes('••••') &&
      !apiKey.toLowerCase().includes('demo')
    ) {
      config.headers['X-API-Key'] = apiKey.trim();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while communicating with the server.';
    return Promise.reject(new Error(errorMsg));
  }
);
