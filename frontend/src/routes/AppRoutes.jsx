import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Public Landing Page
import { LandingPage } from '../pages/public/LandingPage';

// Auth
import { Login } from '../pages/auth/Login';

// Police Portal Pages
import { PoliceDashboard } from '../pages/police/Dashboard';
import { CaptureViolation } from '../pages/police/CaptureViolation';
import { PoliceLiveCamera } from '../pages/police/LiveCamera';
import { PoliceViolations } from '../pages/police/Violations';
import { PoliceFines } from '../pages/police/Fines';
import { PoliceViolationDetails } from '../pages/police/ViolationDetails';
import { PoliceHistory } from '../pages/police/History';
import { PoliceProfile } from '../pages/police/Profile';

// Department Portal Pages
import { DepartmentDashboard } from '../pages/department/Dashboard';
import { DepartmentOfficers } from '../pages/department/Officers';
import { DepartmentOfficerDetails } from '../pages/department/OfficerDetails';
import { DepartmentSectors } from '../pages/department/Sectors';
import { DepartmentViolations } from '../pages/department/Violations';
import { DepartmentFines } from '../pages/department/Fines';
import { DepartmentAnalytics } from '../pages/department/Analytics';
import { DepartmentAIConfiguration } from '../pages/department/AIConfiguration';
import { DepartmentViolationRules } from '../pages/department/ViolationRules';
import { DepartmentProfile } from '../pages/department/Profile';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path={ROUTES.LANDING} element={<LandingPage />} />

      {/* Auth */}
      <Route path={ROUTES.LOGIN} element={<Login />} />

      {/* Portal 1 — Traffic Police Portal (Protected) */}
      <Route path={ROUTES.POLICE.DASHBOARD} element={<ProtectedRoute requiredRole="police"><PoliceDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.POLICE.CAPTURE} element={<ProtectedRoute requiredRole="police"><CaptureViolation /></ProtectedRoute>} />
      <Route path="/police/upload" element={<Navigate to={ROUTES.POLICE.CAPTURE} replace />} />
      <Route path={ROUTES.POLICE.LIVE_CAMERA} element={<ProtectedRoute requiredRole="police"><PoliceLiveCamera /></ProtectedRoute>} />
      <Route path={ROUTES.POLICE.MY_VIOLATIONS} element={<ProtectedRoute requiredRole="police"><PoliceViolations /></ProtectedRoute>} />
      <Route path={ROUTES.POLICE.FINES} element={<ProtectedRoute requiredRole="police"><PoliceFines /></ProtectedRoute>} />
      <Route path={ROUTES.POLICE.VIOLATION_DETAILS} element={<ProtectedRoute requiredRole="police"><PoliceViolationDetails /></ProtectedRoute>} />
      <Route path={ROUTES.POLICE.HISTORY} element={<ProtectedRoute requiredRole="police"><PoliceHistory /></ProtectedRoute>} />
      <Route path={ROUTES.POLICE.PROFILE} element={<ProtectedRoute requiredRole="police"><PoliceProfile /></ProtectedRoute>} />

      {/* Portal 2 — Traffic Police Department Portal (Protected) */}
      <Route path={ROUTES.DEPARTMENT.DASHBOARD} element={<ProtectedRoute requiredRole="department"><DepartmentDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.DEPARTMENT.OFFICERS} element={<ProtectedRoute requiredRole="department"><DepartmentOfficers /></ProtectedRoute>} />
      <Route path={ROUTES.DEPARTMENT.OFFICER_DETAILS} element={<ProtectedRoute requiredRole="department"><DepartmentOfficerDetails /></ProtectedRoute>} />
      <Route path={ROUTES.DEPARTMENT.SECTORS} element={<ProtectedRoute requiredRole="department"><DepartmentSectors /></ProtectedRoute>} />
      <Route path="/department/live-monitoring" element={<Navigate to={ROUTES.DEPARTMENT.DASHBOARD} replace />} />
      <Route path={ROUTES.DEPARTMENT.VIOLATIONS} element={<ProtectedRoute requiredRole="department"><DepartmentViolations /></ProtectedRoute>} />
      <Route path={ROUTES.DEPARTMENT.FINES} element={<ProtectedRoute requiredRole="department"><DepartmentFines /></ProtectedRoute>} />
      <Route path={ROUTES.DEPARTMENT.ANALYTICS} element={<ProtectedRoute requiredRole="department"><DepartmentAnalytics /></ProtectedRoute>} />
      <Route path={ROUTES.DEPARTMENT.AI_CONFIG} element={<ProtectedRoute requiredRole="department"><DepartmentAIConfiguration /></ProtectedRoute>} />
      <Route path={ROUTES.DEPARTMENT.VIOLATION_RULES} element={<ProtectedRoute requiredRole="department"><DepartmentViolationRules /></ProtectedRoute>} />
      <Route path={ROUTES.DEPARTMENT.PROFILE} element={<ProtectedRoute requiredRole="department"><DepartmentProfile /></ProtectedRoute>} />

      {/* Fallback to Landing Page */}
      <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
    </Routes>
  );
};

