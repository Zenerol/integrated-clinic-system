import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthLayout } from '../components/layout/AuthLayout';

// Feature Components
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { DoctorDashboard } from '../features/doctor/DoctorDashboard';
import { NurseDashboard } from '../features/nurse/NurseDashboard';
import { PatientDashboard } from '../features/patient/PatientDashboard';
import { UnauthorizedPage } from '../features/common/UnauthorizedPage';
import { NotFoundPage } from '../features/common/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes wrapped in Dashboard Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Doctor Portal (Guarded: doctor) */}
          <Route element={<RoleRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor/*" element={<DoctorDashboard />} />
          </Route>

          {/* Nurse Portal (Guarded: nurse) */}
          <Route element={<RoleRoute allowedRoles={['nurse']} />}>
            <Route path="/nurse/*" element={<NurseDashboard />} />
          </Route>

          {/* Patient Portal (Guarded: client) */}
          <Route element={<RoleRoute allowedRoles={['client']} />}>
            <Route path="/portal/*" element={<PatientDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Access Denied & Fallbacks */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
