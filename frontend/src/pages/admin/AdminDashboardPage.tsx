import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, getErrorMessage } from '../../services/api';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  UserX, 
  AlertOctagon, 
  Briefcase, 
  Bot, 
  FileText, 
  Sliders, 
  ArrowRight, 
  AlertTriangle 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await adminApi.getDashboard();
        setStats(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A1B]">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative space-y-8">
      <QuantumAuroraBackground />

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Administrative Control Center • Vignan's University</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">System Governance & Operations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete administration of candidates, faculty privileges, evaluation weights, and security audit logs
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Grid of Key Admin Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Registered</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3">{stats?.total_students ?? 0}</p>
          <div className="flex gap-2 text-[10px] mt-2 font-medium">
            <span className="text-emerald-400">{stats?.active_students ?? 0} Active</span>
            <span className="text-amber-400">{stats?.pending_approvals ?? 0} Pending</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Pending Approvals</span>
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3">{stats?.pending_approvals ?? 0}</p>
          <Link to="/admin/approvals" className="text-[11px] text-amber-300 hover:underline mt-2 inline-block">
            Review Approval Queue →
          </Link>
        </div>

        {/* Faculty Count */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Faculty Members</span>
            <Briefcase className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3">{stats?.total_faculty ?? 0}</p>
          <Link to="/admin/faculty" className="text-[11px] text-purple-300 hover:underline mt-2 inline-block">
            Manage Faculty & Permissions →
          </Link>
        </div>

        {/* Total Interviews & Avg */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Interviews Conducted</span>
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3">{stats?.total_interviews ?? 0}</p>
          <p className="text-[11px] text-emerald-300 mt-2">
            Average: {stats?.average_interview_score ?? 0} / 100
          </p>
        </div>

      </div>

      {/* Quick Access Control Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Student Approvals */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/25 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-cyan-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Student Registration Approvals</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Approve, reject with required reasons, reconsider past decisions, or suspend accounts.
          </p>
          <Link
            to="/admin/approvals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 pt-2"
          >
            <span>Access Approvals Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 2: Faculty Management */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/25 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Faculty & Delegated Permissions</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create faculty accounts, assign unique faculty IDs, configure initial credentials, and grant permissions.
          </p>
          <Link
            to="/admin/faculty"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 pt-2"
          >
            <span>Manage Faculty</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 3: Evaluation Weights */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/25 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-pink-400">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Placement Evaluation Weights</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Calibrate scoring weights across Technical, Project, Communication, Problem Solving, and Soft Skills.
          </p>
          <Link
            to="/admin/weights"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300 pt-2"
          >
            <span>Configure Weights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 4: Audit Logs */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/25 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-slate-400">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">System Audit Trail</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Immutable log of all user registrations, approval decisions, permission changes, and exports.
          </p>
          <Link
            to="/admin/audit-logs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white pt-2"
          >
            <span>View Audit Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 5: Flagged Incidents */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/25 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Proctoring Incident Reviews</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect sessions with repeated warnings, camera disconnects, or integrity violation terminations.
          </p>
          <Link
            to="/admin/incidents"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 pt-2"
          >
            <span>Review Incidents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
