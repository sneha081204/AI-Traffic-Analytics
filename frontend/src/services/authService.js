import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const authService = {
  login: async (username, password) => {
    return await apiClient.post(API_ENDPOINTS.LOGIN, { username, password });
  },

  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem('USER_INFO');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('USER_INFO');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('ACCESS_TOKEN');
  },
};
