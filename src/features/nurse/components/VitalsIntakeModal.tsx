import { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { AppointmentWithPatient, MedicalRecordWithDetails, VitalsFormPayload } from '../../../types/clinic.types';
import { medicalRecordService } from '../../../services/medicalRecordService';
import { validateVitals } from '../../../utils/vitalsValidation';
import { vitalsSchema } from '../../../utils/validationSchemas';
import { sanitizeInput } from '../../../utils/security';
import { Activity, Heart, Thermometer, Weight, FileText, CheckCircle2, AlertCircle, History, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

interface VitalsIntakeModalProps {
  isOpen: boolean;
  appointment: AppointmentWithPatient | null;
  onClose: () => void;
  onSubmitVitals: (appointmentId: string, patientId: string, vitals: VitalsFormPayload) => Promise<void>;
}

export const VitalsIntakeModal: React.FC<VitalsIntakeModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onSubmitVitals,
}) => {
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [heartRate, setHeartRate] = useState<string>('72');
  const [temperature, setTemperature] = useState<string>('36.6');
  const [weightKg, setWeightKg] = useState<string>('65');
  const [nurseNotes, setNurseNotes] = useState('');

  const [previousRecord, setPreviousRecord] = useState<MedicalRecordWithDetails | null>(null);
  const [showPrevNotes, setShowPrevNotes] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appointment?.patient_id) {
      medicalRecordService
        .getLatestRecordForPatient(appointment.patient_id)
        .then((rec) => setPreviousRecord(rec))
        .catch(() => setPreviousRecord(null));
    } else {
      setPreviousRecord(null);
    }
  }, [isOpen, appointment?.patient_id]);

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const hr = heartRate ? parseInt(heartRate, 10) : 72;
    const temp = temperature ? parseFloat(temperature) : 36.6;
    const wt = weightKg ? parseFloat(weightKg) : 65.0;

    // OWASP A03: Strict Schema Validator for Vital Signs
    const schemaResult = vitalsSchema.safeParse({
      blood_pressure: bloodPressure,
      heart_rate: hr,
      body_temperature: temp,
      respiratory_rate: 16,
      oxygen_saturation: 98,
      weight: wt,
      nurse_triage_notes: nurseNotes,
    });

    if (!schemaResult.success) {
      const formattedErrors: { [key: string]: string } = {};
      schemaResult.error.errors.forEach((err) => {
        if (err.path[0]) formattedErrors[err.path[0].toString()] = err.message;
      });
      setFieldErrors(formattedErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await onSubmitVitals(appointment.id, appointment.patient_id, {
        blood_pressure: bloodPressure,
        heart_rate: hr,
        temperature: temp,
        weight_kg: wt,
        nurse_notes: sanitizeInput(nurseNotes),
      });
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save clinical vitals';
      setGeneralError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nurse Health Check"
      subtitle={`Patient: ${appointment.patient.full_name} (${appointment.patient.school_id_number || 'Guest Patient'})`}
      size="lg"
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="success"
            isLoading={loading}
            onClick={handleSubmit}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save & Send to Doctor
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Previous Consultation Details Drawer / Inspection Box for Follow-Ups & Returning Patients */}
        {previousRecord && (
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                  {(appointment.is_follow_up || appointment.parent_appointment_id) ? 'Previous Follow-Up Medical Notes & Vitals' : 'Last Recorded Consultation Notes'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPrevNotes((prev) => !prev)}
                className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{showPrevNotes ? 'Hide Details' : 'Inspect Notes'}</span>
                {showPrevNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showPrevNotes && (
              <div className="space-y-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-800/40 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900 font-medium">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Prev BP:</span>{' '}
                    <strong className="text-slate-900 dark:text-slate-100">{previousRecord.blood_pressure || '120/80'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Prev HR:</span>{' '}
                    <strong className="text-slate-900 dark:text-slate-100">{previousRecord.heart_rate ? `${previousRecord.heart_rate} bpm` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Prev Temp:</span>{' '}
                    <strong className="text-slate-900 dark:text-slate-100">{previousRecord.temperature ? `${previousRecord.temperature}°C` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Prev Weight:</span>{' '}
                    <strong className="text-slate-900 dark:text-slate-100">{previousRecord.weight_kg ? `${previousRecord.weight_kg} kg` : 'N/A'}</strong>
                  </div>
                </div>

                {previousRecord.diagnosis && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <strong className="text-indigo-900 dark:text-indigo-300">Previous Diagnosis:</strong> {previousRecord.diagnosis}
                  </p>
                )}

                {previousRecord.doctor_notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    <strong className="text-indigo-900 dark:text-indigo-300 not-italic">Doctor Notes:</strong> "{previousRecord.doctor_notes}"
                  </p>
                )}

                {previousRecord.follow_up_instructions && (
                  <div className="p-2 rounded bg-indigo-100/70 dark:bg-indigo-900/40 text-[11px] text-indigo-950 dark:text-indigo-200 font-semibold">
                    Target Objective: {previousRecord.follow_up_instructions}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {generalError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Blood Pressure (e.g. 120/80)"
            placeholder="e.g. 120/80"
            required
            leftIcon={<Activity className="w-4 h-4" />}
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            error={fieldErrors.blood_pressure}
            helperText="Format: 120/80"
          />

          <Input
            label="Heart Rate (BPM)"
            type="number"
            placeholder="72"
            leftIcon={<Heart className="w-4 h-4" />}
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            error={fieldErrors.heart_rate}
          />

          <Input
            label="Body Temperature (°C)"
            type="number"
            step="0.1"
            placeholder="36.6"
            leftIcon={<Thermometer className="w-4 h-4" />}
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            error={fieldErrors.temperature}
          />

          <Input
            label="Weight (kg)"
            type="number"
            step="0.5"
            placeholder="65.0"
            leftIcon={<Weight className="w-4 h-4" />}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            error={fieldErrors.weight_kg}
          />
        </div>

        <div className="flex flex-col gap-1.5 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Nurse Notes & Observations
          </label>
          <textarea
            rows={3}
            value={nurseNotes}
            onChange={(e) => setNurseNotes(e.target.value)}
            placeholder="Note any symptoms, allergies, or observations..."
            className="w-full bg-slate-50/60 hover:bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-600/15 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-medium rounded-xl p-3 outline-none transition"
          />
        </div>
      </form>
    </Modal>
  );
};
