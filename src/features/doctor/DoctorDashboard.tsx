import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { appointmentService } from '../../services/appointmentService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { notificationService } from '../../services/notificationService';
import { AppointmentWithPatient, ClinicalAssessmentPayload, MedicalRecordWithDetails } from '../../types/clinic.types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DoctorQueueList } from './components/DoctorQueueList';
import { ClinicalEncounterModal } from './components/ClinicalEncounterModal';
import { MedicalDocumentModal } from './components/MedicalDocumentModal';
import { Stethoscope, UserCheck, FileText, Clock, Users, RefreshCw } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [doctorQueue, setDoctorQueue] = useState<AppointmentWithPatient[]>([]);

  // Selected for evaluation modal
  const [selectedEncounterApt, setSelectedEncounterApt] = useState<AppointmentWithPatient | null>(null);
  const [existingRecord, setExistingRecord] = useState<MedicalRecordWithDetails | null>(null);

  // Selected for Document preview modal
  const [docPreviewApt, setDocPreviewApt] = useState<AppointmentWithPatient | null>(null);
  const [docPreviewRecord, setDocPreviewRecord] = useState<MedicalRecordWithDetails | null>(null);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const queue = await appointmentService.getAppointments({ status: 'with_doctor' });
      setDoctorQueue(queue);
    } catch (err) {
      console.error('Error loading doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleStartEncounter = async (appointment: AppointmentWithPatient) => {
    setSelectedEncounterApt(appointment);
    try {
      const record = await medicalRecordService.getRecordByAppointment(appointment.id);
      setExistingRecord(record);
    } catch (err) {
      console.error('Failed to load existing record:', err);
    }
  };

  const handleSubmitEncounter = async (
    appointmentId: string,
    patientId: string,
    assessment: ClinicalAssessmentPayload
  ) => {
    if (!profile) return;

    // 1. Save diagnosis, doctor notes, treatment plan, prescriptions, and clearance type
    await medicalRecordService.saveDoctorEncounter(
      appointmentId,
      patientId,
      profile.id,
      assessment
    );

    // 2. Complete appointment
    await appointmentService.completeAppointment(appointmentId);

    // 3. Send notification to patient
    await notificationService.sendNotification({
      recipient_id: patientId,
      title: 'Consultation Finalized',
      message: `Dr. ${profile.full_name} has finalized your medical record and prescriptions. Clearance slips are now available in your portal.`,
      type: 'success',
    });

    showToast('Doctor checkup & medical certificate finalized!', 'success', 'Consultation Completed');

    // Load created record for Document Preview
    const finalRecord = await medicalRecordService.getRecordByAppointment(appointmentId);
    if (selectedEncounterApt && finalRecord) {
      setDocPreviewApt(selectedEncounterApt);
      setDocPreviewRecord(finalRecord);
    }

    setSelectedEncounterApt(null);
    await fetchDoctorData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-purple-700 dark:text-purple-400" />
            Doctor Clinical Portal
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Clinical evaluation, vitals review, diagnosis, & medical cert generator
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="purple" size="md" icon={<UserCheck className="w-4 h-4" />}>
            Role: MD Physician
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDoctorData}
            isLoading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="!p-4 bg-purple-500/10 dark:bg-purple-500/5 border-purple-300 dark:border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wide">Patients In Queue</p>
              <p className="text-2xl font-black text-purple-900 dark:text-purple-300 mt-1">{doctorQueue.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-700/50 dark:text-purple-400/40" />
          </div>
        </Card>
        <Card className="!p-4 bg-teal-500/10 dark:bg-teal-500/5 border-teal-300 dark:border-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-400 font-extrabold uppercase tracking-wide">Status</p>
              <p className="text-sm font-extrabold text-teal-900 dark:text-teal-300 mt-1">Active Encounter Desk</p>
            </div>
            <Clock className="w-8 h-8 text-teal-700/50 dark:text-teal-400/40" />
          </div>
        </Card>
      </div>

      {/* Queue Section */}
      <Card title="Active Encounter Queue" subtitle="Patients triaged by nurse awaiting doctor assessment">
        <DoctorQueueList
          appointments={doctorQueue}
          loading={loading}
          onStartEncounter={handleStartEncounter}
        />
      </Card>

      {/* Clinical Encounter Form Modal */}
      <ClinicalEncounterModal
        isOpen={Boolean(selectedEncounterApt)}
        appointment={selectedEncounterApt}
        existingRecord={existingRecord}
        onClose={() => setSelectedEncounterApt(null)}
        onSubmitEncounter={handleSubmitEncounter}
      />

      {/* Medical Document / Clearance Slip Modal */}
      <MedicalDocumentModal
        isOpen={Boolean(docPreviewApt && docPreviewRecord)}
        appointment={docPreviewApt}
        record={docPreviewRecord}
        doctorName={profile ? `Dr. ${profile.full_name}, MD` : undefined}
        onClose={() => {
          setDocPreviewApt(null);
          setDocPreviewRecord(null);
        }}
      />
    </div>
  );
};
