import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const officerService = {
  /**
   * Get list of all enrolled officers
   */
  async getAllOfficers() {
    return apiClient.get(API_ENDPOINTS.OFFICERS);
  },

  /**
   * Get specific officer details by ID
   */
  async getOfficerById(id) {
    return apiClient.get(API_ENDPOINTS.OFFICER_DETAIL(id));
  },

  /**
   * Enroll a new police officer in database
   */
  async createOfficer(officerData) {
    return apiClient.post(API_ENDPOINTS.OFFICERS, officerData);
  },

  /**
   * Update officer profile details
   */
  async updateOfficerProfile(id, officerData) {
    return apiClient.put(API_ENDPOINTS.OFFICER_DETAIL(id), officerData);
  },

  /**
   * Change officer password
   */
  async changeOfficerPassword(id, passwordData) {
    return apiClient.post(API_ENDPOINTS.OFFICER_CHANGE_PASSWORD(id), passwordData);
  },

  /**
   * Toggle or update officer status
   */
  async updateOfficerStatus(id, status) {
    return apiClient.patch(API_ENDPOINTS.OFFICER_STATUS(id), { status });
  },
};
