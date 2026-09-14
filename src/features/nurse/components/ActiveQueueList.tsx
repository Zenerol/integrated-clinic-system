import React from 'react';
import { AppointmentWithPatient } from '../../../types/clinic.types';
import { getStatusBadgeStyle, getPatientTypeBadgeStyle, formatDate } from '../../../utils/formatters';
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
            className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
          >
            {/* Queue Details */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </Badge>
                <Badge variant={item.patient.patient_type === 'external_client' ? 'warning' : 'info'}>
                  {patientStyle.label}
                </Badge>
                {item.patient.school_id_number && (
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-bold">
                    ID: {item.patient.school_id_number}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{item.patient.full_name}</h4>
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                <strong className="text-slate-900 dark:text-slate-300 font-bold">Chief Complaint:</strong> {item.chief_complaint}
              </p>

              {item.check_in_time && (
                <p className="text-xs text-teal-800 dark:text-cyan-400 flex items-center gap-1 font-bold">
                  <Clock className="w-3.5 h-3.5" /> Checked in at: {formatDate(item.check_in_time)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="w-full md:w-auto flex justify-end">
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
        );
      })}
    </div>
  );
};
