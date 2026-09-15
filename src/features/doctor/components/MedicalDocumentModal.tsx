import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { AppointmentWithPatient, MedicalRecordWithDetails } from '../../../types/clinic.types';
import { formatDate } from '../../../utils/formatters';
import { Printer, ShieldCheck, FileText, Activity } from 'lucide-react';

interface MedicalDocumentModalProps {
  isOpen: boolean;
  appointment: AppointmentWithPatient | null;
  record: MedicalRecordWithDetails | null;
  doctorName?: string;
  onClose: () => void;
}

export const MedicalDocumentModal: React.FC<MedicalDocumentModalProps> = ({
  isOpen,
  appointment,
  record,
  doctorName = 'Dr. Alex Mercer, MD',
  onClose,
}) => {
  if (!appointment || !record) return null;

  const isCampusPatient = appointment.patient.patient_type !== 'external_client';
  const docTitle = isCampusPatient
    ? appointment.patient.patient_type === 'student'
      ? 'FIT-TO-STUDY CLINICAL CLEARANCE SLIP'
      : 'FIT-TO-WORK CLINICAL CLEARANCE SLIP'
    : 'OUTPATIENT MEDICAL CERTIFICATE';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medical Certificate Preview"
      subtitle={docTitle}
      size="lg"
      footer={
        <>
          <Button variant="cancel" onClick={onClose}>
            Close Window
          </Button>
          <Button variant="primary" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            Print / Save PDF
          </Button>
        </>
      }
    >
      {/* Printable Clinical Slip Layout */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-900 space-y-6 shadow-xs font-sans">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 shrink-0 shadow-2xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase text-slate-900">{docTitle}</h2>
              <p className="text-xs text-slate-500 font-medium">
                Hybrid School & Community Health Clinic Service
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-slate-700">Date Issued:</p>
            <p className="font-semibold text-slate-900">{formatDate(record.created_at)}</p>
          </div>
        </div>

        {/* Patient Profile Metadata */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Patient Name:</p>
            <p className="font-extrabold text-slate-900 text-sm mt-0.5">{appointment.patient.full_name}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Category / Type:</p>
            <p className="font-extrabold text-slate-900 capitalize mt-0.5">
              {appointment.patient.patient_type?.replace('_', ' ')}
            </p>
          </div>
          {appointment.patient.school_id_number && (
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">School ID Number:</p>
              <p className="font-extrabold text-slate-900 mt-0.5">{appointment.patient.school_id_number}</p>
            </div>
          )}
          {appointment.patient.department_or_course && (
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Department / Course:</p>
              <p className="font-extrabold text-slate-900 mt-0.5">{appointment.patient.department_or_course}</p>
            </div>
          )}
        </div>

        {/* Vitals Summary */}
        <div className="space-y-1.5 text-xs">
          <p className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">Recorded Vital Signs:</p>
          <div className="flex flex-wrap gap-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-800 font-medium">
            <span><strong className="text-slate-900">BP:</strong> {record.blood_pressure || 'N/A'}</span>
            <span><strong className="text-slate-900">HR:</strong> {record.heart_rate ? `${record.heart_rate} bpm` : 'N/A'}</span>
            <span><strong className="text-slate-900">Temp:</strong> {record.temperature ? `${record.temperature}°C` : 'N/A'}</span>
            <span><strong className="text-slate-900">Weight:</strong> {record.weight_kg ? `${record.weight_kg} kg` : 'N/A'}</span>
          </div>
        </div>

        {/* Clinical Diagnosis & Certification */}
        <div className="space-y-3 text-xs">
          <div>
            <p className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">Clinical Diagnosis:</p>
            <p className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-800 font-semibold mt-1 leading-relaxed">
              {record.diagnosis || 'No formal diagnosis logged.'}
            </p>
          </div>

          <div>
            <p className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">Physician Recommendations & Plan:</p>
            <p className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-800 font-semibold mt-1 leading-relaxed">
              {record.treatment_plan || 'Standard rest and monitoring.'}
            </p>
          </div>
        </div>

        {/* Doctor Signature Block */}
        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <div className="text-center space-y-1">
            <div className="w-52 border-b border-slate-400 mx-auto" />
            <p className="font-black text-sm text-slate-900 pt-1">{doctorName}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Attending Physician (License #MD-98421)</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
