import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewApi, getErrorMessage } from '../../services/api';
import { InterviewResult } from '../../types';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  Award, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Briefcase, 
  Clock, 
  Calendar, 
  ArrowLeft,
  Share2,
  Sparkles
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const InterviewResultsPage: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();

  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!interviewId) return;

    const fetchResult = async () => {
      try {
        const res = await interviewApi.getResult(interviewId);
        setResult(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [interviewId]);

  const handleDownloadPdf = async () => {
    if (!interviewId) return;
    setDownloading(true);
    try {
      const url = interviewApi.downloadPdfUrl(interviewId);
      const token = localStorage.getItem('vignan_auth_token');
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Vignan_Mock_Assessment_${result?.registration_number || 'Report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Could not download PDF report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A1B]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm text-purple-300">Evaluating performance metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center relative bg-[#0A0A1B]">
        <QuantumAuroraBackground />
        <div className="max-w-md glass-panel p-8 rounded-3xl border border-rose-500/30 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Results Unavailable</h2>
          <p className="text-xs text-slate-300">{error || 'Session evaluation could not be located.'}</p>
          <Link
            to="/student/dashboard"
            className="inline-block px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Format data for radar visualization
  const radarData = [
    { subject: 'Technical', score: result.technical_knowledge_score, fullMark: 100 },
    { subject: 'Project', score: result.project_understanding_score, fullMark: 100 },
    { subject: 'Communication', score: result.communication_score, fullMark: 100 },
    { subject: 'Problem Solving', score: result.problem_solving_score, fullMark: 100 },
    { subject: 'Soft Skills', score: result.behavioral_and_soft_skills_score, fullMark: 100 },
  ];

  const scoreBadgeColor = 
    result.overall_score >= 80 ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' :
    result.overall_score >= 65 ? 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' :
    'text-amber-400 bg-amber-500/20 border-amber-500/30';

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative space-y-8">
      <QuantumAuroraBackground />

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/student/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing Official PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Hero Scorecard Card */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/30 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-purple-300 bg-purple-900/40 border border-purple-500/30">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vignan University Technical Interview Assessment</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Placement Readiness Scorecard
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {result.final_verdict}
            </p>

            {/* Candidate Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block">Candidate:</span>
                <span className="font-bold text-white">{result.student_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registration:</span>
                <span className="font-mono font-bold text-cyan-300">{result.registration_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Interview Date:</span>
                <span className="font-semibold text-white">{String(result.interview_date).slice(0, 10)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Duration:</span>
                <span className="font-semibold text-white">{result.duration_minutes} Mins</span>
              </div>
            </div>
          </div>

          {/* Big Circular Overall Score Display */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-purple-950 to-indigo-950 border-4 border-purple-500/40 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Overall Score
              </span>
              <span className="text-5xl font-black text-white tracking-tight my-1">
                {result.overall_score}
              </span>
              <span className="text-xs text-slate-400">out of 100</span>
              <span className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${scoreBadgeColor}`}>
                {result.overall_score >= 75 ? 'Placement Ready' : 'Needs Practice'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Visual Analytics Row: Radar & Category Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Radar Chart */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25 flex flex-col items-center justify-center">
          <div className="w-full text-left mb-2">
            <h3 className="text-base font-bold text-white">5-Dimension Skill Radar</h3>
            <p className="text-xs text-slate-400">Comprehensive competency mapping</p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                <Radar 
                  name="Candidate" 
                  dataKey="score" 
                  stroke="#22D3EE" 
                  fill="#8B5CF6" 
                  fillOpacity={0.5} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25">
          <h3 className="text-base font-bold text-white mb-1">Evaluation Category Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Official university placement weight distribution</p>

          <div className="space-y-3">
            {result.category_breakdown.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{cat.category_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-purple-300">Weight: {cat.weight}%</span>
                    <span className="font-mono font-bold text-cyan-300">{cat.score} / 100</span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                  {cat.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Observations: Strong Answers vs Areas to Refine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Strong Answers */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Strong Answer Demonstrations</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {result.strong_answers.map((item, i) => (
              <li key={i} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Areas for Improvement & Knowledge Gaps</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {result.weak_answers.map((item, i) => (
              <li key={i} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2.5">
                <span className="text-amber-400 font-bold">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Recommended Practice & Suggested Career Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Practice Questions */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Recommended Placement Practice Questions</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            {result.recommended_practice_questions.map((q, i) => (
              <div key={i} className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 leading-relaxed">
                <span className="text-cyan-400 font-bold mr-2">Q{i + 1}:</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Roles */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25 space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-bold text-white">Recommended Career Roles</h3>
          </div>
          <p className="text-xs text-slate-400">
            Based on demonstrated technical depth, problem solving, and architecture defense:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {result.suggested_career_roles.map((role, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
