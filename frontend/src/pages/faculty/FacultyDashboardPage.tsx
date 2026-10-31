import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { facultyApi, analyticsApi, getErrorMessage } from '../../services/api';
import { FacultyAnalyticsOverview } from '../../types';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  Users, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  BarChart3, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export const FacultyDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [branchData, setBranchData] = useState<any[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [section, setSection] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load summary statistics and branch data
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [statsRes, branchRes] = await Promise.all([
          facultyApi.getDashboardStats(),
          analyticsApi.getBranchPerformance(),
        ]);
        setStats(statsRes.data);
        setBranchData(branchRes.data.branch_analytics || []);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      }
    };
    fetchOverview();
  }, []);

  // Fetch filtered students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getStudents({
        search: search || undefined,
        branch: branch || undefined,
        academic_year: academicYear || undefined,
        section: section || undefined,
        page,
        limit: 15,
      });
      setStudents(res.data.students || []);
      setTotalStudents(res.data.total || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, branch, academicYear, section, page]);

  const handleExportCsv = () => {
    const url = analyticsApi.exportCsvUrl();
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative space-y-8">
      <QuantumAuroraBackground />

      {/* Page Title & Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-cyan-300 mb-2">
            Faculty & Department Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white">Student Placement Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Department oversight, mock interview scorecards, and placement readiness tracking
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-900/60 border border-purple-500/40 hover:bg-purple-800/60 shadow-lg flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Student Data (CSV)</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Approved Students */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Approved Students</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {stats?.total_approved_students ?? 0}
          </p>
          <p className="text-[11px] text-cyan-300 mt-1">Active candidates</p>
        </div>

        {/* Completed Interviews */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Completed Mocks</span>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {stats?.completed_interviews ?? 0}
          </p>
          <p className="text-[11px] text-purple-300 mt-1">Evaluated sessions</p>
        </div>

        {/* Average Score */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Average Score</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {stats?.average_score ?? 0} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </p>
          <p className="text-[11px] text-emerald-300 mt-1">
            Top Score: {stats?.highest_score ?? 0}
          </p>
        </div>

        {/* Students Needing Improvement */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/25">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Needing Refinement</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white mt-3">
            {stats?.students_needing_improvement ?? 0}
          </p>
          <p className="text-[11px] text-amber-300 mt-1">Score below 60/100</p>
        </div>

      </div>

      {/* Branch Performance Comparison Chart */}
      {branchData.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Branch-Wise Placement Score Comparison</h3>
              <p className="text-xs text-slate-400">Mean interview performance across engineering departments</p>
            </div>
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F4D" />
                <XAxis dataKey="branch" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ background: '#16163F', border: '1px solid #8B5CF6', borderRadius: '8px', color: '#fff' }} 
                />
                <Bar dataKey="average_score" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Search & Filtering Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/25 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Filter className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Student Search & Roster Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, reg number, email..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branch}
              onChange={(e) => { setBranch(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input"
            >
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="IT">IT</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="EEE">EEE</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={academicYear}
              onChange={(e) => { setAcademicYear(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input"
            >
              <option value="">All Academic Years</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <input
              type="text"
              value={section}
              onChange={(e) => { setSection(e.target.value); setPage(1); }}
              placeholder="Filter by section (e.g. A, B)"
              className="w-full px-3.5 py-2 text-xs rounded-xl glass-input uppercase"
            />
          </div>

        </div>
      </div>

      {/* Student Roster Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Student Placement Directory</h3>
          <span className="text-xs text-slate-400 font-mono">
            Showing {students.length} of {totalStudents} registered students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Reg Number</th>
                <th className="py-3 px-4">Branch / Year</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latest Score</th>
                <th className="py-3 px-4 text-right">Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-white/5 transition-colors">
                  
                  {/* Photo & Name */}
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-950 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                      {st.profile_image ? (
                        <img src={st.profile_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-purple-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">{st.name}</p>
                      <p className="text-[10px] text-slate-400">{st.email}</p>
                    </div>
                  </td>

                  {/* Reg No */}
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                    {st.registration_number}
                  </td>

                  {/* Branch & Year */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white">{st.branch}</span>
                    <span className="block text-[10px] text-slate-400">{st.academic_year}</span>
                  </td>

                  {/* Section */}
                  <td className="py-3 px-4 font-mono">{st.section}</td>

                  {/* CGPA */}
                  <td className="py-3 px-4 font-semibold text-purple-300">
                    {st.cgpa ? st.cgpa.toFixed(2) : '—'}
                  </td>

                  {/* Account Status */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      st.account_status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                      st.account_status === 'pending_approval' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {st.account_status}
                    </span>
                  </td>

                  {/* Latest Score */}
                  <td className="py-3 px-4 font-bold text-cyan-300">
                    {st.latest_score !== null ? `${st.latest_score} / 100` : 'Not Taken'}
                  </td>

                  {/* View Report */}
                  <td className="py-3 px-4 text-right">
                    {st.latest_interview_id ? (
                      <Link
                        to={`/student/results/${st.latest_interview_id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <span>Scorecard</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-slate-600 text-[11px]">No Mocks</span>
                    )}
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
