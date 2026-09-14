import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { AppointmentWithPatient, VitalsFormPayload } from '../../../types/clinic.types';
import { validateVitals } from '../../../utils/vitalsValidation';
import { Activity, Heart, Thermometer, Weight, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const hr = heartRate ? parseInt(heartRate, 10) : null;
    const temp = temperature ? parseFloat(temperature) : null;
    const wt = weightKg ? parseFloat(weightKg) : null;

    // Validate vitals format
    const validation = validateVitals({
      blood_pressure: bloodPressure,
      heart_rate: hr,
      temperature: temp,
      weight_kg: wt,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
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
        nurse_notes: nurseNotes,
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
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Nurse Notes & Observations
          </label>
          <textarea
            rows={3}
            value={nurseNotes}
            onChange={(e) => setNurseNotes(e.target.value)}
            placeholder="Note any symptoms, allergies, or observations..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl p-3 outline-none transition font-medium"
          />
        </div>
      </form>
    </Modal>
  );
};
