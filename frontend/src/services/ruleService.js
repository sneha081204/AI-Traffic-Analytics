import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export const ruleService = {
  /**
   * Fetch all statutory violation rules
   */
  async getAllRules() {
    return apiClient.get(API_ENDPOINTS.VIOLATION_RULES);
  },

  /**
   * Create a new violation rule
   */
  async createRule(ruleData) {
    return apiClient.post(API_ENDPOINTS.VIOLATION_RULES, ruleData);
  },

  /**
   * Update existing violation rule (fine, severity, status)
   */
  async updateRule(id, ruleData) {
    return apiClient.patch(API_ENDPOINTS.VIOLATION_RULE_DETAIL(id), ruleData);
  },
};
