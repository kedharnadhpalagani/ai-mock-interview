import React, { useState, useEffect } from 'react';
import { approvalsApi, getErrorMessage } from '../../services/api';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  AlertOctagon, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Search 
} from 'lucide-react';

export const AdminApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pending_approval');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await approvalsApi.getRequests(activeTab === 'all' ? undefined : activeTab);
      setRequests(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleDecision = async (studentId: string, action: string, reason?: string) => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await approvalsApi.makeDecision(studentId, action, reason);
      setSuccessMsg(`Action '${action}' completed successfully.`);
      fetchRequests();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const confirmRejection = async () => {
    if (!selectedStudentId || !rejectionReason.trim()) {
      setError('A rejection reason is mandatory.');
      return;
    }
    await handleDecision(selectedStudentId, 'reject', rejectionReason.trim());
    setRejectModalOpen(false);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative space-y-8">
      <QuantumAuroraBackground />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-cyan-300 mb-2">
            Admin Workflow Control
          </div>
          <h1 className="text-3xl font-extrabold text-white">Student Registration Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review, approve, reject with reason, reconsider, or suspend student accounts
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
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

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 w-fit">
        {[
          { id: 'pending_approval', label: 'Pending Approval' },
          { id: 'active', label: 'Approved (Active)' },
          { id: 'rejected', label: 'Rejected' },
          { id: 'suspended', label: 'Suspended' },
          { id: 'all', label: 'All Records' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Reg Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Review Info</th>
                <th className="py-3 px-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white">{r.full_name}</p>
                    <p className="text-[10px] text-slate-400">{r.email}</p>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                    {r.university_reg_number}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      r.account_status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                      r.account_status === 'pending_approval' ? 'bg-amber-500/20 text-amber-300' :
                      r.account_status === 'suspended' ? 'bg-red-600/20 text-red-400' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {r.account_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {r.reviewed_by ? (
                      <div>
                        <span>{r.reviewed_by} ({r.reviewer_role})</span>
                        {r.rejection_reason && (
                          <p className="text-[10px] text-rose-300 italic truncate max-w-xs">
                            Reason: {r.rejection_reason}
                          </p>
                        )}
                      </div>
                    ) : (
                      'Pending review'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    {r.account_status === 'pending_approval' && (
                      <>
                        <button
                          onClick={() => handleDecision(r.id, 'approve')}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900 text-[11px] font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(r.id)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 hover:bg-rose-900 text-[11px] font-bold"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {r.account_status === 'rejected' && (
                      <button
                        onClick={() => handleDecision(r.id, 'reconsider')}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 hover:bg-purple-900 text-[11px] font-bold"
                      >
                        Reconsider
                      </button>
                    )}

                    {r.account_status === 'active' && (
                      <button
                        onClick={() => handleDecision(r.id, 'suspend', 'Administrative review')}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded bg-red-950/60 text-red-400 border border-red-500/30 hover:bg-red-900 text-[11px] font-bold"
                      >
                        Suspend
                      </button>
                    )}

                    {r.account_status === 'suspended' && (
                      <button
                        onClick={() => handleDecision(r.id, 'reactivate')}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900 text-[11px] font-bold"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-rose-500/40 space-y-4">
            <h3 className="text-lg font-bold text-white">Reject Application</h3>
            <p className="text-xs text-slate-300">
              A rejection reason is mandatory and will be displayed on the student's status portal.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Ineligible registration number or incomplete academic credentials."
              className="w-full px-3 py-2 text-xs rounded-xl glass-input"
            />
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
                onClick={confirmRejection}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
