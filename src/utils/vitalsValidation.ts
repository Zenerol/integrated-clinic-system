export interface VitalsValidationResult {
  isValid: boolean;
  errors: {
    blood_pressure?: string;
    heart_rate?: string;
    temperature?: string;
    weight_kg?: string;
  };
}

export const validateVitals = (data: {
  blood_pressure?: string;
  heart_rate?: number | null;
  temperature?: number | null;
  weight_kg?: number | null;
}): VitalsValidationResult => {
  const errors: VitalsValidationResult['errors'] = {};

  if (data.blood_pressure) {
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (!bpRegex.test(data.blood_pressure.trim())) {
      errors.blood_pressure = 'Blood Pressure must be formatted as Systolic/Diastolic (e.g. 120/80)';
    }
  }

  if (data.heart_rate !== null && data.heart_rate !== undefined) {
    if (data.heart_rate < 30 || data.heart_rate > 220) {
      errors.heart_rate = 'Heart Rate must be between 30 and 220 bpm';
    }
  }

  if (data.temperature !== null && data.temperature !== undefined) {
    if (data.temperature < 34.0 || data.temperature > 43.0) {
      errors.temperature = 'Temperature must be between 34.0°C and 43.0°C';
    }
  }

  if (data.weight_kg !== null && data.weight_kg !== undefined) {
    if (data.weight_kg < 1.0 || data.weight_kg > 300.0) {
      errors.weight_kg = 'Weight must be between 1.0 kg and 300.0 kg';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
