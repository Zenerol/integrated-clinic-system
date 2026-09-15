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
            className="p-5 sm:p-6 rounded-2xl border border-purple-200/80 dark:border-purple-500/30 bg-white dark:bg-slate-900/90 hover:border-purple-300 dark:hover:border-purple-500/50 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
          >
            {/* Row 1: Header (Patient Info Left, Badges Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100 dark:border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm shrink-0 border border-purple-500/20 shadow-xs">
                  {item.patient.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
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
                <Badge variant="purple" icon={<Stethoscope className="w-3.5 h-3.5" />}>
                  Ready for Doctor
                </Badge>
                <Badge variant={item.patient.patient_type === 'external_client' ? 'warning' : 'info'}>
                  {patientStyle.label}
                </Badge>
                {item.patient.school_id_number && (
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">
                    ID: {item.patient.school_id_number}
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

            {/* Row 3: Footer (Timestamp Left, Action Button Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Triaged: <strong>{formatDate(item.scheduled_at)}</strong></span>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onStartEncounter(item)}
                  icon={<Stethoscope className="w-4 h-4" />}
                  className="!bg-purple-700 hover:!bg-purple-800 dark:!bg-purple-600 dark:hover:!bg-purple-500 text-white font-extrabold shadow-sm"
                >
                  Start Clinical Assessment
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
