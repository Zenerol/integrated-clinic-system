import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { notificationService } from '../../services/notificationService';
import { AppointmentWithPatient, VitalsFormPayload } from '../../types/clinic.types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { PendingRequestsList } from './components/PendingRequestsList';
import { ActiveQueueList } from './components/ActiveQueueList';
import { RejectModal } from './components/RejectModal';
import { VitalsIntakeModal } from './components/VitalsIntakeModal';
import { HeartPulse, ClipboardCheck, Clock, Users, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NurseDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [loading, setLoading] = useState<boolean>(true);

  const [pendingAppointments, setPendingAppointments] = useState<AppointmentWithPatient[]>([]);
  const [activeQueue, setActiveQueue] = useState<AppointmentWithPatient[]>([]);

  // Modals state
  const [selectedRejectAppointment, setSelectedRejectAppointment] = useState<AppointmentWithPatient | null>(null);
  const [selectedVitalsAppointment, setSelectedVitalsAppointment] = useState<AppointmentWithPatient | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Pending
      const pending = await appointmentService.getAppointments({ status: 'pending' });
      setPendingAppointments(pending);

      // Fetch Active Queue
      const active = await appointmentService.getAppointments({
        status: ['approved', 'in_triage', 'with_doctor'],
      });
      setActiveQueue(active);
    } catch (err) {
      console.error('Error fetching nurse dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (appointment: AppointmentWithPatient) => {
    if (!profile) return;
    try {
      await appointmentService.approveAppointment(appointment.id, profile.id);

      // Notify patient
      await notificationService.sendNotification({
        recipient_id: appointment.patient_id,
        title: 'Appointment Approved',
        message: `Your consultation request for ${new Date(appointment.scheduled_at).toLocaleDateString()} has been approved. Please report to the clinic intake desk.`,
        type: 'success',
      });

      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to approve appointment:', err);
    }
  };

  const handleConfirmReject = async (appointmentId: string, reason: string) => {
    if (!profile) return;
    await appointmentService.rejectAppointment(appointmentId, profile.id, reason);

    const appointment = pendingAppointments.find((a) => a.id === appointmentId);
    if (appointment) {
      await notificationService.sendNotification({
        recipient_id: appointment.patient_id,
        title: 'Appointment Request Rejected',
        message: `Your appointment request was declined. Reason: ${reason}`,
        type: 'warning',
      });
    }

    await fetchDashboardData();
  };

  const handleCheckInAndOpenVitals = async (appointment: AppointmentWithPatient) => {
    if (appointment.status === 'approved') {
      await appointmentService.checkInAppointment(appointment.id);
    }
    setSelectedVitalsAppointment(appointment);
  };

  const handleSubmitVitals = async (
    appointmentId: string,
    patientId: string,
    vitals: VitalsFormPayload
  ) => {
    // 1. Save Vitals record
    await medicalRecordService.saveVitals(appointmentId, patientId, vitals);

    // 2. Transition status to with_doctor
    await appointmentService.passToDoctor(appointmentId);

    // 3. Dispatch urgent notification to Doctor role
    await notificationService.sendNotification({
      target_role: 'doctor',
      title: 'Patient Ready for Doctor Assessment',
      message: `Vitals recorded for ${selectedVitalsAppointment?.patient.full_name}. Patient is ready in consulting queue.`,
      type: 'urgent',
    });

    await fetchDashboardData();
  };

  const tabs = [
    { id: 'pending', label: 'Appointment Requests', count: pendingAppointments.length, icon: <Clock className="w-4 h-4" /> },
    { id: 'triage', label: 'Active Clinic Queue', count: activeQueue.length, icon: <HeartPulse className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-emerald-400" />
            Nurse Triage & Intake Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming requests, check-in patients, & record clinical vitals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" size="md" icon={<ClipboardCheck className="w-4 h-4" />}>
            Role: Clinical Nurse
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="!p-4 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Pending Requests</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{pendingAppointments.length}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400/40" />
          </div>
        </Card>
        <Card className="!p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Patients In Queue</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{activeQueue.length}</p>
            </div>
            <Users className="w-8 h-8 text-emerald-400/40" />
          </div>
        </Card>
      </div>

      {/* Main Tabs & List Content */}
      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'pending' ? (
            <PendingRequestsList
              appointments={pendingAppointments}
              loading={loading}
              onApprove={handleApprove}
              onReject={(apt) => setSelectedRejectAppointment(apt)}
            />
          ) : (
            <ActiveQueueList
              appointments={activeQueue}
              loading={loading}
              onCheckInAndRecordVitals={handleCheckInAndOpenVitals}
            />
          )}
        </div>
      </Card>

      {/* Modals */}
      <RejectModal
        isOpen={Boolean(selectedRejectAppointment)}
        appointment={selectedRejectAppointment}
        onClose={() => setSelectedRejectAppointment(null)}
        onConfirmReject={handleConfirmReject}
      />

      <VitalsIntakeModal
        isOpen={Boolean(selectedVitalsAppointment)}
        appointment={selectedVitalsAppointment}
        onClose={() => setSelectedVitalsAppointment(null)}
        onSubmitVitals={handleSubmitVitals}
      />
    </div>
  );
};
