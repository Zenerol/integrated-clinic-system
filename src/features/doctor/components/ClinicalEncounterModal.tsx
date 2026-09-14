import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { AppointmentWithPatient, ClinicalAssessmentPayload, MedicalRecordWithDetails } from '../../../types/clinic.types';
import { ClearanceType } from '../../../types/database.types';
import { PrescriptionBuilder, PrescriptionItemInput } from './PrescriptionBuilder';
import { Stethoscope, CheckCircle2, FileText, Activity, Heart, Thermometer, Weight, AlertCircle } from 'lucide-react';

interface ClinicalEncounterModalProps {
  isOpen: boolean;
  appointment: AppointmentWithPatient | null;
  existingRecord: MedicalRecordWithDetails | null;
  onClose: () => void;
  onSubmitEncounter: (
    appointmentId: string,
    patientId: string,
    assessment: ClinicalAssessmentPayload
  ) => Promise<void>;
}

export const ClinicalEncounterModal: React.FC<ClinicalEncounterModalProps> = ({
  isOpen,
  appointment,
  existingRecord,
  onClose,
  onSubmitEncounter,
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [clearanceType, setClearanceType] = useState<ClearanceType>('fit_to_study');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItemInput[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError('Please provide a clinical diagnosis.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onSubmitEncounter(appointment.id, appointment.patient_id, {
        diagnosis,
        treatment_plan: treatmentPlan,
        doctor_notes: doctorNotes,
        clearance_type: clearanceType,
        prescriptions: prescriptions.map((p) => ({
          medication_name: p.medication_name,
          dosage: p.dosage,
          frequency: p.frequency,
          instructions: p.instructions,
        })),
      });
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to finalize clinical encounter';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Clinical Evaluation & Medical Certificate Generator"
      subtitle={`Patient: ${appointment.patient.full_name}`}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={loading}
            onClick={handleSubmit}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Finalize Encounter & Complete Visit
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Nurse Triage Vitals Banner */}
        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Nurse Triage Vitals & Notes
            </h4>
            <span className="text-[11px] text-slate-400">Recorded on intake</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400">BP:</span>{' '}
              <strong className="text-slate-200">{existingRecord?.blood_pressure || '120/80'}</strong>
            </div>
            <div>
              <span className="text-slate-400">HR:</span>{' '}
              <strong className="text-slate-200">
                {existingRecord?.heart_rate ? `${existingRecord.heart_rate} bpm` : '72 bpm'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Temp:</span>{' '}
              <strong className="text-slate-200">
                {existingRecord?.temperature ? `${existingRecord.temperature}°C` : '36.6°C'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Weight:</span>{' '}
              <strong className="text-slate-200">
                {existingRecord?.weight_kg ? `${existingRecord.weight_kg} kg` : '65 kg'}
              </strong>
            </div>
          </div>

          {existingRecord?.nurse_notes && (
            <p className="text-xs text-slate-300 italic pt-1">
              <strong className="text-slate-400">Nurse Notes:</strong> "{existingRecord.nurse_notes}"
            </p>
          )}
        </div>

        {/* Diagnosis & Notes */}
        <div className="space-y-4">
          <Input
            label="Clinical Diagnosis"
            placeholder="e.g. Upper Respiratory Tract Infection (URTI)"
            required
            leftIcon={<Stethoscope className="w-4 h-4" />}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Treatment Plan & Advice
              </label>
              <textarea
                rows={3}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Prescribed rest, oral rehydration, follow up in 3 days..."
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-100 text-sm rounded-lg p-3 outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Doctor Private Notes / Remarks
              </label>
              <textarea
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Internal clinical observations..."
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-100 text-sm rounded-lg p-3 outline-none transition"
              />
            </div>
          </div>

          {/* Document Clearance Type Selector */}
          <Select
            label="Document / Clearance Slip Generator"
            value={clearanceType}
            onChange={(e) => setClearanceType(e.target.value as ClearanceType)}
            options={[
              { value: 'fit_to_study', label: 'Fit-to-Study Clearance Slip (For Students)' },
              { value: 'fit_to_work', label: 'Fit-to-Work Clearance Slip (For Faculty/Staff)' },
              { value: 'standard_cert', label: 'Standard Outpatient Medical Certificate (For Community)' },
              { value: 'none', label: 'No Certificate Issued' },
            ]}
          />
        </div>

        {/* Electronic Prescription Builder */}
        <PrescriptionBuilder items={prescriptions} onChange={setPrescriptions} />
      </form>
    </Modal>
  );
};
