import React from 'react';
import { AppointmentWithPatient } from '../../../types/clinic.types';
import { getStatusBadgeStyle, formatDate, formatCurrency } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Calendar, Clock, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PatientAppointmentsListProps {
  appointments: AppointmentWithPatient[];
  loading: boolean;
  onCancelAppointment: (appointmentId: string) => Promise<void>;
}

export const PatientAppointmentsList: React.FC<PatientAppointmentsListProps> = ({
  appointments,
  loading,
  onCancelAppointment,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-600 dark:text-slate-400">
        <p className="text-sm font-semibold">Loading your appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/40">
        <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-base font-extrabold text-slate-900 dark:text-slate-200">No Active Consultations</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1 font-medium">
          Click 'Book Appointment' above to schedule a consultation with the campus/community clinic.
        </p>
      </div>
    );
  }

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'approved':
        return 2;
      case 'in_triage':
        return 3;
      case 'with_doctor':
        return 4;
      case 'completed':
        return 5;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      {appointments.map((item) => {
        const statusStyle = getStatusBadgeStyle(item.status);
        const step = getStepProgress(item.status);

        return (
          <div
            key={item.id}
            className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </Badge>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  Scheduled for: <strong className="text-slate-900 dark:text-slate-100 font-bold">{formatDate(item.scheduled_at)}</strong>
                </span>
              </div>

              {item.status === 'pending' && (
                <Button
                  variant="cancel"
                  size="sm"
                  onClick={() => onCancelAppointment(item.id)}
                  icon={<XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                >
                  Cancel Request
                </Button>
              )}
            </div>

            {/* Chief Complaint Callout Box */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] block mb-1">
                Health Symptoms / Consultation Reason:
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                {item.chief_complaint}
              </p>
            </div>

            {/* Rejection notice if rejected */}
            {item.status === 'rejected' && item.rejection_reason && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span><strong>Reason Declining Visit:</strong> {item.rejection_reason}</span>
              </div>
            )}

            {/* Workflow Progress Bar */}
            {item.status !== 'rejected' && item.status !== 'cancelled' && (
              <div className="pt-2">
                <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Appointment Progress:
                </p>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-extrabold">
                  <div className={`py-2 px-1 rounded-lg transition ${step >= 1 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-xs' : 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
                    1. Requested
                  </div>
                  <div className={`py-2 px-1 rounded-lg transition ${step >= 2 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-xs' : 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
                    2. Approved
                  </div>
                  <div className={`py-2 px-1 rounded-lg transition ${step >= 3 ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40 shadow-xs' : 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
                    3. Nurse Check-In
                  </div>
                  <div className={`py-2 px-1 rounded-lg transition ${step >= 4 ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-xs' : 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
                    4. With Doctor
                  </div>
                  <div className={`py-2 px-1 rounded-lg transition ${step >= 5 ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 shadow-xs' : 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800'}`}>
                    5. Completed
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
