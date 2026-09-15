import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { CreateAppointmentPayload } from '../../../types/clinic.types';
import { appointmentService } from '../../../services/appointmentService';
import { AppointmentCalendarPicker } from './AppointmentCalendarPicker';
import { bookAppointmentSchema } from '../../../utils/validationSchemas';
import { sanitizeInput } from '../../../utils/security';
import { CheckCircle2, AlertCircle, Calendar as CalendarIcon, CalendarCheck } from 'lucide-react';

export interface FollowUpPrefillData {
  parent_appointment_id: string;
  assigned_doctor_id?: string | null;
  default_date?: string | null;
  reason?: string | null;
}

interface BookAppointmentModalProps {
  isOpen: boolean;
  isExternalPatient: boolean;
  followUpData?: FollowUpPrefillData | null;
  onClose: () => void;
  onBookAppointment: (payload: CreateAppointmentPayload) => Promise<void>;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  isExternalPatient,
  followUpData,
  onClose,
  onBookAppointment,
}) => {
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationMode, setConsultationMode] = useState<'school_free' | 'external_private'>(
    isExternalPatient ? 'external_private' : 'school_free'
  );

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Anti-spam click ref lock
  const isSubmittingRef = useRef(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (followUpData) {
        setChiefComplaint(
          followUpData.reason
            ? `Follow-Up Consultation: ${followUpData.reason}`
            : 'Clinical Follow-Up Visit'
        );
        if (followUpData.default_date) {
          const parsed = new Date(followUpData.default_date);
          if (!isNaN(parsed.getTime())) {
            setSelectedDate(parsed);
          }
        } else {
          setSelectedDate(null);
        }
      } else {
        setChiefComplaint('');
        setSelectedDate(null);
      }
      setSelectedTime(null);
      setError(null);
      setBookedSlots([]);
      isSubmittingRef.current = false;
    }
  }, [isOpen, followUpData]);

  // Fetch booked slots whenever selectedDate changes
  const handleSelectDate = async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setIsLoadingSlots(true);

    try {
      const allApts = await appointmentService.getAppointments();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const datePrefix = `${year}-${month}-${day}`;

      const booked = allApts
        .filter((a) => a.status !== 'cancelled' && a.status !== 'rejected')
        .filter((a) => a.scheduled_at.startsWith(datePrefix))
        .map((a) => {
          const d = new Date(a.scheduled_at);
          let hours = d.getHours();
          const minutes = String(d.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          const strHours = String(hours).padStart(2, '0');
          return `${strHours}:${minutes} ${ampm}`;
        });

      setBookedSlots(booked);
    } catch (err) {
      console.error('Failed to load booked time slots:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Anti-spam click guard
    if (loading || isSubmittingRef.current) return;

    if (!chiefComplaint.trim()) {
      setError('Please describe your chief health complaint or reason for visit.');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError('Please select an available weekday date and time slot from the calendar.');
      return;
    }

    // OWASP A03: Input Sanitization & Zod Schema Validation
    const validationResult = bookAppointmentSchema.safeParse({
      appointment_date: selectedDate ? selectedDate.toISOString() : '',
      time_slot: selectedTime || '',
      consultation_mode: consultationMode === 'external_private' ? 'teleconsultation' : 'in_person',
      chief_complaint: chiefComplaint,
    });

    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    const sanitizedComplaint = sanitizeInput(chiefComplaint);

    setError(null);
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      // Parse time string e.g. "09:00 AM" or "02:00 PM"
      const [timePart, ampm] = selectedTime.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const scheduledAtObj = new Date(selectedDate);
      scheduledAtObj.setHours(hours, minutes, 0, 0);

      await onBookAppointment({
        chief_complaint: sanitizedComplaint,
        scheduled_at: scheduledAtObj.toISOString(),
        consultation_mode: consultationMode,
        consultation_fee: consultationMode === 'external_private' ? 500.0 : 0.0,
        parent_appointment_id: followUpData?.parent_appointment_id || null,
        is_follow_up: Boolean(followUpData?.parent_appointment_id),
        assigned_doctor_id: followUpData?.assigned_doctor_id || null,
      });

      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit appointment booking';
      setError(errorMsg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const isFormValid = Boolean(chiefComplaint.trim() && selectedDate && selectedTime);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!loading) onClose();
      }}
      title="Book Doctor Visit"
      subtitle="Pick an available date and time slot from the calendar"
      size="lg"
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={loading}
            disabled={!isFormValid || loading}
            onClick={() => handleSubmit()}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {loading ? 'Booking Visit...' : 'Confirm Appointment'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {followUpData && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-center justify-between text-indigo-900 dark:text-indigo-200 text-xs font-bold">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Linked Follow-Up Visit (Parent Appointment Reference Attached)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase">
              Follow-Up
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-900 dark:text-rose-300 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Chief Complaint Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>Health Symptoms / Reason for Visit</span>
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          </label>
          <textarea
            required
            rows={2}
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="Tell us what you are feeling (e.g. fever, headache, stomach ache, cough)..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-teal-700 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold rounded-xl p-3 outline-none transition"
          />
        </div>

        {/* Interactive Calendar & Doctor Time Slots Picker */}
        <AppointmentCalendarPicker
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          bookedSlots={bookedSlots}
          onSelectDate={handleSelectDate}
          onSelectTime={(t) => setSelectedTime(t)}
          isLoadingSlots={isLoadingSlots}
        />

        {/* Consultation Mode Selection */}
        <Select
          label="Appointment Type"
          value={consultationMode}
          onChange={(e) => setConsultationMode(e.target.value as 'school_free' | 'external_private')}
          options={[
            { value: 'school_free', label: 'Student / Teacher / Staff (Free Visit)' },
            { value: 'external_private', label: 'Guest / Visitor Visit (₱500.00)' },
          ]}
        />
      </form>
    </Modal>
  );
};
