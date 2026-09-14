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
      title="Reject Appointment Request"
      subtitle={`Patient: ${appointment.patient.full_name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={loading}
            onClick={handleSubmit}
            icon={<XCircle className="w-4 h-4" />}
          >
            Confirm Rejection
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

        <p className="text-xs text-slate-300">
          Rejection reasons will be logged in the appointment history and automatically sent to the patient.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Mandatory Rejection Reason <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Requested time slot is unavailable; please re-book for tomorrow morning."
            className="w-full bg-slate-800/80 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-100 placeholder-slate-500 text-sm rounded-lg p-3 outline-none transition"
          />
        </div>
      </form>
    </Modal>
  );
};
