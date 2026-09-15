import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { AppointmentWithPatient, ClinicalAssessmentPayload, MedicalRecordWithDetails } from '../../../types/clinic.types';
import { ClearanceType } from '../../../types/database.types';
import { PrescriptionBuilder, PrescriptionItemInput } from './PrescriptionBuilder';
import { clinicalEncounterSchema } from '../../../utils/validationSchemas';
import { sanitizeInput } from '../../../utils/security';
import { Stethoscope, CheckCircle2, FileText, Activity, Heart, Thermometer, Weight, AlertCircle, CalendarCheck } from 'lucide-react';

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
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItemInput[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // OWASP A03: Schema validation for Doctor Encounter
    const schemaResult = clinicalEncounterSchema.safeParse({
      diagnosis,
      treatment_notes: treatmentPlan || 'Follow doctor advice and rest.',
      prescriptions: prescriptions.map((p) => ({
        medication_name: p.medication_name,
        dosage: p.dosage,
        frequency: p.frequency,
        duration: p.duration || '3 days',
        instructions: p.instructions || '',
      })),
    });

    if (!schemaResult.success) {
      setError(schemaResult.error.errors[0].message);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onSubmitEncounter(appointment.id, appointment.patient_id, {
        diagnosis: sanitizeInput(diagnosis),
        treatment_plan: sanitizeInput(treatmentPlan),
        doctor_notes: sanitizeInput(doctorNotes),
        clearance_type: clearanceType,
        requires_follow_up: requiresFollowUp,
        follow_up_date: requiresFollowUp ? followUpDate : null,
        follow_up_instructions: requiresFollowUp ? sanitizeInput(followUpInstructions) : undefined,
        prescriptions: prescriptions.map((p) => ({
          medication_name: sanitizeInput(p.medication_name),
          dosage: sanitizeInput(p.dosage),
          frequency: sanitizeInput(p.frequency),
          instructions: p.instructions ? sanitizeInput(p.instructions) : '',
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
      title="Doctor Checkup & Medical Certificate"
      subtitle={`Patient: ${appointment.patient.full_name}`}
      size="xl"
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={loading}
            onClick={handleSubmit}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Checkup & Complete Visit
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

        {/* Nurse Health Check Vitals Banner */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Nurse Health Check Details
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Recorded by Nurse</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-medium">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold">BP:</span>{' '}
              <strong className="text-slate-900 dark:text-slate-100">{existingRecord?.blood_pressure || '120/80'}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Heart Rate:</span>{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {existingRecord?.heart_rate ? `${existingRecord.heart_rate} bpm` : '72 bpm'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Temp:</span>{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {existingRecord?.temperature ? `${existingRecord.temperature}°C` : '36.6°C'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Weight:</span>{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {existingRecord?.weight_kg ? `${existingRecord.weight_kg} kg` : '65 kg'}
              </strong>
            </div>
          </div>

          {existingRecord?.nurse_notes && (
            <p className="text-xs text-slate-700 dark:text-slate-300 italic pt-1 font-medium">
              <strong className="text-slate-800 dark:text-slate-400">Nurse Notes:</strong> "{existingRecord.nurse_notes}"
            </p>
          )}
        </div>

        {/* Diagnosis & Notes */}
        <div className="space-y-4">
          <Input
            label="Doctor Findings / Diagnosis"
            placeholder="e.g. Common Cold, Fever, Allergic Rhinitis..."
            required
            leftIcon={<Stethoscope className="w-4 h-4" />}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Treatment Advice for Patient
              </label>
              <textarea
                rows={3}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Drink plenty of water, rest for 2 days, return if fever persists..."
                className="w-full bg-slate-50/60 hover:bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-600/15 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium rounded-xl p-3 outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Doctor Private Notes
              </label>
              <textarea
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Internal clinic remarks..."
                className="w-full bg-slate-50/60 hover:bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-600/15 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium rounded-xl p-3 outline-none transition"
              />
            </div>
          </div>

          {/* Document Clearance Type Selector */}
          <Select
            label="Issue Medical Certificate?"
            value={clearanceType}
            onChange={(e) => setClearanceType(e.target.value as ClearanceType)}
            options={[
              { value: 'fit_to_study', label: 'School Medical Certificate (For Students)' },
              { value: 'fit_to_work', label: 'Work Medical Certificate (For Teachers / Staff)' },
              { value: 'standard_cert', label: 'Standard Medical Certificate (For Guests / Visitors)' },
              { value: 'none', label: 'No Certificate Needed' },
            ]}
          />

          {/* Follow-Up Consultation Control */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requiresFollowUp}
                onChange={(e) => {
                  setRequiresFollowUp(e.target.checked);
                  if (e.target.checked && !followUpDate) {
                    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    setFollowUpDate(nextWeek);
                  }
                }}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Schedule Follow-Up Visit Recommendation
              </span>
            </label>

            {requiresFollowUp && (
              <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/40 space-y-3 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Recommended Date & Quick Presets
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="!w-44"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setFollowUpDate(date);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 transition cursor-pointer border border-indigo-200 dark:border-indigo-700/50"
                      >
                        +3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setFollowUpDate(date);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 transition cursor-pointer border border-indigo-200 dark:border-indigo-700/50"
                      >
                        +1 Week
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                          setFollowUpDate(date);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 transition cursor-pointer border border-indigo-200 dark:border-indigo-700/50"
                      >
                        +2 Weeks
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Follow-Up Clinical Objective & Instructions
                  </label>
                  <input
                    type="text"
                    value={followUpInstructions}
                    onChange={(e) => setFollowUpInstructions(e.target.value)}
                    placeholder="e.g. Re-check blood pressure and adjust medication dosage"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900 dark:text-slate-100 text-xs rounded-lg p-2.5 outline-none transition font-medium"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Electronic Prescription Builder */}
        <PrescriptionBuilder items={prescriptions} onChange={setPrescriptions} />
      </form>
    </Modal>
  );
};
