import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi, getErrorMessage } from '../../services/api';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  Bot, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  User,
  Zap,
  BarChart2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const StudentDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await studentApi.getDashboard();
        setData(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A1B]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm text-purple-300">Loading student records...</p>
        </div>
      </div>
    );
  }

  const hasInterviews = data?.total_interviews > 0;
  const isProfileIncomplete = data?.profile_status === 'incomplete';

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      <QuantumAuroraBackground />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-cyan-300 mb-2">
            Placement Readiness Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome, {data?.student_name || 'Student'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Registration No: {data?.registration_number} • Vignan's University
          </p>
        </div>

        <Link
          to="/student/interview-setup"
          className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-xl shadow-purple-600/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start AI Mock Interview</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Profile Incomplete Reminder Alert */}
      {isProfileIncomplete && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">Complete Your Academic Profile</h4>
              <p className="text-xs text-slate-300">
                Please enter your academic year, branch, section, and CGPA to personalize interview questions.
              </p>
            </div>
          </div>
          <Link
            to="/student/profile"
            className="px-4 py-2 rounded-lg text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 transition-all"
          >
            Complete Profile Now
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        {/* Latest Score Card */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Latest Mock Score</span>
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {data?.latest_score !== null ? `${data.latest_score}` : '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <p className="text-[11px] text-cyan-300 mt-2 font-medium">
            {data?.latest_score !== null ? (data.latest_score >= 75 ? 'Placement Ready' : 'Needs Practice') : 'No attempts recorded'}
          </p>
        </div>

        {/* Total Interviews */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Completed Sessions</span>
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {data?.total_interviews || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Interviews</span>
          </div>
          <p className="text-[11px] text-purple-300 mt-2 font-medium">
            Full spoken AI evaluations
          </p>
        </div>

        {/* Average Score */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Average Performance</span>
            <TrendingUp className="w-5 h-5 text-pink-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {data?.average_score !== null ? `${data.average_score}` : '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <p className="text-[11px] text-pink-300 mt-2 font-medium">
            Across all technical skills
          </p>
        </div>

      </div>

      {hasInterviews ? (
        <div className="space-y-8">
          
          {/* Performance Trend Chart */}
          {data?.performance_trend && data.performance_trend.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Performance Score Trajectory</h3>
                  <p className="text-xs text-slate-400">Score progress across your recent interview sessions</p>
                </div>
                <BarChart2 className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.performance_trend}>
                    <defs>
                      <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="session" stroke="#64748B" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ background: '#16163F', border: '1px solid #8B5CF6', borderRadius: '8px', color: '#fff' }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#22D3EE" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#scoreGlow)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Strengths */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Demonstrated Strengths</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {data?.top_strengths?.length > 0 ? (
                  data.top_strengths.map((str: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/10">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs">Complete more sessions to identify strengths.</p>
                )}
              </ul>
            </div>

            {/* Areas for Refinement */}
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Areas for Refinement</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {data?.key_weaknesses?.length > 0 ? (
                  data.key_weaknesses.map((wk: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-950/20 border border-amber-500/10">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{wk}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs">Complete more sessions to isolate weaknesses.</p>
                )}
              </ul>
            </div>

          </div>

          {/* Recent Interviews History Table */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25">
            <h3 className="text-base font-bold text-white mb-4">Interview Assessment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Session Date</th>
                    <th className="py-3 px-4">Skills Assessed</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Overall Score</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {data?.recent_interviews?.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">{String(row.date).slice(0, 10)}</td>
                      <td className="py-3 px-4 font-semibold text-purple-300">
                        {row.skills?.slice(0, 2).join(', ')}
                        {row.skills?.length > 2 && ` +${row.skills.length - 2} more`}
                      </td>
                      <td className="py-3 px-4">{row.duration} mins</td>
                      <td className="py-3 px-4 font-bold text-cyan-300">
                        {row.overall_score} / 100
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/student/results/${row.interview_id}`}
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          <span>View Scorecard</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        // Proper Empty State when no previous interviews
        <div className="glass-panel p-12 rounded-3xl border border-purple-500/30 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <Bot className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">No Mock Interviews Taken Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You haven't participated in any AI voice technical interviews yet.
              Choose your technical categories, submit your project details, and take your first placement mock.
            </p>
          </div>
          <Link
            to="/student/interview-setup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-purple-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Your First Interview</span>
          </Link>
        </div>
      )}

    </div>
  );
};
