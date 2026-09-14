import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { AppointmentWithPatient } from '../../../types/clinic.types';
import { AlertCircle, XCircle } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  appointment: AppointmentWithPatient | null;
  onClose: () => void;
  onConfirmReject: (appointmentId: string, reason: string) => Promise<void>;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a mandatory reason for rejecting this appointment.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onConfirmReject(appointment.id, reason.trim());
      setReason('');
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject appointment';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Decline Appointment Request"
      subtitle={`Patient: ${appointment.patient.full_name}`}
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={loading}
            onClick={handleSubmit}
            icon={<XCircle className="w-4 h-4" />}
          >
            Confirm Decline
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

        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          The reason for declining will be sent to the patient so they can pick another date or time.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Reason for Declining <span className="text-rose-600 dark:text-rose-400 font-black">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Doctor is in meeting at this hour; please pick another time slot..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-xl p-3 outline-none transition font-medium"
          />
        </div>
      </form>
    </Modal>
  );
};
