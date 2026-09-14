import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { CreateAppointmentPayload } from '../../../types/clinic.types';
import { Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookAppointmentModalProps {
  isOpen: boolean;
  isExternalPatient: boolean;
  onClose: () => void;
  onBookAppointment: (payload: CreateAppointmentPayload) => Promise<void>;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  isExternalPatient,
  onClose,
  onBookAppointment,
}) => {
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [consultationMode, setConsultationMode] = useState<'school_free' | 'external_private'>(
    isExternalPatient ? 'external_private' : 'school_free'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      setError('Please describe your chief health complaint or reason for visit.');
      return;
    }

    if (!scheduledAt) {
      setError('Please select a preferred date and time.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onBookAppointment({
        chief_complaint: chiefComplaint.trim(),
        scheduled_at: new Date(scheduledAt).toISOString(),
        consultation_mode: consultationMode,
        consultation_fee: consultationMode === 'external_private' ? 500.0 : 0.0,
      });
      setChiefComplaint('');
      setScheduledAt('');
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to book appointment';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Consultation Appointment"
      subtitle="Submit request for nurse triage & clinic review"
      size="md"
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
            Submit Booking Request
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Chief Health Complaint / Symptoms <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="e.g. Fever, sore throat, severe headache since yesterday morning..."
            className="w-full bg-slate-800/80 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-100 placeholder-slate-500 text-sm rounded-lg p-3 outline-none transition"
          />
        </div>

        <Input
          label="Preferred Appointment Date & Time"
          type="datetime-local"
          required
          leftIcon={<Calendar className="w-4 h-4" />}
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />

        <Select
          label="Consultation Mode & Coverage"
          value={consultationMode}
          onChange={(e) => setConsultationMode(e.target.value as 'school_free' | 'external_private')}
          options={[
            { value: 'school_free', label: 'Campus Member Complimentary (Free)' },
            { value: 'external_private', label: 'Community Outpatient Consultation (₱500.00)' },
          ]}
        />
      </form>
    </Modal>
  );
};
