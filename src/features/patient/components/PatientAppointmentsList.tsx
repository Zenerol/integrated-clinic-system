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
      <div className="p-8 text-center text-slate-400">
        <p className="text-sm">Loading your appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/40">
        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-bold text-slate-200">No Active Consultations</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
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
            className="glass-card p-5 rounded-xl border border-slate-800 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </Badge>
                <span className="text-xs text-slate-400">
                  Scheduled for: <strong className="text-slate-200">{formatDate(item.scheduled_at)}</strong>
                </span>
              </div>

              {item.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancelAppointment(item.id)}
                  icon={<XCircle className="w-4 h-4 text-rose-400" />}
                  className="text-xs text-rose-400 hover:bg-rose-500/10"
                >
                  Cancel Request
                </Button>
              )}
            </div>

            {/* Chief Complaint */}
            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
              <strong className="text-slate-400">Chief Complaint:</strong> {item.chief_complaint}
            </p>

            {/* Rejection notice if rejected */}
            {item.status === 'rejected' && item.rejection_reason && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span><strong>Rejection Reason:</strong> {item.rejection_reason}</span>
              </div>
            )}

            {/* Workflow Progress Bar */}
            {item.status !== 'rejected' && item.status !== 'cancelled' && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Live Consultation Pipeline:
                </p>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
                  <div className={`py-1.5 rounded ${step >= 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500'}`}>
                    1. Requested
                  </div>
                  <div className={`py-1.5 rounded ${step >= 2 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'}`}>
                    2. Approved
                  </div>
                  <div className={`py-1.5 rounded ${step >= 3 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'}`}>
                    3. In Triage
                  </div>
                  <div className={`py-1.5 rounded ${step >= 4 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-500'}`}>
                    4. With Doctor
                  </div>
                  <div className={`py-1.5 rounded ${step >= 5 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-500'}`}>
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
