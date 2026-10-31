import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireActiveAccount?: boolean;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireActiveAccount = true,
  requiredPermission,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A1B]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm text-purple-300 font-medium">Authenticating secure session...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Strict Account Status checks for Students
  if (user.role === 'student' && requireActiveAccount) {
    if (user.account_status !== 'active') {
      // Pending, rejected, or suspended students must stay on the status page
      return <Navigate to="/status" replace />;
    }
  }

  // Faculty specific permission checks
  if (user.role === 'faculty' && requiredPermission) {
    const hasPerm = user.permissions?.includes(requiredPermission) || user.permissions?.includes('all');
    if (!hasPerm) {
      return <Navigate to="/faculty/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
