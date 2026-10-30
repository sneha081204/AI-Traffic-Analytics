import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const videoService = {
  uploadVideo: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('video', file);
    return await apiClient.post(API_ENDPOINTS.UPLOAD_VIDEO, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  startProcessing: async (videoPath) => {
    return await apiClient.post(API_ENDPOINTS.PROCESS_VIDEO, { video_path: videoPath });
  },

  getProcessingStatus: async () => {
    return await apiClient.get(API_ENDPOINTS.VIDEO_STATUS);
  },

  getAnalysisResult: async (id) => {
    if (id) {
      return await apiClient.get(API_ENDPOINTS.VIOLATION_DETAIL(id));
    }
    return await apiClient.get(API_ENDPOINTS.VIOLATIONS);
  },
};
