import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const trafficService = {
  getViolations(params = {}) {
    return apiClient.get(API_ENDPOINTS.VIOLATIONS, params);
  },

  getViolationDetail(id) {
    return apiClient.get(API_ENDPOINTS.VIOLATION_DETAIL(id));
  },

  updateViolationStatus(id, status) {
    return apiClient.patch(API_ENDPOINTS.VIOLATIONS + `/${id}/status`, { status });
  },

  runAiAnalysis(id, apiKey = '') {
    return apiClient.post(API_ENDPOINTS.VIOLATION_AI_ANALYZE(id), { api_key: apiKey });
  },

  getEChallanReport(id) {
    return apiClient.get(API_ENDPOINTS.VIOLATION_REPORT(id));
  },

  uploadVideo(file) {
    const formData = new FormData();
    formData.append('video', file);
    return apiClient.post(API_ENDPOINTS.VIDEO_UPLOAD, formData, true);
  },

  startVideoProcessing(videoPath = null) {
    return apiClient.post(API_ENDPOINTS.VIDEO_PROCESS, { video_path: videoPath });
  },

  getVideoStatus() {
    return apiClient.get(API_ENDPOINTS.VIDEO_STATUS);
  },
};
