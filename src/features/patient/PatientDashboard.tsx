import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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

    await fetchPatientData();
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    await appointmentService.cancelAppointment(appointmentId);
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
    { id: 'active', label: 'Active Consultation Pipeline', count: activeCount, icon: <Calendar className="w-4 h-4" /> },
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
          <Badge variant={profile?.patient_type === 'external_client' ? 'warning' : 'info'}>
            {badgeStyle.label}
          </Badge>
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
