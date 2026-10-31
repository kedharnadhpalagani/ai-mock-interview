import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentApi, getErrorMessage } from '../../services/api';
import { StudentStatusInfo } from '../../types';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  LogOut 
} from 'lucide-react';

export const ApplicationStatusPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [statusInfo, setStatusInfo] = useState<StudentStatusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await studentApi.getStatus();
      setStatusInfo(res.data);
      // Also update context session
      await refreshUser();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    fetchStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A1B]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm text-purple-300 font-medium">Checking application status...</p>
        </div>
      </div>
    );
  }

  const status = statusInfo?.account_status || user?.account_status || 'pending_approval';
  const regNumber = statusInfo?.registration_number || user?.registration_number || 'N/A';
  const rejectionReason = statusInfo?.rejection_reason || user?.rejection_reason;

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <QuantumAuroraBackground />

      <div className="w-full max-w-xl glass-panel p-8 sm:p-12 rounded-3xl border border-purple-500/30 relative text-center">
        
        {/* Status Indicator Icon */}
        <div className="mb-6 flex justify-center">
          {status === 'pending_approval' && (
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
          )}

          {status === 'active' && (
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}

          {status === 'rejected' && (
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          {status === 'suspended' && (
            <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-600/40 flex items-center justify-center text-red-500">
              <AlertOctagon className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-purple-300">
            Reg No: <span className="text-white font-mono">{regNumber}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {status === 'pending_approval' && 'Application Pending Approval'}
            {status === 'active' && 'Account Approved & Active!'}
            {status === 'rejected' && 'Application Not Approved'}
            {status === 'suspended' && 'Account Access Suspended'}
          </h2>
        </div>

        {/* Narrative / Informative Box */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-sm text-slate-300 leading-relaxed mb-8">
          {status === 'pending_approval' && (
            <div className="space-y-3">
              <p>
                Your registration has been verified via email OTP and is currently awaiting review 
                by Vignan University Placement Faculty or Administration.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-semibold pt-2 border-t border-white/5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Approval updates are posted directly here in real-time.</span>
              </div>
            </div>
          )}

          {status === 'active' && (
            <div className="space-y-3">
              <p className="text-emerald-300 font-medium">
                Congratulations! Your student account has been approved by the placement cell.
              </p>
              <p className="text-xs text-slate-400">
                You now have full access to profile completion, technical skill selection, and AI voice interviews.
              </p>
            </div>
          )}

          {status === 'rejected' && (
            <div className="space-y-3 text-left">
              <p className="text-rose-300 font-semibold">Reason for Rejection provided by Reviewer:</p>
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-mono">
                {rejectionReason || 'Registration credentials could not be verified against university departmental records.'}
              </div>
              <p className="text-xs text-slate-400">
                If you believe this decision is in error, please contact your department placement coordinator for reconsideration.
              </p>
            </div>
          )}

          {status === 'suspended' && (
            <div className="space-y-2 text-rose-300">
              <p>
                Access to AI mock interviews has been suspended for this account by administrative security controls.
              </p>
              <p className="text-xs text-slate-400">
                Please contact the Chief Placement Officer or System Administrator.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {status === 'pending_approval' && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Checking Database...' : 'Refresh Status'}</span>
            </button>
          )}

          {status === 'active' && (
            <Link
              to="/student/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <span>Go to Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
