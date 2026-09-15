import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { getPatientTypeBadgeStyle } from '../../utils/formatters';
import { User, LogOut, ChevronDown, ShieldCheck, HeartPulse, UserCheck, Settings, IdCard } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const UserProfileDropdown: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!profile) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    showToast('Logged out safely. Have a great day!', 'info', 'Signed Out');
    await signOut();
    navigate('/login');
  };

  const getRoleDetails = () => {
    switch (profile.role) {
      case 'admin':
        return {
          label: 'Clinic Administrator',
          subtext: 'System Administration',
          badgeVariant: 'danger' as const,
          icon: <ShieldCheck className="w-3 h-3" />,
        };
      case 'doctor':
        return {
          label: 'MD Physician',
          subtext: 'Doctor / Physician',
          badgeVariant: 'purple' as const,
          icon: <ShieldCheck className="w-3 h-3" />,
        };
      case 'nurse':
        return {
          label: 'Clinical Nurse',
          subtext: 'Triage & Nurse Desk',
          badgeVariant: 'success' as const,
          icon: <HeartPulse className="w-3 h-3" />,
        };
      case 'client':
      default:
        const style = getPatientTypeBadgeStyle(profile.patient_type);
        const sub =
          profile.patient_type === 'student'
            ? profile.school_id_number
              ? `Student • ID: ${profile.school_id_number}`
              : 'Student Patient'
            : profile.patient_type === 'faculty_staff'
            ? 'Faculty / Staff Member'
            : 'Community Outpatient';
        return {
          label: style.label,
          subtext: sub,
          badgeVariant: profile.patient_type === 'external_client' ? ('warning' as const) : ('info' as const),
          icon: <UserCheck className="w-3 h-3" />,
        };
    }
  };

  const roleInfo = getRoleDetails();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Closed State Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
          isOpen
            ? 'bg-teal-50 dark:bg-teal-500/20 border-teal-300 dark:border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-xs'
            : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
        }`}
        title="User Account Menu"
      >
        <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
          {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
        </div>
        <span className="hidden sm:inline-block text-xs font-black tracking-tight text-slate-900 dark:text-slate-100 max-w-[140px] truncate">
          {profile.full_name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
          }`}
        />
      </button>

      {/* Open State Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in font-sans">
          {/* Header */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate leading-tight">
                  {profile.full_name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate mt-0.5">
                  {roleInfo.subtext}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Badge variant={roleInfo.badgeVariant} icon={roleInfo.icon}>
                {roleInfo.label}
              </Badge>
            </div>

            {(profile.department_or_course || profile.school_id_number) && (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 font-medium">
                {profile.school_id_number && (
                  <p className="flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>School ID: <strong>{profile.school_id_number}</strong></span>
                  </p>
                )}
                {profile.department_or_course && (
                  <p className="truncate">
                    Dept / Course: <strong>{profile.department_or_course}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Menu Items */}
          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Profile & Account Details</span>
            </button>

            <div className="border-t border-slate-200 dark:border-slate-800 my-1" />

            {/* Logout Item */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
