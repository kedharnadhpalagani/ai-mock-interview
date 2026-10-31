import React, { useState, useEffect } from 'react';
import { adminApi, getErrorMessage } from '../../services/api';
import { ProctoringIncident } from '../../types';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { ShieldAlert, AlertTriangle, RefreshCw, Eye } from 'lucide-react';

export const FlaggedIncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<ProctoringIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFlaggedIncidents();
      setIncidents(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative space-y-8">
      <QuantumAuroraBackground />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/20 text-xs font-semibold text-rose-300 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Interview Integrity Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Proctoring Violations & Flagged Sessions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review interview sessions with multiple warnings or automated integrity terminations
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Session Date</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Warning Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recorded Incidents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {incidents.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-slate-400">
                    {String(item.date).slice(0, 10)}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {item.student_name}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                    {item.registration_number}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-rose-300 bg-rose-950/60 border border-rose-500/30">
                      {item.warnings_count} / 4 Warnings
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'terminated_violation'
                        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {item.incidents?.map((inc, i) => (
                        <span key={i} className="block text-[10px] font-mono text-slate-400">
                          #{inc.warning_level}: {inc.type} ({inc.details || 'Integrity trigger'})
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
