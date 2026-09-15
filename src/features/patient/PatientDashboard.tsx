import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { appointmentService } from '../../services/appointmentService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { notificationService } from '../../services/notificationService';
import { AppointmentWithPatient, CreateAppointmentPayload, MedicalRecordWithDetails } from '../../types/clinic.types';
import { getPatientTypeBadgeStyle } from '../../utils/formatters';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { BookAppointmentModal } from './components/BookAppointmentModal';
import { PatientAppointmentsList } from './components/PatientAppointmentsList';
import { PatientHistoryList } from './components/PatientHistoryList';
import { MedicalDocumentModal } from '../doctor/components/MedicalDocumentModal';
import { User, Plus, Calendar, Pill, RefreshCw } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('active');
  const [loading, setLoading] = useState<boolean>(true);

  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [historyRecords, setHistoryRecords] = useState<MedicalRecordWithDetails[]>([]);

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [docPreviewRecord, setDocPreviewRecord] = useState<MedicalRecordWithDetails | null>(null);
  const [docPreviewApt, setDocPreviewApt] = useState<AppointmentWithPatient | null>(null);

  const fetchPatientData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // 1. Fetch appointments
      const list = await appointmentService.getAppointments({ patientId: profile.id });
      setAppointments(list);

      // 2. Fetch history records
      const history = await medicalRecordService.getPatientHistory(profile.id);
      setHistoryRecords(history);
    } catch (err) {
      console.error('Error loading patient portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [profile?.id]);

  const handleBookAppointment = async (payload: CreateAppointmentPayload) => {
    if (!profile) return;
    await appointmentService.createAppointment(profile.id, payload);

    // Send broadcast notification to Nurse role
    await notificationService.sendNotification({
      target_role: 'nurse',
      title: 'New Consultation Request',
      message: `${profile.full_name} (${profile.patient_type?.replace('_', ' ')}) has submitted a new appointment booking.`,
      type: 'info',
    });

    showToast('Appointment request booked successfully!', 'success', 'Booked');
    await fetchPatientData();
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    await appointmentService.cancelAppointment(appointmentId);
    showToast('Appointment request cancelled', 'info', 'Cancelled');
    await fetchPatientData();
  };

  const handleOpenDocument = (record: MedicalRecordWithDetails) => {
    const matchingApt = appointments.find((a) => a.id === record.appointment_id);
    if (matchingApt) {
      setDocPreviewApt(matchingApt);
      setDocPreviewRecord(record);
    }
  };

  const badgeStyle = getPatientTypeBadgeStyle(profile?.patient_type);
  const activeCount = appointments.filter((a) => a.status !== 'completed' && a.status !== 'cancelled' && a.status !== 'rejected').length;

  const tabs = [
    { id: 'active', label: 'My Upcoming Appointments', count: activeCount, icon: <Calendar className="w-4 h-4" /> },
    { id: 'history', label: 'Medical Records & Prescriptions', count: historyRecords.length, icon: <Pill className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-7 h-7 text-teal-700 dark:text-teal-400" />
            Patient Portal
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            Book consultations, track queue status, & view medical records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatientData}
            isLoading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsBookModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards for Patient */}
      <div className="grid grid-cols-1 sm:grid-cols-2 max-w-3xl gap-4">
        {/* Card 1: Active Consultations */}
        <div className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Consultations
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {activeCount}
              </span>
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/15 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-500/30">
                In Progress
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Upcoming & Triaged Visits
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200/80 dark:border-teal-500/30">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Medical Records */}
        <div className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Medical Certificates & Rx
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {historyRecords.length}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                Finalized
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Available for Preview & Print
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-500/30">
            <Pill className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'active' ? (
            <PatientAppointmentsList
              appointments={appointments}
              loading={loading}
              onCancelAppointment={handleCancelAppointment}
            />
          ) : (
            <PatientHistoryList
              records={historyRecords}
              loading={loading}
              onOpenDocumentModal={handleOpenDocument}
            />
          )}
        </div>
      </Card>

      {/* Book Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        isExternalPatient={profile?.patient_type === 'external_client'}
        onClose={() => setIsBookModalOpen(false)}
        onBookAppointment={handleBookAppointment}
      />

      {/* Medical Clearance Document Preview Modal */}
      <MedicalDocumentModal
        isOpen={Boolean(docPreviewApt && docPreviewRecord)}
        appointment={docPreviewApt}
        record={docPreviewRecord}
        onClose={() => {
          setDocPreviewApt(null);
          setDocPreviewRecord(null);
        }}
      />
    </div>
  );
};
