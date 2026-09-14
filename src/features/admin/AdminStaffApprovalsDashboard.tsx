import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Profile } from '../../types/auth.types';
import { adminService } from '../../services/adminService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';
import { maskIdNumber } from '../../utils/security';
import { rejectionNoteSchema } from '../../utils/validationSchemas';
import { ShieldCheck, CheckCircle2, XCircle, Clock, User, IdCard, Mail, AlertCircle, RefreshCw, Filter } from 'lucide-react';

export const AdminStaffApprovalsDashboard: React.FC = () => {
  const { profile: adminProfile } = useAuth();
  const [pendingStaff, setPendingStaff] = useState<Profile[]>([]);
  const [allStaff, setAllStaff] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingStaff, setRejectingStaff] = useState<Profile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const loadStaffData = async () => {
    setLoading(true);
    try {
      const pending = await adminService.getPendingStaffApplications();
      const all = await adminService.getAllStaffProfiles();
      setPendingStaff(pending);
      setAllStaff(all);
    } catch (err) {
      console.error('Failed to load staff applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  const handleApprove = async (staff: Profile) => {
    if (!adminProfile) return;
    setActionLoadingId(staff.id);
    try {
      await adminService.approveStaffApplication(staff.id, adminProfile.id);
      await loadStaffData();
    } catch (err) {
      console.error('Failed to approve staff:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (staff: Profile) => {
    setRejectingStaff(staff);
    setRejectionReason('');
    setRejectionError(null);
  };

  const handleConfirmReject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rejectingStaff || !adminProfile) return;

    const validation = rejectionNoteSchema.safeParse({ rejection_reason: rejectionReason });
    if (!validation.success) {
      setRejectionError(validation.error.errors[0].message);
      return;
    }

    setActionLoadingId(rejectingStaff.id);
    setRejectionError(null);

    try {
      await adminService.rejectStaffApplication(rejectingStaff.id, adminProfile.id, rejectionReason.trim());
      setRejectingStaff(null);
      await loadStaffData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reject application';
      setRejectionError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const displayedList = activeTab === 'pending' ? pendingStaff : allStaff;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">Clinic Administration Panel</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Medical Staff Credentials Verification & Approval Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadStaffData} isLoading={loading} icon={<RefreshCw className="w-4 h-4" />}>
            Refresh Table
          </Button>
        </div>
      </div>

      {/* Segmented Filter Tab Bar */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Approvals ({pendingStaff.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'all'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          All Medical Staff ({allStaff.length})
        </button>
      </div>

      {/* Staff Applications Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
            Loading staff verification records...
          </div>
        ) : displayedList.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Pending Applications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              All submitted doctor and nurse credentials have been processed by administration.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Applicant Name</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">PRC License No</th>
                  <th className="py-3.5 px-4">Application Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200">
                {displayedList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    {/* Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-xs shrink-0">
                          {staff.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{staff.full_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-normal">
                            <Mail className="w-3 h-3" /> {staff.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <Badge variant={staff.role === 'doctor' ? 'info' : 'success'}>
                        {staff.role === 'doctor' ? 'Medical Doctor (MD)' : 'Clinical Nurse (RN)'}
                      </Badge>
                    </td>

                    {/* PRC License */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {staff.professional_license_no || 'N/A'}
                    </td>

                    {/* Application Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {formatDate(staff.created_at)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {staff.account_status === 'active' && <Badge variant="success">Active / Approved</Badge>}
                      {staff.account_status === 'pending_approval' && <Badge variant="warning">Pending Verification</Badge>}
                      {staff.account_status === 'rejected' && <Badge variant="danger">Declined</Badge>}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {staff.account_status === 'pending_approval' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            isLoading={actionLoadingId === staff.id}
                            onClick={() => handleApprove(staff)}
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={actionLoadingId === staff.id}
                            onClick={() => handleOpenRejectModal(staff)}
                            icon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingStaff && (
        <Modal
          isOpen={Boolean(rejectingStaff)}
          onClose={() => setRejectingStaff(null)}
          title="Decline Staff Application"
          subtitle={`Applicant: ${rejectingStaff.full_name} (${rejectingStaff.role.toUpperCase()})`}
          footer={
            <>
              <Button variant="cancel" onClick={() => setRejectingStaff(null)} disabled={Boolean(actionLoadingId)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={actionLoadingId === rejectingStaff.id}
                onClick={handleConfirmReject}
                icon={<XCircle className="w-4 h-4" />}
              >
                Confirm Decline
              </Button>
            </>
          }
        >
          <form onSubmit={handleConfirmReject} className="space-y-4">
            {rejectionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rejectionError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs space-y-1 font-medium">
              <p>PRC License Number: <strong className="font-mono">{rejectingStaff.professional_license_no || 'N/A'}</strong></p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Reason for Rejection / Unverified License <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. License number not found in PRC database; please re-check registration documents..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-rose-500 text-slate-900 dark:text-slate-100 text-sm rounded-xl p-3 outline-none transition font-medium"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
