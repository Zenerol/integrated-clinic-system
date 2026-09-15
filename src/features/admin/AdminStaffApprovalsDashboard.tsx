import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Profile } from '../../types/auth.types';
import { adminService } from '../../services/adminService';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatDate } from '../../utils/formatters';
import { maskIdNumber } from '../../utils/security';
import { rejectionNoteSchema } from '../../utils/validationSchemas';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  Users,
  UserCheck,
  UserX,
  Ban,
  Stethoscope,
  HeartPulse,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  IdCard,
  Phone,
  MapPin,
  Building,
} from 'lucide-react';

export const AdminStaffApprovalsDashboard: React.FC = () => {
  const { profile: adminProfile } = useAuth();
  const location = useLocation();

  // State & Route Tab Sync
  const [activeTab, setActiveTab] = useState<'approvals' | 'members'>(
    location.pathname.includes('/members') ? 'members' : 'approvals'
  );

  useEffect(() => {
    setActiveTab(location.pathname.includes('/members') ? 'members' : 'approvals');
  }, [location.pathname]);

  const [approvalsFilter, setApprovalsFilter] = useState<'pending' | 'staff_all'>('pending');

  const [allMembers, setAllMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Member Management Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Rejection modal state
  const [rejectingStaff, setRejectingStaff] = useState<Profile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // Member Action modal state (Suspend / Activate)
  const [actionTargetMember, setActionTargetMember] = useState<{
    member: Profile;
    targetStatus: 'active' | 'suspended';
  } | null>(null);

  // CRUD Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<Profile | null>(null);
  const [editingMember, setEditingMember] = useState<Profile | null>(null);
  const [deletingMember, setDeletingMember] = useState<Profile | null>(null);

  // Form state for Create / Edit Member
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'client' as 'admin' | 'doctor' | 'nurse' | 'client',
    patient_type: 'external_client' as 'student' | 'faculty_staff' | 'external_client',
    school_id_number: '',
    department_or_course: '',
    contact_number: '',
    address: '',
    professional_license_no: '',
    account_status: 'active' as 'active' | 'pending_approval' | 'suspended' | 'rejected',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const members = await adminService.getAllMembers();
      setAllMembers(members);
    } catch (err) {
      console.error('Failed to load clinic members data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered lists
  const pendingStaff = allMembers.filter(
    (m) => (m.role === 'doctor' || m.role === 'nurse') && m.account_status === 'pending_approval'
  );

  const allStaff = allMembers.filter(
    (m) => m.role === 'doctor' || m.role === 'nurse' || m.role === 'admin'
  );

  const staffDisplayed = approvalsFilter === 'pending' ? pendingStaff : allStaff;

  // Search & Filter for All Members Tab
  const filteredMembers = allMembers.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.school_id_number && m.school_id_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.professional_license_no && m.professional_license_no.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || m.account_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Action Handlers
  const handleApprove = async (staff: Profile) => {
    if (!adminProfile) return;
    setActionLoadingId(staff.id);
    try {
      await adminService.approveStaffApplication(staff.id, adminProfile.id);
      await loadData();
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
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reject application';
      setRejectionError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!actionTargetMember || !adminProfile) return;
    const { member, targetStatus } = actionTargetMember;
    setActionLoadingId(member.id);

    try {
      await adminService.updateMemberStatus(member.id, targetStatus, adminProfile.id);
      setActionTargetMember(null);
      await loadData();
    } catch (err) {
      console.error('Failed to update member status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- CRUD Handlers ---
  const handleOpenCreateModal = () => {
    setFormData({
      full_name: '',
      role: 'client',
      patient_type: 'external_client',
      school_id_number: '',
      department_or_course: '',
      contact_number: '',
      address: '',
      professional_license_no: '',
      account_status: 'active',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (member: Profile) => {
    setEditingMember(member);
    setFormData({
      full_name: member.full_name,
      role: member.role,
      patient_type: member.patient_type || 'external_client',
      school_id_number: member.school_id_number || '',
      department_or_course: member.department_or_course || '',
      contact_number: member.contact_number || '',
      address: member.address || '',
      professional_license_no: member.professional_license_no || '',
      account_status: member.account_status || 'active',
    });
    setFormError(null);
  };

  const handleSaveMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.full_name.trim()) {
      setFormError('Full Name is required.');
      return;
    }

    setFormError(null);
    setLoading(true);
    try {
      if (editingMember) {
        await adminService.updateMember(editingMember.id, formData);
        setEditingMember(null);
      } else {
        await adminService.createMember(formData);
        setIsCreateModalOpen(false);
      }
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save member details.';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!deletingMember) return;
    setActionLoadingId(deletingMember.id);
    try {
      await adminService.deleteMember(deletingMember.id);
      setDeletingMember(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete member:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const totalCount = allMembers.length;
  const pendingCount = pendingStaff.length;
  const doctorCount = allMembers.filter((m) => m.role === 'doctor' && m.account_status === 'active').length;
  const nurseCount = allMembers.filter((m) => m.role === 'nurse' && m.account_status === 'active').length;
  const patientCount = allMembers.filter((m) => m.role === 'client').length;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-500/20 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Clinic Administration & Member Management
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
              Medical Credentials Verification, Role Control, & Account Status Workspaces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadData} isLoading={loading} icon={<RefreshCw className="w-4 h-4" />}>
            Refresh Directory
          </Button>
        </div>
      </div>

      {/* Analytics & Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Members</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{totalCount}</p>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">{patientCount} Patients</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200/80 dark:border-teal-500/30">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Staff</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{pendingCount}</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">Awaiting Review</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Doctors */}
        <div className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Doctors</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{doctorCount}</p>
            <p className="text-[11px] text-purple-700 dark:text-purple-400 font-bold">Physicians</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200/80 dark:border-purple-500/30">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        {/* Active Nurses */}
        <div className="py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Nurses</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{nurseCount}</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Clinical RNs</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-500/30">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: STAFF APPROVALS WORKSPACE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {/* Sub-Filter Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setApprovalsFilter('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold border transition cursor-pointer ${
                approvalsFilter === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              Pending Applications ({pendingStaff.length})
            </button>
            <button
              onClick={() => setApprovalsFilter('staff_all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold border transition cursor-pointer ${
                approvalsFilter === 'staff_all'
                  ? 'bg-teal-50 dark:bg-teal-500/20 text-teal-900 dark:text-teal-300 border-teal-300 dark:border-teal-500/40'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              All Medical Staff Roster ({allStaff.length})
            </button>
          </div>

          {/* Table Container */}
          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
            {loading ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
                Loading staff verification records...
              </div>
            ) : staffDisplayed.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Applications to Display</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                  All submitted doctor and nurse credentials have been processed by clinic administration.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4">Applicant Name</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">PRC License No</th>
                      <th className="py-3.5 px-4">Application Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200">
                    {staffDisplayed.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-xs shrink-0 border border-teal-500/20">
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

                        <td className="py-3.5 px-4">
                          <Badge variant={staff.role === 'doctor' ? 'purple' : 'success'}>
                            {staff.role === 'doctor' ? 'Medical Doctor (MD)' : 'Clinical Nurse (RN)'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {staff.professional_license_no || 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {formatDate(staff.created_at)}
                        </td>

                        <td className="py-3.5 px-4">
                          {staff.account_status === 'active' && <Badge variant="success">Active / Approved</Badge>}
                          {staff.account_status === 'pending_approval' && <Badge variant="warning">Pending Verification</Badge>}
                          {staff.account_status === 'rejected' && <Badge variant="danger">Declined</Badge>}
                          {staff.account_status === 'suspended' && <Badge variant="danger">Suspended</Badge>}
                        </td>

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
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingMember(staff)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(staff)}
                                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 transition cursor-pointer"
                                title="Edit Profile"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE ALL MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Controls Header: Search, Filters & Add Member */}
          <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Input
                placeholder="Search member by full name, ID number, or license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            {/* Filter Dropdowns & Add Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-36 sm:w-40">
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Roles' },
                    { value: 'client', label: 'Patients / Clients' },
                    { value: 'doctor', label: 'Doctors' },
                    { value: 'nurse', label: 'Nurses' },
                    { value: 'admin', label: 'Admins' },
                  ]}
                />
              </div>

              <div className="w-36 sm:w-40">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active' },
                    { value: 'pending_approval', label: 'Pending' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'rejected', label: 'Declined' },
                  ]}
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreateModal}
                icon={<UserPlus className="w-4 h-4" />}
              >
                Add New Member
              </Button>
            </div>
          </div>

          {/* Members Table */}
          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
            {loading ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
                Loading member directory...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Members Match Search Criteria</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Try adjusting search keywords or resetting role filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4">Member Name</th>
                      <th className="py-3.5 px-4">Role / Category</th>
                      <th className="py-3.5 px-4">ID / License No</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Name & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0 border border-slate-300 dark:border-slate-700">
                              {member.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">{member.full_name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-normal">
                                <Mail className="w-3 h-3" /> {member.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              member.role === 'admin'
                                ? 'danger'
                                : member.role === 'doctor'
                                ? 'purple'
                                : member.role === 'nurse'
                                ? 'success'
                                : 'info'
                            }
                          >
                            {member.role === 'admin'
                              ? 'System Admin'
                              : member.role === 'doctor'
                              ? 'Doctor (MD)'
                              : member.role === 'nurse'
                              ? 'Nurse (RN)'
                              : member.patient_type === 'external_client'
                              ? 'External Outpatient'
                              : member.patient_type === 'faculty_staff'
                              ? 'Faculty / Staff'
                              : 'Student Patient'}
                          </Badge>
                        </td>

                        {/* ID or License */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {member.role === 'doctor' || member.role === 'nurse'
                            ? member.professional_license_no || 'N/A'
                            : member.school_id_number
                            ? maskIdNumber(member.school_id_number)
                            : 'N/A'}
                        </td>

                        {/* Created At */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {formatDate(member.created_at)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {member.account_status === 'active' && <Badge variant="success">Active</Badge>}
                          {member.account_status === 'pending_approval' && <Badge variant="warning">Pending</Badge>}
                          {member.account_status === 'suspended' && <Badge variant="danger">Suspended</Badge>}
                          {member.account_status === 'rejected' && <Badge variant="danger">Declined</Badge>}
                        </td>

                        {/* HCI Compliant Action Column Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          {member.id === adminProfile?.id ? (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Current Admin</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. View Profile Details */}
                              <button
                                type="button"
                                onClick={() => setViewingMember(member)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                title="View Member Profile"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                              </button>

                              {/* 2. Edit Profile */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(member)}
                                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 transition cursor-pointer"
                                title="Edit Member Profile"
                              >
                                <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              </button>

                              {/* 3. Suspend / Re-Activate */}
                              {member.account_status === 'active' ? (
                                <button
                                  type="button"
                                  disabled={actionLoadingId === member.id}
                                  onClick={() => setActionTargetMember({ member, targetStatus: 'suspended' })}
                                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 dark:hover:bg-rose-500/25 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 transition cursor-pointer"
                                  title="Suspend Member Account"
                                >
                                  <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={actionLoadingId === member.id}
                                  onClick={() => setActionTargetMember({ member, targetStatus: 'active' })}
                                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 transition cursor-pointer"
                                  title="Re-Activate Member Account"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                </button>
                              )}

                              {/* 4. Delete Account */}
                              <button
                                type="button"
                                onClick={() => setDeletingMember(member)}
                                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs cursor-pointer"
                                title="Delete Member Account"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-white" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT MEMBER MODAL */}
      {(isCreateModalOpen || editingMember) && (
        <Modal
          isOpen={isCreateModalOpen || Boolean(editingMember)}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingMember(null);
          }}
          title={editingMember ? 'Edit Member Profile' : 'Add New Member'}
          subtitle={editingMember ? `Editing profile for ${editingMember.full_name}` : 'Register a new patient, doctor, nurse, or admin user'}
          footer={
            <>
              <Button
                variant="cancel"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingMember(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={loading}
                onClick={handleSaveMember}
                icon={editingMember ? <CheckCircle2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              >
                {editingMember ? 'Save Changes' : 'Create Member'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveMember} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <Input
              label="Full Name *"
              placeholder="e.g. Dr. John Doe, MD or Jane Smith"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Role *"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                options={[
                  { value: 'client', label: 'Patient / Client' },
                  { value: 'doctor', label: 'Medical Doctor (MD)' },
                  { value: 'nurse', label: 'Clinical Nurse (RN)' },
                  { value: 'admin', label: 'System Admin' },
                ]}
              />

              <Select
                label="Patient Category"
                value={formData.patient_type}
                onChange={(e) => setFormData({ ...formData, patient_type: e.target.value as any })}
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'faculty_staff', label: 'Faculty / Staff' },
                  { value: 'external_client', label: 'External Community Outpatient' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.role === 'doctor' || formData.role === 'nurse' ? (
                <Input
                  label="PRC License Number"
                  placeholder="e.g. PRC-0098412"
                  value={formData.professional_license_no}
                  onChange={(e) => setFormData({ ...formData, professional_license_no: e.target.value })}
                />
              ) : (
                <Input
                  label="School ID Number"
                  placeholder="e.g. 2024-0012"
                  value={formData.school_id_number}
                  onChange={(e) => setFormData({ ...formData, school_id_number: e.target.value })}
                />
              )}

              <Input
                label="Department / Course"
                placeholder="e.g. BS Information Technology"
                value={formData.department_or_course}
                onChange={(e) => setFormData({ ...formData, department_or_course: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Contact Phone Number"
                placeholder="e.g. +63 917 555 0192"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              />

              <Select
                label="Account Status"
                value={formData.account_status}
                onChange={(e) => setFormData({ ...formData, account_status: e.target.value as any })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'pending_approval', label: 'Pending Verification' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'rejected', label: 'Declined' },
                ]}
              />
            </div>

            <Input
              label="Home / Permanent Address"
              placeholder="e.g. 123 Main St, Barangay San Jose"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </form>
        </Modal>
      )}

      {/* VIEW MEMBER PROFILE MODAL */}
      {viewingMember && (
        <Modal
          isOpen={Boolean(viewingMember)}
          onClose={() => setViewingMember(null)}
          title="Member Profile Details"
          subtitle={`ID: ${viewingMember.id}`}
          footer={
            <Button variant="secondary" onClick={() => setViewingMember(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-lg shrink-0">
                {viewingMember.full_name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {viewingMember.full_name}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant={viewingMember.role === 'admin' ? 'danger' : viewingMember.role === 'doctor' ? 'purple' : viewingMember.role === 'nurse' ? 'success' : 'info'}>
                    Role: {viewingMember.role.toUpperCase()}
                  </Badge>
                  <Badge variant={viewingMember.account_status === 'active' ? 'success' : 'warning'}>
                    Status: {viewingMember.account_status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-teal-600" /> ID / License
                </p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {viewingMember.professional_license_no || viewingMember.school_id_number || 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-600" /> Dept / Course
                </p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {viewingMember.department_or_course || 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" /> Contact Number
                </p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {viewingMember.contact_number || 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" /> Registered Date
                </p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {formatDate(viewingMember.created_at)}
                </p>
              </div>
            </div>

            {viewingMember.address && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <p className="font-extrabold uppercase text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" /> Address
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {viewingMember.address}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* DELETE MEMBER CONFIRMATION MODAL */}
      {deletingMember && (
        <Modal
          isOpen={Boolean(deletingMember)}
          onClose={() => setDeletingMember(null)}
          title="Delete Member Account"
          subtitle={`Target: ${deletingMember.full_name} (${deletingMember.role.toUpperCase()})`}
          footer={
            <>
              <Button variant="cancel" onClick={() => setDeletingMember(null)} disabled={Boolean(actionLoadingId)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={actionLoadingId === deletingMember.id}
                onClick={handleConfirmDeleteMember}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Confirm Delete
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-sm font-medium">
            <p className="text-slate-700 dark:text-slate-300">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-100">{deletingMember.full_name}</strong>'s account profile?
            </p>
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>⚠️ Warning: This operation will permanently remove the profile record from the directory.</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Staff Application Rejection Modal */}
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

      {/* Member Account Status Confirmation Modal (Suspend / Re-Activate) */}
      {actionTargetMember && (
        <Modal
          isOpen={Boolean(actionTargetMember)}
          onClose={() => setActionTargetMember(null)}
          title={actionTargetMember.targetStatus === 'suspended' ? 'Suspend Member Account' : 'Re-Activate Member Account'}
          subtitle={`Member: ${actionTargetMember.member.full_name} (${actionTargetMember.member.role.toUpperCase()})`}
          footer={
            <>
              <Button variant="cancel" onClick={() => setActionTargetMember(null)} disabled={Boolean(actionLoadingId)}>
                Cancel
              </Button>
              <Button
                variant={actionTargetMember.targetStatus === 'suspended' ? 'danger' : 'success'}
                isLoading={actionLoadingId === actionTargetMember.member.id}
                onClick={handleConfirmStatusChange}
                icon={actionTargetMember.targetStatus === 'suspended' ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              >
                Confirm {actionTargetMember.targetStatus === 'suspended' ? 'Suspend' : 'Activate'}
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-sm font-medium">
            <p className="text-slate-700 dark:text-slate-300">
              Are you sure you want to set <strong className="text-slate-900 dark:text-slate-100">{actionTargetMember.member.full_name}</strong>'s account status to{' '}
              <strong className={actionTargetMember.targetStatus === 'suspended' ? 'text-rose-600 dark:text-rose-400 uppercase' : 'text-emerald-600 dark:text-emerald-400 uppercase'}>
                {actionTargetMember.targetStatus}
              </strong>?
            </p>
            {actionTargetMember.targetStatus === 'suspended' && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-bold">
                ⚠️ Suspended members will be blocked from accessing clinic services until reactivated by administration.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
