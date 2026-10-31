import React, { useState, useEffect } from 'react';
import { adminApi, getErrorMessage } from '../../services/api';
import { AuditLog } from '../../types';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { FileText, ShieldAlert, RefreshCw, Clock, User, Eye } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs(100, 0);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative space-y-8">
      <QuantumAuroraBackground />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-slate-300 mb-2">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Immutable Administrative Audit Trail</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">System Security & Activity Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Auditing registrations, approval decisions, permission changes, and exports (Sensitive secrets sanitized)
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Trail</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Recorded System Audit Events</h2>
          <span className="text-xs text-slate-400 font-mono">{total} Total Logged Actions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans font-bold text-white">
                    {log.actor_name}
                  </td>
                  <td className="py-3 px-4 uppercase text-[10px] font-bold text-cyan-300">
                    {log.actor_role}
                  </td>
                  <td className="py-3 px-4 font-bold text-purple-300">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 max-w-xs truncate">
                    {log.reason || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                      title="View Sanitized Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-purple-500/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Audit Event Details</h3>
              <span className="text-xs text-purple-300 font-mono font-bold">{selectedLog.action}</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <p><span className="text-slate-500">Event ID:</span> {selectedLog.id}</p>
              <p><span className="text-slate-500">Actor:</span> {selectedLog.actor_name} ({selectedLog.actor_role})</p>
              <p><span className="text-slate-500">Actor ID:</span> {selectedLog.actor_id}</p>
              <p><span className="text-slate-500">Target Type:</span> {selectedLog.target_type || 'N/A'}</p>
              <p><span className="text-slate-500">Target ID:</span> {selectedLog.target_id || 'N/A'}</p>
              {selectedLog.reason && <p><span className="text-slate-500">Reason:</span> {selectedLog.reason}</p>}
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Sanitized Payload:</span>
              <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
