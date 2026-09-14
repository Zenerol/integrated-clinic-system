import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Clock, ShieldAlert, LogOut, RefreshCw, CheckCircle2, FileCheck, Stethoscope } from 'lucide-react';

export const AwaitingApprovalPage: React.FC = () => {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);

    if (profile?.account_status === 'active') {
      if (profile.role === 'doctor') navigate('/doctor');
      else if (profile.role === 'nurse') navigate('/nurse');
      else if (profile.role === 'admin') navigate('/admin');
      else navigate('/portal');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isRejected = profile?.account_status === 'rejected';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-center">
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-5 shadow-inner">
          {isRejected ? (
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          ) : (
            <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 mb-2">
          {isRejected ? 'Application Declined' : 'Verification Pending'}
        </h2>

        <p className="text-xs text-teal-400 font-bold uppercase tracking-wider mb-4 flex items-center justify-center gap-1.5">
          <Stethoscope className="w-4 h-4" />
          {profile?.role === 'doctor' ? 'Medical Doctor (MD) Applicant' : 'Clinical Nurse (RN) Applicant'}
        </p>

        {/* Status Box */}
        {isRejected ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-6 text-left">
            <h4 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider mb-1">
              Decline Reason from Administration:
            </h4>
            <p className="text-xs text-rose-200 font-medium leading-relaxed">
              "{profile?.rejection_reason || 'License number could not be verified in the PRC registry.'}"
            </p>
          </div>
        ) : (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6 text-left space-y-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>License / PRC ID: <strong className="font-mono text-amber-200">{profile?.professional_license_no || 'N/A'}</strong></span>
            </div>
            <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
              Your application has been submitted and is pending verification by Clinic Administration. You will receive clinical access as soon as your credentials are verified.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {!isRejected && (
            <Button
              variant="primary"
              size="lg"
              isLoading={refreshing}
              onClick={handleRefresh}
              icon={<RefreshCw className="w-4 h-4" />}
              className="w-full"
            >
              Refresh Approval Status
            </Button>
          )}

          <Button
            variant="cancel"
            size="lg"
            onClick={handleSignOut}
            icon={<LogOut className="w-4 h-4" />}
            className="w-full text-rose-400 border-rose-900/50 hover:bg-rose-950/50"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
