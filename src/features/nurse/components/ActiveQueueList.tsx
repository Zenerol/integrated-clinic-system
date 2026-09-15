import React from 'react';
import { AppointmentWithPatient } from '../../../types/clinic.types';
import { getStatusBadgeStyle, getPatientTypeBadgeStyle, formatDate } from '../../../utils/formatters';
import { maskIdNumber } from '../../../utils/security';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { HeartPulse, CheckCircle2, User, Stethoscope, Clock } from 'lucide-react';

interface ActiveQueueListProps {
  appointments: AppointmentWithPatient[];
  loading: boolean;
  onCheckInAndRecordVitals: (appointment: AppointmentWithPatient) => void;
}

export const ActiveQueueList: React.FC<ActiveQueueListProps> = ({
  appointments,
  loading,
  onCheckInAndRecordVitals,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-600 dark:text-slate-400">
        <p className="text-sm font-semibold">Loading active queue...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/40">
        <HeartPulse className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-base font-extrabold text-slate-900 dark:text-slate-200">No Patients in Clinic Queue</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1 font-medium">
          Approved appointments will be displayed here for on-site triage and vitals recording.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((item) => {
        const statusStyle = getStatusBadgeStyle(item.status);
        const patientStyle = getPatientTypeBadgeStyle(item.patient.patient_type);

        return (
          <div
            key={item.id}
            className="p-5 sm:p-6 rounded-2xl border border-emerald-200/80 dark:border-emerald-500/30 bg-white dark:bg-slate-900/90 hover:border-emerald-300 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
          >
            {/* Row 1: Header (Patient Info Left, Badges Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-500/20 shadow-xs">
                  {item.patient.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {item.patient.full_name}
                  </h4>
                  {item.patient.department_or_course && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {item.patient.department_or_course}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(item.is_follow_up || item.parent_appointment_id) && (
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30 px-2 py-0.5 rounded-full text-xs font-semibold">
                    Follow-Up Case
                  </span>
                )}
                <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </Badge>
                <Badge variant={item.patient.patient_type === 'external_client' ? 'warning' : 'info'}>
                  {patientStyle.label}
                </Badge>
                {item.patient.school_id_number && (
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">
                    ID: {maskIdNumber(item.patient.school_id_number)}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Chief Complaint Callout Box (Full Width) */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] block mb-1">
                Chief Complaint / Health Symptoms:
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                {item.chief_complaint}
              </p>
            </div>

            {/* Row 3: Footer (Timestamp Left, Actions Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {item.check_in_time ? (
                  <span className="flex items-center gap-1.5 text-teal-800 dark:text-cyan-400 font-bold">
                    <Clock className="w-4 h-4 shrink-0" /> Checked in at: {formatDate(item.check_in_time)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Scheduled: <strong>{formatDate(item.scheduled_at)}</strong></span>
                  </span>
                )}
              </div>

              <div className="flex justify-end">
                {item.status === 'approved' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => onCheckInAndRecordVitals(item)}
                    icon={<HeartPulse className="w-4 h-4" />}
                  >
                    Check In & Record Vitals
                  </Button>
                )}

                {item.status === 'in_triage' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onCheckInAndRecordVitals(item)}
                    icon={<Stethoscope className="w-4 h-4" />}
                  >
                    Edit Vitals & Pass to Doctor
                  </Button>
                )}

                {item.status === 'with_doctor' && (
                  <Badge variant="purple" icon={<Stethoscope className="w-3.5 h-3.5" />}>
                    Consulting with Doctor
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
