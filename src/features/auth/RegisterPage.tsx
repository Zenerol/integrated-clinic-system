import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { UserRole, PatientCategory } from '../../types/database.types';
import { Mail, Lock, User, IdCard, Building2, Phone, MapPin, UserPlus, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [categoryMode, setCategoryMode] = useState<'campus' | 'external'>('campus');
  const [role, setRole] = useState<UserRole>('client');
  const [patientType, setPatientType] = useState<PatientCategory>('student');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolIdNumber, setSchoolIdNumber] = useState('');
  const [departmentOrCourse, setDepartmentOrCourse] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleModeToggle = (mode: 'campus' | 'external') => {
    setCategoryMode(mode);
    if (mode === 'campus') {
      setPatientType('student');
    } else {
      setPatientType('external_client');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (categoryMode === 'campus' && !schoolIdNumber.trim()) {
      setErrorMessage('School ID Number is required for campus members.');
      return;
    }

    setLoading(true);

    const { error, profile: userProfile } = await signUp({
      email,
      password,
      fullName,
      role,
      patientType: categoryMode === 'campus' ? patientType : 'external_client',
      schoolIdNumber: categoryMode === 'campus' ? schoolIdNumber : undefined,
      departmentOrCourse: categoryMode === 'campus' ? departmentOrCourse : undefined,
      contactNumber,
      address,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Registration failed.');
    } else {
      const activeRole = userProfile?.role || role;
      if (activeRole === 'doctor') navigate('/doctor');
      else if (activeRole === 'nurse') navigate('/nurse');
      else navigate('/portal');
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Create Account</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
          Register for medical consultations & queue tracking
        </p>
      </div>

      {/* Segmented Selector for Campus vs External Outpatient */}
      <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl mb-5 border border-slate-300 dark:border-slate-700">
        <button
          type="button"
          onClick={() => handleModeToggle('campus')}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition duration-200 cursor-pointer ${
            categoryMode === 'campus'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Campus Member
        </button>
        <button
          type="button"
          onClick={() => handleModeToggle('external')}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition duration-200 cursor-pointer ${
            categoryMode === 'external'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Community Outpatient
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-900 dark:text-rose-400 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Full Name"
          type="text"
          required
          placeholder="John Doe"
          leftIcon={<User className="w-4 h-4" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="yourname@domain.com"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Role Selection */}
        <Select
          label="Account Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { value: 'client', label: 'Patient / Client' },
            { value: 'nurse', label: 'Clinical Nurse' },
            { value: 'doctor', label: 'Medical Doctor (MD)' },
          ]}
        />

        {/* Dynamic Campus Fields */}
        {categoryMode === 'campus' ? (
          <>
            <Select
              label="Campus Role"
              value={patientType}
              onChange={(e) => setPatientType(e.target.value as PatientCategory)}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'faculty_staff', label: 'Faculty / Staff Member' },
              ]}
            />
            <Input
              label="School ID Number"
              type="text"
              required
              placeholder="e.g. 2024-0012"
              leftIcon={<IdCard className="w-4 h-4" />}
              value={schoolIdNumber}
              onChange={(e) => setSchoolIdNumber(e.target.value)}
            />
            <Input
              label="Department / Course"
              type="text"
              placeholder="e.g. BS Information Technology"
              leftIcon={<Building2 className="w-4 h-4" />}
              value={departmentOrCourse}
              onChange={(e) => setDepartmentOrCourse(e.target.value)}
            />
          </>
        ) : (
          <>
            <Input
              label="Contact Phone Number"
              type="tel"
              placeholder="e.g. +63 912 345 6789"
              leftIcon={<Phone className="w-4 h-4" />}
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
            <Input
              label="Home Address"
              type="text"
              placeholder="Street, Barangay, City"
              leftIcon={<MapPin className="w-4 h-4" />}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          icon={<UserPlus className="w-4 h-4" />}
          className="mt-2 w-full"
        >
          Complete Registration
        </Button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-300 dark:border-slate-800 text-center">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold">
          Already registered?{' '}
          <Link to="/login" className="text-teal-700 dark:text-teal-400 hover:underline font-black">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
