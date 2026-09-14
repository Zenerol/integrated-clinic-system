import React from 'react';
import { AppointmentWithPatient } from '../../../types/clinic.types';
import { getPatientTypeBadgeStyle, formatDate } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Stethoscope, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface DoctorQueueListProps {
  appointments: AppointmentWithPatient[];
  loading: boolean;
  onStartEncounter: (appointment: AppointmentWithPatient) => void;
}

export const DoctorQueueList: React.FC<DoctorQueueListProps> = ({
  appointments,
  loading,
  onStartEncounter,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-600 dark:text-slate-400">
        <p className="text-sm font-semibold">Loading doctor patient queue...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/40">
        <Stethoscope className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-base font-extrabold text-slate-900 dark:text-slate-200">No Patients Awaiting Doctor Assessment</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1 font-medium">
          When the nurse logs vitals and passes a patient to 'With Doctor', they will appear here ready for evaluation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((item) => {
        const patientStyle = getPatientTypeBadgeStyle(item.patient.patient_type);

        return (
          <div
            key={item.id}
            className="glass-card p-5 rounded-2xl border border-purple-200 dark:border-purple-500/20 bg-white dark:bg-slate-900/80 hover:border-purple-300 dark:hover:border-purple-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="purple" icon={<Stethoscope className="w-3.5 h-3.5" />}>
                  Ready for Doctor
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
                <User className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{item.patient.full_name}</h4>
              </div>

              <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                <strong className="text-slate-900 dark:text-slate-300 font-bold">Chief Complaint:</strong> {item.chief_complaint}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-700 dark:text-slate-400" />
                  Triaged: {formatDate(item.scheduled_at)}
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => onStartEncounter(item)}
                icon={<Stethoscope className="w-4 h-4" />}
                className="!bg-purple-700 hover:!bg-purple-800 dark:!bg-purple-600 dark:hover:!bg-purple-500 text-white font-extrabold"
              >
                Start Clinical Assessment
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
