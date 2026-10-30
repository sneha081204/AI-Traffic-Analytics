import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const analyticsService = {
  getSummary: async () => {
    return await apiClient.get(API_ENDPOINTS.SUMMARY);
  },

  getTimeline: async () => {
    return await apiClient.get(API_ENDPOINTS.TIMELINE);
  },

  getViolations: async (params = {}) => {
    return await apiClient.get(API_ENDPOINTS.VIOLATIONS, { params });
  },

  getViolationDetail: async (id) => {
    return await apiClient.get(API_ENDPOINTS.VIOLATION_DETAIL(id));
  },

  runAiForensics: async (id, apiKey) => {
    return await apiClient.post(API_ENDPOINTS.VIOLATION_AI_ANALYZE(id), { api_key: apiKey });
  },

  getEChallanReport: async (id) => {
    return await apiClient.get(API_ENDPOINTS.VIOLATION_REPORT(id));
  },
};
