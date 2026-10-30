export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_ENDPOINTS = {
  // Authentication & Profile
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  ME: '/api/v1/auth/me',
  AUTH_PROFILE: '/api/v1/auth/profile',
  AUTH_CHANGE_PASSWORD: '/api/v1/auth/change-password',

  // Officers Management
  OFFICERS: '/api/v1/officers',
  OFFICER_DETAIL: (id) => `/api/v1/officers/${id}`,
  OFFICER_STATUS: (id) => `/api/v1/officers/${id}/status`,
  OFFICER_CHANGE_PASSWORD: (id) => `/api/v1/officers/${id}/change-password`,

  // Sectors Management
  SECTORS: '/api/v1/sectors',
  SECTOR_DETAIL: (id) => `/api/v1/sectors/${id}`,
  SECTOR_STATS: '/api/v1/sectors/stats',

  // Violation Management & Database Persistence
  VIOLATIONS: '/api/v1/violations',
  VIOLATION_DETAIL: (id) => `/api/v1/violations/${id}`,
  VIOLATION_RULES: '/api/v1/violation-rules',
  VIOLATION_RULE_DETAIL: (id) => `/api/v1/violation-rules/${id}`,

  // AI Vision & Frame Detection Engine
  AI_DETECT_FRAME: '/api/v1/ai/detect-frame',
  AI_CONFIG: '/api/v1/ai/configuration',
  AI_TEST: '/api/v1/ai/test',

  // Video Management & Processing
  UPLOAD_VIDEO: '/api/v1/traffic/video/upload',
  PROCESS_VIDEO: '/api/v1/traffic/video/process',
  VIDEO_STATUS: '/api/v1/traffic/video/status',
  VIDEO_STREAM: '/api/v1/traffic/video/stream',

  // Traffic & Vehicle Analytics
  SUMMARY: '/api/v1/analytics/summary',
  TIMELINE: '/api/v1/analytics/timeline',

  // System
  HEALTH: '/api/system/health',
};

