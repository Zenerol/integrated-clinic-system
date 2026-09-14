import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/database.types';
import { Spinner } from '../components/ui/Spinner';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { profile, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" label="Verifying access permissions..." />
      </div>
    );
  }

  const activeRole = profile?.role || (user?.user_metadata?.role as UserRole | undefined);
  const accountStatus = profile?.account_status || 'active'; // default active for legacy/client

  // If user role is not in allowedRoles list -> Unauthorized
  if (!user || !activeRole || !allowedRoles.includes(activeRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // OWASP A01 & Directive 4: Guard Hardening
  // Block any non-active staff member from accessing clinical routes (/doctor/* or /nurse/*)
  if ((activeRole === 'doctor' || activeRole === 'nurse') && accountStatus !== 'active') {
    return <Navigate to="/awaiting-approval" replace />;
  }

  return <Outlet />;
};
