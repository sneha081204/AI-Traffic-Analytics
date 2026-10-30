import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const cameraService = {
  getCameras() {
    return apiClient.get(API_ENDPOINTS.CAMERAS);
  },

  addCamera(cameraData) {
    return apiClient.post(API_ENDPOINTS.CAMERAS, cameraData);
  },
};
