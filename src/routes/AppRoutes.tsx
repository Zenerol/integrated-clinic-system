import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthLayout } from '../components/layout/AuthLayout';

// Feature Components
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { StaffRegisterPage } from '../features/auth/StaffRegisterPage';
import { AwaitingApprovalPage } from '../features/auth/AwaitingApprovalPage';
import { DoctorDashboard } from '../features/doctor/DoctorDashboard';
import { NurseDashboard } from '../features/nurse/NurseDashboard';
import { PatientDashboard } from '../features/patient/PatientDashboard';
import { AdminStaffApprovalsDashboard } from '../features/admin/AdminStaffApprovalsDashboard';
import { UnauthorizedPage } from '../features/common/UnauthorizedPage';
import { NotFoundPage } from '../features/common/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/staff/register" element={<StaffRegisterPage />} />
      </Route>

      {/* Protected Pending Verification View */}
      <Route element={<ProtectedRoute />}>
        <Route path="/awaiting-approval" element={<AwaitingApprovalPage />} />

        {/* Dashboard Shell Routes */}
        <Route element={<DashboardLayout />}>
          {/* Admin Panel (Guarded: admin) */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/*" element={<AdminStaffApprovalsDashboard />} />
            <Route path="/admin/staff-approvals" element={<AdminStaffApprovalsDashboard />} />
            <Route path="/admin/members" element={<AdminStaffApprovalsDashboard />} />
          </Route>

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
