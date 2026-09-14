import { AppointmentStatus, PatientCategory, UserRole, NotificationType } from '../types/database.types';

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

export const getStatusBadgeStyle = (status: AppointmentStatus): { bg: string; text: string; label: string } => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Pending Review' };
    case 'approved':
      return { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Approved' };
    case 'in_triage':
      return { bg: 'bg-cyan-500/10 border-cyan-500/30', text: 'text-cyan-400', label: 'In Triage' };
    case 'with_doctor':
      return { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400', label: 'With Doctor' };
    case 'completed':
      return { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'Completed' };
    case 'rejected':
      return { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400', label: 'Rejected' };
    case 'cancelled':
      return { bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400', label: 'Cancelled' };
    default:
      return { bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400', label: status };
  }
};

export const getPatientTypeBadgeStyle = (type?: PatientCategory | null): { bg: string; text: string; label: string } => {
  switch (type) {
    case 'student':
      return { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'Student' };
    case 'faculty_staff':
      return { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Faculty / Staff' };
    case 'external_client':
      return { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'External Outpatient' };
    default:
      return { bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400', label: 'Outpatient' };
  }
};

export const getNotificationTypeStyle = (type: NotificationType): { bg: string; text: string; border: string } => {
  switch (type) {
    case 'urgent':
      return { bg: 'bg-rose-950/80', text: 'text-rose-200', border: 'border-rose-500/50' };
    case 'warning':
      return { bg: 'bg-amber-950/80', text: 'text-amber-200', border: 'border-amber-500/50' };
    case 'success':
      return { bg: 'bg-emerald-950/80', text: 'text-emerald-200', border: 'border-emerald-500/50' };
    case 'info':
    default:
      return { bg: 'bg-blue-950/80', text: 'text-blue-200', border: 'border-blue-500/50' };
  }
};
