import React from 'react';
import { MedicalRecordWithDetails } from '../../../types/clinic.types';
import { formatDate } from '../../../utils/formatters';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { FileCheck, Pill, Activity, Printer } from 'lucide-react';

interface PatientHistoryListProps {
  records: MedicalRecordWithDetails[];
  loading: boolean;
  onOpenDocumentModal: (record: MedicalRecordWithDetails) => void;
}

export const PatientHistoryList: React.FC<PatientHistoryListProps> = ({
  records,
  loading,
  onOpenDocumentModal,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-sm">Loading clinical record history...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/40">
        <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-bold text-slate-200">No Past Consultations</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          Once your medical visits are finalized by the physician, your diagnosis, vitals, prescriptions, and clearance slips will be stored here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((rec) => (
        <div key={rec.id} className="glass-card p-5 rounded-xl border border-slate-800 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="purple" icon={<FileCheck className="w-3.5 h-3.5" />}>
                Finalized Record
              </Badge>
              <span className="text-xs text-slate-400">
                Encounter Date: <strong className="text-slate-200">{formatDate(rec.created_at)}</strong>
              </span>
            </div>

            {rec.clearance_type && rec.clearance_type !== 'none' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenDocumentModal(rec)}
                icon={<Printer className="w-3.5 h-3.5 text-teal-400" />}
              >
                View / Print Medical Certificate
              </Button>
            )}
          </div>

          {/* Vitals Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400">BP:</span>{' '}
              <strong className="text-slate-200">{rec.blood_pressure || '120/80'}</strong>
            </div>
            <div>
              <span className="text-slate-400">HR:</span>{' '}
              <strong className="text-slate-200">{rec.heart_rate ? `${rec.heart_rate} bpm` : 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-400">Temp:</span>{' '}
              <strong className="text-slate-200">{rec.temperature ? `${rec.temperature}°C` : 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-400">Weight:</span>{' '}
              <strong className="text-slate-200">{rec.weight_kg ? `${rec.weight_kg} kg` : 'N/A'}</strong>
            </div>
          </div>

          {/* Diagnosis & Plan */}
          <div className="space-y-2 text-xs">
            <p className="text-slate-300">
              <strong className="text-teal-400">Diagnosis:</strong> {rec.diagnosis || 'Standard Health Check'}
            </p>
            {rec.treatment_plan && (
              <p className="text-slate-300">
                <strong className="text-slate-400">Treatment Plan:</strong> {rec.treatment_plan}
              </p>
            )}
          </div>

          {/* Prescriptions List */}
          {rec.prescriptions && rec.prescriptions.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" /> Prescribed Medications ({rec.prescriptions.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rec.prescriptions.map((rx) => (
                  <div key={rx.id} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                    <p className="font-bold text-slate-100">{rx.medication_name} ({rx.dosage})</p>
                    <p className="text-slate-400 text-[11px]">Frequency: {rx.frequency}</p>
                    {rx.instructions && (
                      <p className="text-slate-400 text-[11px] italic mt-0.5">Note: {rx.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
