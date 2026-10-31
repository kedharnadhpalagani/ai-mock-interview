import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  Mic, 
  ShieldCheck, 
  Award, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  BookOpen, 
  Users, 
  FileCheck
} from 'lucide-react';
import { QuantumAuroraBackground } from '../components/QuantumAuroraBackground';
import { AIInterviewerAvatar } from '../components/AIInterviewerAvatar';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      <QuantumAuroraBackground />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading and Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* University Tag pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs sm:text-sm font-semibold text-purple-200">
                Official AI Mock Interview Platform • Vignan's University
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              AI MOCK INTERVIEW
              <span className="block text-aurora text-3xl sm:text-5xl mt-2 font-black">
                Practice Smarter. Speak Confidently. Get Interview-Ready.
              </span>
            </h1>

            {/* Narrative description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Experience realistic, spoken AI technical interviews powered by Google Gemini Live.
              Sharpen your core coding knowledge, defend your engineering projects, and receive 
              instant evidence-based evaluation reports tailored for top campus placements.
            </p>

            {/* Prominent CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-xl shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Get Started — Student Register</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/login?role=student"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-base font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Student Login</span>
              </Link>

              <Link
                to="/login?role=faculty"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-base font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Faculty Login</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 text-slate-400 text-xs sm:text-sm">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>10 Tech Categories</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Live Spoken Voice AI</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Downloadable PDF Reports</span>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Quantum AI Visual */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

              <AIInterviewerAvatar state="speaking" speakerVolume={0.7} />

              <div className="mt-6 text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Vignan AI Technical Interviewer</h3>
                <p className="text-xs text-cyan-300 font-medium">Powered by Google Gemini Live Voice API</p>
                <div className="pt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-time Audio Stream • Bi-directional Turn Taking</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0C0B22]/90 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-extrabold">Next-Gen Placement Preparation</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for Authentic Technical Interviews
            </h3>
            <p className="text-slate-400 text-sm sm:text-base">
              Moving beyond static multiple-choice questions. Prepare for real recruiters with dynamic conversational interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-cyan-400">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Spoken AI Voice Dialogue</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interact through genuine natural speech. The AI listens to your vocal answers, probes with follow-ups, and speaks back naturally.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">10 Skill Domains & Projects</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Practice C, C++, Java, Python, Web Dev, DSA, SQL, ML/AI, and defense of your personal engineering projects.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-pink-400">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Evidence-Based Evaluation</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive structured evaluations with weighted category scoring (40% Technical, 25% Project, 15% Comm, 10% Problem-Solving, 10% Soft Skills).
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-purple-400 font-extrabold">Workflow</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            How The Mock Interview Platform Operates
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Register & Verify OTP",
              desc: "Sign up with your university reg number and verify your student email via Resend OTP.",
              icon: BookOpen
            },
            {
              step: "02",
              title: "Faculty Approval",
              desc: "Faculty or Administrators review and approve eligible students into the active interview roster.",
              icon: ShieldCheck
            },
            {
              step: "03",
              title: "Skills & Project Setup",
              desc: "Select your target technical categories and detail your development project experiences.",
              icon: Cpu
            },
            {
              step: "04",
              title: "Live Mock & Report",
              desc: "Converse with Vignan AI via webcam/mic and download your official assessment PDF report.",
              icon: FileCheck
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl relative space-y-3">
              <span className="text-3xl font-black text-purple-500/40">{item.step}</span>
              <h4 className="text-base font-bold text-white">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Evaluation Preview Section */}
      <section id="evaluation" className="py-20 bg-[#0C0B22]/90 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-extrabold">Evaluation Criteria</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                Weighted Placement Assessment Matrix
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Vignan's evaluation engine measures your answers through configured academic weights.
                Every score is directly rooted in verified statements from your interview transcript.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { name: "Technical Knowledge", weight: "40%", color: "text-cyan-400" },
                  { name: "Project Understanding & Ownership", weight: "25%", color: "text-purple-400" },
                  { name: "Communication & Articulation", weight: "15%", color: "text-pink-400" },
                  { name: "Problem-Solving & Logic", weight: "10%", color: "text-amber-400" },
                  { name: "Behavioral & Soft Skills", weight: "10%", color: "text-emerald-400" },
                ].map((crit, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-purple-900/20 border border-purple-500/20">
                    <span className="text-sm font-semibold text-slate-200">{crit.name}</span>
                    <span className={`text-sm font-bold ${crit.color}`}>{crit.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="glass-panel p-8 rounded-3xl border border-cyan-500/30 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <h4 className="text-base font-bold text-white">Evaluation Scorecard Sample</h4>
                    <p className="text-xs text-slate-400">Official Vignan Placement Standard</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Score: 88.5 / 100
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-black/40">
                    <span className="text-cyan-400 font-bold block mb-1">Strong Demonstrations:</span>
                    <p>• Articulated microservice communication and database indexing in Project defense.</p>
                    <p>• Clear grasp of memory management in C/Python.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40">
                    <span className="text-amber-400 font-bold block mb-1">Recommended Practice:</span>
                    <p>• Practice quantitative metrics explanation for system latency bottlenecks.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40">
                    <span className="text-purple-400 font-bold block mb-1">Suggested Placement Roles:</span>
                    <p>• Full Stack Developer • Software Development Engineer • Backend Developer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Begin CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glass-panel p-12 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Ace Your Campus Placements?
          </h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Take your first spoken AI technical mock interview and discover your exact placement readiness score today.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-purple-500/30 transition-all"
            >
              Start Free Registration
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
