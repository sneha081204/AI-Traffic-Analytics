import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const aiDetectionService = {
  /**
   * Send live frame snapshot or image data to AI vision detection engine
   * @param {Object} payload - { image: base64, location: string, autoPersist: boolean, officerId: string }
   */
  async detectFrame(payload) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    const finalPayload = { ...payload };
    if (
      apiKey &&
      typeof apiKey === 'string' &&
      apiKey.trim().length > 25 &&
      !apiKey.includes('••••') &&
      !apiKey.toLowerCase().includes('demo')
    ) {
      finalPayload.apiKey = apiKey.trim();
    }
    return apiClient.post(API_ENDPOINTS.AI_DETECT_FRAME, finalPayload);
  },

  /**
   * Upload image file for AI violation detection
   * @param {File} file - Image/video frame file
   * @param {Object} metadata - Optional metadata (location, officerId, autoPersist)
   */
  async uploadAndDetect(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.location) formData.append('location', metadata.location);
    if (metadata.officerId) formData.append('officerId', metadata.officerId);
    if (metadata.autoPersist) formData.append('autoPersist', 'true');

    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (
      apiKey &&
      typeof apiKey === 'string' &&
      apiKey.trim().length > 25 &&
      !apiKey.includes('••••') &&
      !apiKey.toLowerCase().includes('demo')
    ) {
      formData.append('apiKey', apiKey.trim());
    }

    return apiClient.post(API_ENDPOINTS.AI_DETECT_FRAME, formData);
  },

  /**
   * Get AI configuration
   */
  async getConfiguration() {
    return apiClient.get(API_ENDPOINTS.AI_CONFIG);
  },

  /**
   * Update AI configuration
   */
  async updateConfiguration(configData) {
    return apiClient.post(API_ENDPOINTS.AI_CONFIG, configData);
  },

  /**
   * Save AI configuration (alias for updateConfiguration)
   */
  async saveConfiguration(configData) {
    return apiClient.post(API_ENDPOINTS.AI_CONFIG, configData);
  },

  /**
   * Run diagnostics test on AI engine & Gemini API key
   * @param {Object} payload - Optional { apiKey: string }
   */
  async testAiEngine(payload = {}) {
    return apiClient.post(API_ENDPOINTS.AI_TEST, payload);
  },
};
