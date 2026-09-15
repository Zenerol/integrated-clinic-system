import { supabase } from '../lib/supabaseClient';
import { AppointmentStatus } from '../types/database.types';
import { AppointmentWithPatient, CreateAppointmentPayload } from '../types/clinic.types';
import { notificationService } from './notificationService';

export const appointmentService = {
  async getAppointments(filters?: {
    status?: AppointmentStatus | AppointmentStatus[];
    patientId?: string;
    doctorId?: string;
  }): Promise<AppointmentWithPatient[]> {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(*),
        assigned_doctor:profiles!appointments_assigned_doctor_id_fkey(*),
        approved_by_profile:profiles!appointments_approved_by_fkey(*)
      `)
      .order('scheduled_at', { ascending: true });

    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters?.doctorId) {
      query = query.eq('assigned_doctor_id', filters.doctorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as AppointmentWithPatient[];
  },

  async createAppointment(patientId: string, payload: CreateAppointmentPayload) {
    const insertData: Record<string, unknown> = {
      patient_id: patientId,
      chief_complaint: payload.chief_complaint,
      scheduled_at: payload.scheduled_at,
      consultation_mode: payload.consultation_mode || 'school_free',
      consultation_fee: payload.consultation_fee || 0.00,
      status: 'pending',
      parent_appointment_id: payload.parent_appointment_id || null,
      is_follow_up: Boolean(payload.is_follow_up),
      assigned_doctor_id: payload.assigned_doctor_id || null,
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      // Fallback if parent_appointment_id / is_follow_up columns are not yet present on DB
      delete insertData.parent_appointment_id;
      delete insertData.is_follow_up;
      const { data: retryData, error: retryError } = await supabase
        .from('appointments')
        .insert(insertData as any)
        .select()
        .single();
      if (retryError) throw retryError;
      return retryData;
    }
    return data;
  },

  async approveAppointment(appointmentId: string, reviewerId: string, doctorId?: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'approved',
        approved_by: reviewerId,
        approved_at: new Date().toISOString(),
        assigned_doctor_id: doctorId || null,
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Send in-app notification to patient that appointment is approved
    if (data && data.patient_id) {
      try {
        const formattedDate = data.scheduled_at
          ? new Date(data.scheduled_at).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'scheduled time';

        await notificationService.sendNotification({
          recipient_id: data.patient_id,
          title: 'Appointment Approved & Confirmed! 🎉',
          message: `Your medical consultation scheduled for ${formattedDate} has been confirmed by clinic nursing staff. Please arrive 10 minutes prior to your slot.`,
          type: 'success',
          is_critical: false,
          action_url: '/portal',
        });
      } catch (notifErr) {
        console.warn('Failed to send appointment approval notification:', notifErr);
      }
    }

    return data;
  },

  async rejectAppointment(appointmentId: string, reviewerId: string, reason: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'rejected',
        approved_by: reviewerId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Send in-app notification to patient that appointment was declined
    if (data && data.patient_id) {
      try {
        await notificationService.sendNotification({
          recipient_id: data.patient_id,
          title: 'Appointment Request Update',
          message: `Your consultation request was declined: ${reason}`,
          type: 'warning',
          is_critical: false,
          action_url: '/portal',
        });
      } catch (notifErr) {
        console.warn('Failed to send appointment rejection notification:', notifErr);
      }
    }

    return data;
  },

  async checkInAppointment(appointmentId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'in_triage',
        check_in_time: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async passToDoctor(appointmentId: string, doctorId?: string) {
    const updates: Partial<AppointmentWithPatient> = { status: 'with_doctor' };
    if (doctorId) updates.assigned_doctor_id = doctorId;

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Send critical notification to patient that doctor is ready for consult
    if (data && data.patient_id) {
      try {
        await notificationService.sendNotification({
          recipient_id: data.patient_id,
          title: 'Consultation Ready! 🩺',
          message: 'Triage complete. The physician is ready for your clinical encounter. Please enter the doctor consultation station.',
          type: 'urgent',
          is_critical: true,
          action_url: '/portal',
        });
      } catch (notifErr) {
        console.warn('Failed to send pass to doctor notification:', notifErr);
      }
    }

    return data;
  },

  async completeAppointment(appointmentId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelAppointment(appointmentId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
