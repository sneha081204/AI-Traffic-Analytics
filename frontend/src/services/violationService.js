import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const violationService = {
  /**
   * Fetch all violations from database
   * @param {Object} params - Query params (status, officer, etc.)
   */
  async getAllViolations(params = {}) {
    return apiClient.get(API_ENDPOINTS.VIOLATIONS, { params });
  },

  /**
   * Fetch single violation by ID
   */
  async getViolationById(id) {
    return apiClient.get(API_ENDPOINTS.VIOLATION_DETAIL(id));
  },

  /**
   * Save a new violation to the database
   */
  async createViolation(violationData) {
    return apiClient.post(API_ENDPOINTS.VIOLATIONS, violationData);
  },

  /**
   * Update status or payment of a violation
   */
  async updateViolation(id, updateData) {
    return apiClient.patch(API_ENDPOINTS.VIOLATION_DETAIL(id), updateData);
  },

  /**
   * Delete or archive a violation record
   */
  async deleteViolation(id) {
    return apiClient.delete(API_ENDPOINTS.VIOLATION_DETAIL(id));
  },
};
