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
      <div className="p-8 text-center text-slate-400">
        <p className="text-sm">Loading active queue...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/40">
        <HeartPulse className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-bold text-slate-200">No Patients in Clinic Queue</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
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
            className="glass-card p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
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
                  <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    ID: {item.patient.school_id_number}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <h4 className="text-base font-bold text-slate-100">{item.patient.full_name}</h4>
              </div>

              <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <strong className="text-slate-400">Chief Complaint:</strong> {item.chief_complaint}
              </p>

              {item.check_in_time && (
                <p className="text-xs text-cyan-400 flex items-center gap-1">
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
