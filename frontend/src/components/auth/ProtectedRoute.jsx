import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { ROUTES } from '../../config/routes';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const intendedRole = location.pathname.startsWith('/department') ? 'department' : 'police';
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?role=${intendedRole}&redirect=${redirectParam}`} replace />;
  }

  // Role validation
  if (requiredRole === 'department') {
    const isDeptUser = user.role === ROLES.DEPARTMENT_ADMIN || user.role === ROLES.DEPARTMENT_SUPERVISOR;
    if (!isDeptUser) {
      const redirectParam = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`/login?role=department&redirect=${redirectParam}`} replace />;
    }
  }

  if (requiredRole === 'police') {
    const isPoliceUser = user.role === ROLES.TRAFFIC_POLICE;
    if (!isPoliceUser) {
      const redirectParam = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`/login?role=police&redirect=${redirectParam}`} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
