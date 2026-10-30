import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const sectorService = {
  /**
   * Fetch all traffic sectors with optional query parameters
   */
  async getSectors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_ENDPOINTS.SECTORS}${query ? `?${query}` : ''}`;
    return apiClient.get(url);
  },

  /**
   * Fetch summary metrics across all traffic sectors
   */
  async getSectorStats() {
    return apiClient.get(API_ENDPOINTS.SECTOR_STATS);
  },

  /**
   * Fetch a single sector by ID or Code
   */
  async getSectorById(id) {
    return apiClient.get(API_ENDPOINTS.SECTOR_DETAIL(id));
  },

  /**
   * Create a new Traffic Surveillance & Enforcement Sector
   */
  async createSector(sectorData) {
    return apiClient.post(API_ENDPOINTS.SECTORS, sectorData);
  },

  /**
   * Update an existing Traffic Sector
   */
  async updateSector(id, sectorData) {
    return apiClient.put(API_ENDPOINTS.SECTOR_DETAIL(id), sectorData);
  },

  /**
   * Delete or decommission a Traffic Sector
   */
  async deleteSector(id) {
    return apiClient.delete(API_ENDPOINTS.SECTOR_DETAIL(id));
  },
};
