import React, { useState, useEffect } from 'react';
import { approvalsApi, getErrorMessage } from '../../services/api';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  User, 
  RefreshCw 
} from 'lucide-react';

export const FacultyApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await approvalsApi.getRequests('pending_approval');
      setRequests(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (studentId: string) => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await approvalsApi.makeDecision(studentId, 'approve');
      setSuccessMsg('Student application approved successfully.');
      fetchRequests();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedStudentId) return;
    if (!rejectionReason.trim()) {
      setError('A rejection reason is mandatory when rejecting a student.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      await approvalsApi.makeDecision(selectedStudentId, 'reject', rejectionReason.trim());
      setSuccessMsg('Student application rejected with recorded explanation.');
      setRejectModalOpen(false);
      fetchRequests();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative space-y-8">
      <QuantumAuroraBackground />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/40 border border-amber-500/20 text-xs font-semibold text-amber-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Faculty Delegation: student_approval</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Student Registration Approvals</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review submitted student registration requests for mock interview eligibility
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Requests Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Pending Approval Queue</h3>
          <span className="text-xs text-amber-400 font-mono">
            {requests.length} students waiting
          </span>
        </div>

        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Registration Number</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{req.full_name}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                      {req.university_reg_number}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{req.email}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {String(req.registered_at).slice(0, 10)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 hover:bg-emerald-900/60 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleOpenRejectModal(req.id)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900/60 transition-colors"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-semibold text-white">All pending student applications have been reviewed!</p>
            <p>New registrations will appear here for verification.</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-rose-500/40 space-y-4">
            <h3 className="text-lg font-bold text-white">Reject Student Application</h3>
            <p className="text-xs text-slate-300">
              Provide an official rejection explanation. The student will be able to see this reason inside their portal status page.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rejection Reason (Mandatory)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. University registration number does not match official academic roster records."
                className="w-full px-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
