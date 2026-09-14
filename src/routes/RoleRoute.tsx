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

  if (!user || !activeRole || !allowedRoles.includes(activeRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
