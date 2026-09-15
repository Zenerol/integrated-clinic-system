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

    // 4. Send urgent follow-up notification if required
    if (assessment.requires_follow_up) {
      await notificationService.sendNotification({
        recipient_id: patientId,
        title: `Follow-Up Required: Dr. ${profile.full_name} recommended a check-up`,
        message: `Dr. ${profile.full_name} recommended a follow-up consultation on ${assessment.follow_up_date || 'the near future'}. Objective: ${assessment.follow_up_instructions || 'Routine clinical re-evaluation'}.`,
        type: 'urgent',
        is_critical: true,
        action_url: `/portal?follow_up=true&parent_id=${appointmentId}&doctor_id=${profile.id}&date=${assessment.follow_up_date || ''}`,
      });
    }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Patients In Queue */}
        <div className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Patients In Queue
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {doctorQueue.length}
              </span>
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-500/30">
                Active Queue
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Triaged & Awaiting Doctor Assessment
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200/80 dark:border-purple-500/30">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Clinical Station */}
        <div className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Clinical Desk Status
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Doctor Station #1
              </span>
            </div>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time Sync Active
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200/80 dark:border-teal-500/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Medical Cert Generator */}
        <div className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4 hidden lg:flex">
          <div className="space-y-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Medical Documentation
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Clearance Generator
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Digital Signature & Rx Enabled
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-500/30">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>
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
