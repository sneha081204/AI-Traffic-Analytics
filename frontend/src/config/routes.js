export const ROUTES = {
  LANDING: '/',
  // Auth
  LOGIN: '/login',

  // Portal 1 — Traffic Police Portal
  POLICE: {
    DASHBOARD: '/police/dashboard',
    CAPTURE: '/police/capture',
    LIVE_CAMERA: '/police/camera',
    MY_VIOLATIONS: '/police/violations',
    FINES: '/police/fines',
    VIOLATION_DETAILS: '/police/violations/:id',
    HISTORY: '/police/history',
    PROFILE: '/police/profile',
  },

  // Portal 2 — Traffic Police Department Portal
  DEPARTMENT: {
    DASHBOARD: '/department/dashboard',
    OFFICERS: '/department/officers',
    OFFICER_DETAILS: '/department/officers/:id',
    SECTORS: '/department/sectors',
    VIOLATIONS: '/department/violations',
    FINES: '/department/fines',
    ANALYTICS: '/department/analytics',
    AI_CONFIG: '/department/ai-configuration',
    VIOLATION_RULES: '/department/violation-rules',
    PROFILE: '/department/profile',
  },
};
