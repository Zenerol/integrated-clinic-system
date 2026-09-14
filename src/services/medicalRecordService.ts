import { supabase } from '../lib/supabaseClient';
import { MedicalRecordWithDetails, VitalsFormPayload, ClinicalAssessmentPayload } from '../types/clinic.types';

export const medicalRecordService = {
  async getRecordByAppointment(appointmentId: string): Promise<MedicalRecordWithDetails | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:profiles!medical_records_patient_id_fkey(*),
        prescriptions(*)
      `)
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (error) throw error;
    return data as MedicalRecordWithDetails | null;
  },

  async saveVitals(appointmentId: string, patientId: string, vitals: VitalsFormPayload) {
    // Check if record already exists
    const existing = await this.getRecordByAppointment(appointmentId);

    if (existing) {
      const { data, error } = await supabase
        .from('medical_records')
        .update({
          blood_pressure: vitals.blood_pressure,
          heart_rate: vitals.heart_rate,
          temperature: vitals.temperature,
          weight_kg: vitals.weight_kg,
          nurse_notes: vitals.nurse_notes,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          appointment_id: appointmentId,
          patient_id: patientId,
          blood_pressure: vitals.blood_pressure,
          heart_rate: vitals.heart_rate,
          temperature: vitals.temperature,
          weight_kg: vitals.weight_kg,
          nurse_notes: vitals.nurse_notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async saveDoctorEncounter(
    appointmentId: string,
    patientId: string,
    doctorId: string,
    assessment: ClinicalAssessmentPayload
  ) {
    const existing = await this.getRecordByAppointment(appointmentId);

    let recordId: string;

    if (existing) {
      const { data, error } = await supabase
        .from('medical_records')
        .update({
          diagnosis: assessment.diagnosis,
          treatment_plan: assessment.treatment_plan,
          doctor_notes: assessment.doctor_notes,
          clearance_type: assessment.clearance_type,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      recordId = data.id;
    } else {
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          appointment_id: appointmentId,
          patient_id: patientId,
          diagnosis: assessment.diagnosis,
          treatment_plan: assessment.treatment_plan,
          doctor_notes: assessment.doctor_notes,
          clearance_type: assessment.clearance_type,
        })
        .select()
        .single();

      if (error) throw error;
      recordId = data.id;
    }

    // Save prescriptions if any
    if (assessment.prescriptions.length > 0) {
      // Remove old prescriptions for this record first
      await supabase.from('prescriptions').delete().eq('record_id', recordId);

      const prescriptionInserts = assessment.prescriptions.map((p) => ({
        record_id: recordId,
        patient_id: patientId,
        doctor_id: doctorId,
        medication_name: p.medication_name,
        dosage: p.dosage,
        frequency: p.frequency,
        instructions: p.instructions || null,
      }));

      const { error: rxError } = await supabase.from('prescriptions').insert(prescriptionInserts);
      if (rxError) throw rxError;
    }

    return recordId;
  },

  async getPatientHistory(patientId: string): Promise<MedicalRecordWithDetails[]> {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:profiles!medical_records_patient_id_fkey(*),
        prescriptions(*),
        appointment:appointments!medical_records_appointment_id_fkey(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MedicalRecordWithDetails[];
  },
};
