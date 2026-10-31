import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewApi, getErrorMessage } from '../../services/api';
import { ProjectDetail } from '../../types';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  Cpu, 
  Code2, 
  Layers, 
  FolderGit2, 
  Plus, 
  Trash2, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  CheckSquare, 
  Square 
} from 'lucide-react';

const AUTHORIZED_SKILLS = [
  "C",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "Data Structures and Algorithms",
  "SQL and Databases",
  "HTML, CSS and Web Development",
  "Machine Learning and Artificial Intelligence",
  "Operating Systems and Computer Networks"
];

export const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'Data Structures and Algorithms']);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [targetRole, setTargetRole] = useState<string>('Software Development Engineer');

  const [projects, setProjects] = useState<ProjectDetail[]>([
    {
      title: 'Distributed Placement Portal',
      description: 'A full-stack campus placement management system handling real-time application pipelines and mock assessments.',
      technologies: 'Python, FastAPI, MongoDB, React, Tailwind CSS',
      student_contribution: 'Designed database indexing, JWT authentication with role authorization, and REST endpoints.',
      challenges: 'Handling concurrent student submissions without race conditions or duplicate entries.',
      outcomes: 'Reduced manual administrative overhead by 70% and enabled instant student feedback.'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length === 1) {
        setError('Please keep at least one technical skill selected.');
        return;
      }
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setError(null);
  };

  const handleProjectChange = (index: number, field: keyof ProjectDetail, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addProject = () => {
    setProjects([
      ...projects,
      {
        title: '',
        description: '',
        technologies: '',
        student_contribution: '',
        challenges: '',
        outcomes: ''
      }
    ]);
  };

  const removeProject = (index: number) => {
    if (projects.length <= 1) {
      setError('At least one project is required to initiate an interview.');
      return;
    }
    setProjects(projects.filter((_, i) => i !== index));
    setError(null);
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (selectedSkills.length === 0) {
      setError('Please select at least one technical skill domain.');
      return;
    }

    // Validate project fields
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      if (!p.title.trim() || !p.description.trim() || !p.student_contribution.trim()) {
        setError(`Please fill in all details for Project #${i + 1} (Title, Description, and Contribution are mandatory).`);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await interviewApi.setup({
        selected_skills: selectedSkills,
        projects,
        target_role: targetRole,
        duration_minutes: durationMinutes,
      });

      // Route directly to real-time voice interview room
      navigate(`/student/interview-room/${res.data.interview_id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative">
      <QuantumAuroraBackground />

      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-cyan-300">
          Session Configuration
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Setup Your Mock Technical Interview</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Customize your interview domain, configure your target engineering role, and detail your project experience for AI voice defense.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="space-y-10">
        
        {/* Step 1: Technical Skill Domains */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">1. Select Technical Skill Categories</h2>
            </div>
            <span className="text-xs text-purple-300 font-semibold">
              {selectedSkills.length} selected
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Select one or more core technical domains. The AI will generate ~2-3 questions per category with progressive difficulty.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {AUTHORIZED_SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-purple-900/40 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-black/30 border-white/10 text-slate-400 hover:border-purple-500/40 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-semibold">{skill}</span>
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Project Information Intake */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">2. Technical Project Experience (Required)</h2>
            </div>
            <button
              type="button"
              onClick={addProject}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 hover:bg-cyan-900/60 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Project</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            At least one technical project is required. The AI interviewer will probe your architectural decisions, trade-offs, and personal contributions.
          </p>

          <div className="space-y-6">
            {projects.map((project, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Project #{idx + 1}
                  </span>
                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      value={project.title}
                      onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                      placeholder="e.g. AI-Powered Medical Diagnosis Engine"
                      className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Technologies & Tools</label>
                    <input
                      type="text"
                      required
                      value={project.technologies}
                      onChange={(e) => handleProjectChange(idx, 'technologies', e.target.value)}
                      placeholder="e.g. Python, PyTorch, FastAPI, Docker"
                      className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Description & Architecture</label>
                  <textarea
                    rows={2}
                    required
                    value={project.description}
                    onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                    placeholder="Briefly describe the purpose, system architecture, and core modules."
                    className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Individual Contribution</label>
                    <textarea
                      rows={2}
                      required
                      value={project.student_contribution}
                      onChange={(e) => handleProjectChange(idx, 'student_contribution', e.target.value)}
                      placeholder="What parts did you personally design and code?"
                      className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Key Challenges & Roadblocks</label>
                    <textarea
                      rows={2}
                      required
                      value={project.challenges}
                      onChange={(e) => handleProjectChange(idx, 'challenges', e.target.value)}
                      placeholder="What bugs or design bottlenecks did you resolve?"
                      className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Measurable Outcomes</label>
                    <textarea
                      rows={2}
                      required
                      value={project.outcomes}
                      onChange={(e) => handleProjectChange(idx, 'outcomes', e.target.value)}
                      placeholder="Latency improvement, user feedback, accuracy score."
                      className="w-full px-3.5 py-2 text-xs rounded-xl glass-input"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Role and Duration Config */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Clock className="w-5 h-5 text-pink-400" />
            <h2 className="text-lg font-bold text-white">3. Session Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Placement Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl glass-input"
              >
                <option value="Software Development Engineer">Software Development Engineer (SDE)</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Data Analyst / Engineer">Data Analyst / Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="QA Engineer">QA Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Interview Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 text-xs rounded-xl glass-input"
              >
                <option value={15}>15 Minutes (Express Mock — ~8 Questions)</option>
                <option value={20}>20 Minutes (Standard Placement Mock — ~12 Questions)</option>
                <option value={30}>30 Minutes (Deep Comprehensive Mock — ~18 Questions)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-2xl shadow-purple-600/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Enter Live AI Voice Interview Room</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
