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

            {/* Workflow Progress Bar (Cohesive Clinical Teal Stepper) */}
            {item.status !== 'rejected' && item.status !== 'cancelled' && (
              <div className="pt-2">
                <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  Appointment Progress:
                </p>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-extrabold">
                  {[
                    { num: 1, label: '1. Requested' },
                    { num: 2, label: '2. Approved' },
                    { num: 3, label: '3. Nurse Intake' },
                    { num: 4, label: '4. Doctor Consult' },
                    { num: 5, label: '5. Completed' },
                  ].map((s) => {
                    const isCompleted = step > s.num;
                    const isCurrent = step === s.num;

                    if (isCompleted) {
                      return (
                        <div
                          key={s.num}
                          className="py-2.5 px-1 rounded-xl bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-300/80 dark:border-teal-500/40 shadow-xs flex items-center justify-center gap-1 font-bold"
                        >
                          <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span className="truncate">{s.label}</span>
                        </div>
                      );
                    }

                    if (isCurrent) {
                      return (
                        <div
                          key={s.num}
                          className="py-2.5 px-1 rounded-xl bg-teal-700 text-white dark:bg-teal-600 border border-teal-800 dark:border-teal-500 shadow-sm font-black flex items-center justify-center gap-1.5 animate-pulse"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
                          <span className="truncate">{s.label}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={s.num}
                        className="py-2.5 px-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800 font-semibold truncate"
                      >
                        {s.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
