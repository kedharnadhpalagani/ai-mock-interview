import React, { useState, useEffect } from 'react';
import { facultyApi, getErrorMessage } from '../../services/api';
import { FacultyMember } from '../../types';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  Briefcase, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Power, 
  KeyRound, 
  CheckSquare, 
  Square 
} from 'lucide-react';

export const FacultyManagementPage: React.FC = () => {
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New faculty form
  const [formData, setFormData] = useState({
    faculty_id: '',
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    initial_password: '',
    permissions: ['export_data'] as string[],
  });

  const [creating, setCreating] = useState(false);

  const fetchFaculty = async () => {
    try {
      const res = await facultyApi.listFaculty();
      setFacultyList(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleTogglePermission = (perm: string) => {
    if (formData.permissions.includes(perm)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== perm),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, perm],
      });
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);

    try {
      await facultyApi.createFaculty(formData);
      setSuccess(`Faculty account for '${formData.name}' created with ID: ${formData.faculty_id.toUpperCase()}.`);
      setFormData({
        faculty_id: '',
        name: '',
        email: '',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        initial_password: '',
        permissions: ['export_data'],
      });
      fetchFaculty();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (facultyId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await facultyApi.updateFaculty(facultyId, { account_status: nextStatus });
      fetchFaculty();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleToggleFacultyPermission = async (faculty: FacultyMember, perm: string) => {
    const hasPerm = faculty.permissions.includes(perm);
    const newPerms = hasPerm
      ? faculty.permissions.filter((p) => p !== perm)
      : [...faculty.permissions, perm];

    try {
      await facultyApi.updateFaculty(faculty.id, { permissions: newPerms });
      fetchFaculty();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative space-y-8">
      <QuantumAuroraBackground />

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-2">
          Administrative Faculty Governance
        </div>
        <h1 className="text-3xl font-extrabold text-white">Faculty & Delegation Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Create verified faculty accounts, configure initial credentials, and grant student approval privileges
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Create Faculty Form */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Create New Faculty Account</h2>
          </div>

          <form onSubmit={handleCreateFaculty} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unique Faculty ID</label>
              <input
                type="text"
                required
                value={formData.faculty_id}
                onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                placeholder="e.g. FAC2026CSE01"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. K. Srinivas"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official University Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="srinivas.k@vignan.ac.in"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={formData.initial_password}
                onChange={(e) => setFormData({ ...formData, initial_password: e.target.value })}
                placeholder="Secure initial password (hashed with Argon2id)"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            {/* Permissions Checkboxes */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Granted Privileges</label>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleTogglePermission('student_approval')}
                  className="flex items-center gap-2 text-left w-full p-2 rounded-lg bg-black/30 border border-white/5"
                >
                  {formData.permissions.includes('student_approval') ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                  <span className="text-white font-medium">student_approval (Permit student approvals)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePermission('export_data')}
                  className="flex items-center gap-2 text-left w-full p-2 rounded-lg bg-black/30 border border-white/5"
                >
                  {formData.permissions.includes('export_data') ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                  <span className="text-white font-medium">export_data (Allow CSV exports)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 shadow-md transition-all disabled:opacity-50"
            >
              {creating ? 'Creating Faculty Account...' : 'Create & Provision Account'}
            </button>
          </form>
        </div>

        {/* Faculty Roster List */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Active Faculty Directory</h2>
            <span className="text-xs text-slate-400 font-mono">{facultyList.length} Accounts</span>
          </div>

          <div className="space-y-3">
            {facultyList.map((fac) => (
              <div
                key={fac.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{fac.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      ID: <span className="text-cyan-300 font-mono font-bold">{fac.faculty_id}</span> • {fac.department}
                    </p>
                    <p className="text-[10px] text-slate-500">{fac.email}</p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(fac.id, fac.account_status)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                      fac.account_status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {fac.account_status}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-white/5 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Permissions:</span>
                    <button
                      type="button"
                      onClick={() => handleToggleFacultyPermission(fac, 'student_approval')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        fac.permissions?.includes('student_approval')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-slate-500 border border-transparent'
                      }`}
                    >
                      student_approval
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleFacultyPermission(fac, 'export_data')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        fac.permissions?.includes('export_data')
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-white/5 text-slate-500 border border-transparent'
                      }`}
                    >
                      export_data
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
