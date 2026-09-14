import React from 'react';
import { AppointmentWithPatient } from '../../../types/clinic.types';
import { getPatientTypeBadgeStyle, formatDate } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { CheckCircle2, XCircle, Clock, User, Calendar } from 'lucide-react';

interface PendingRequestsListProps {
  appointments: AppointmentWithPatient[];
  loading: boolean;
  onApprove: (appointment: AppointmentWithPatient) => Promise<void>;
  onReject: (appointment: AppointmentWithPatient) => void;
}

export const PendingRequestsList: React.FC<PendingRequestsListProps> = ({
  appointments,
  loading,
  onApprove,
  onReject,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-600 dark:text-slate-400">
        <p className="text-sm font-semibold">Loading appointment requests...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/40">
        <Clock className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-base font-extrabold text-slate-900 dark:text-slate-200">No Pending Requests</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1 font-medium">
          New student and outpatient consultation bookings will show up here for review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((item) => {
        const badgeStyle = getPatientTypeBadgeStyle(item.patient.patient_type);

        return (
          <div
            key={item.id}
            className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
          >
            {/* Patient & Complaint Details */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={item.patient.patient_type === 'external_client' ? 'warning' : item.patient.patient_type === 'faculty_staff' ? 'success' : 'info'}>
                  {badgeStyle.label}
                </Badge>
                {item.patient.school_id_number && (
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-bold">
                    ID: {item.patient.school_id_number}
                  </span>
                )}
                {item.patient.department_or_course && (
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    ({item.patient.department_or_course})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{item.patient.full_name}</h4>
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                <strong className="text-slate-900 dark:text-slate-300 font-bold">Chief Complaint:</strong> {item.chief_complaint}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1 font-semibold">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-slate-400" />
                  Scheduled: {formatDate(item.scheduled_at)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(item)}
                icon={<XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApprove(item)}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve Slot
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
