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
      title="Medical Clearance Document Preview"
      subtitle={docTitle}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            Print / Save PDF
          </Button>
        </>
      }
    >
      {/* Printable Clinical Slip Layout */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-700 text-slate-100 space-y-6 print:bg-white print:text-black font-sans">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 print:hidden">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">{docTitle}</h2>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Hybrid School & Community Health Clinic Service
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-gray-700">
            <p className="font-bold text-slate-200 print:text-black">Date Issued:</p>
            <p>{formatDate(record.created_at)}</p>
          </div>
        </div>

        {/* Patient Profile Metadata */}
        <div className="grid grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-lg border border-slate-800 text-xs print:bg-gray-100 print:border-gray-300 print:text-black">
          <div>
            <p className="text-slate-400 print:text-gray-600">Patient Name:</p>
            <p className="font-bold text-slate-100 text-sm print:text-black">{appointment.patient.full_name}</p>
          </div>
          <div>
            <p className="text-slate-400 print:text-gray-600">Category / Type:</p>
            <p className="font-bold text-slate-100 capitalize print:text-black">
              {appointment.patient.patient_type?.replace('_', ' ')}
            </p>
          </div>
          {appointment.patient.school_id_number && (
            <div>
              <p className="text-slate-400 print:text-gray-600">School ID Number:</p>
              <p className="font-bold text-slate-100 print:text-black">{appointment.patient.school_id_number}</p>
            </div>
          )}
          {appointment.patient.department_or_course && (
            <div>
              <p className="text-slate-400 print:text-gray-600">Department / Course:</p>
              <p className="font-bold text-slate-100 print:text-black">{appointment.patient.department_or_course}</p>
            </div>
          )}
        </div>

        {/* Vitals Summary */}
        <div className="space-y-1 text-xs">
          <p className="font-bold text-slate-300 uppercase tracking-wider print:text-black">Recorded Vital Signs:</p>
          <div className="flex flex-wrap gap-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800 print:bg-gray-50 print:border-gray-300 print:text-black">
            <span><strong>BP:</strong> {record.blood_pressure || 'N/A'}</span>
            <span><strong>HR:</strong> {record.heart_rate ? `${record.heart_rate} bpm` : 'N/A'}</span>
            <span><strong>Temp:</strong> {record.temperature ? `${record.temperature}°C` : 'N/A'}</span>
            <span><strong>Weight:</strong> {record.weight_kg ? `${record.weight_kg} kg` : 'N/A'}</span>
          </div>
        </div>

        {/* Clinical Diagnosis & Certification */}
        <div className="space-y-3 text-xs">
          <div>
            <p className="font-bold text-slate-300 uppercase tracking-wider print:text-black">Clinical Diagnosis:</p>
            <p className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-slate-200 mt-1 print:bg-gray-50 print:border-gray-300 print:text-black">
              {record.diagnosis || 'No formal diagnosis logged.'}
            </p>
          </div>

          <div>
            <p className="font-bold text-slate-300 uppercase tracking-wider print:text-black">Physician Recommendations & Plan:</p>
            <p className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-slate-200 mt-1 print:bg-gray-50 print:border-gray-300 print:text-black">
              {record.treatment_plan || 'Standard rest and monitoring.'}
            </p>
          </div>
        </div>

        {/* Doctor Signature Block */}
        <div className="pt-8 border-t border-slate-800 flex justify-end print:border-black">
          <div className="text-center space-y-1">
            <div className="w-48 border-b border-slate-400 mx-auto print:border-black" />
            <p className="font-extrabold text-sm text-slate-100 print:text-black">{doctorName}</p>
            <p className="text-[11px] text-slate-400 print:text-gray-600">Attending Physician (License #MD-98421)</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
