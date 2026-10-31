import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#080816] border-t border-purple-500/15 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/5">
          
          {/* Column 1: University Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/vignan-logo.png" 
                alt="Vignan's University Logo" 
                className="h-10 w-auto object-contain"
              />
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Vignan's University</h3>
                <p className="text-xs text-purple-400 font-medium">Deemed to be University • Vadlamudi, Guntur</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering students with next-generation real-time spoken AI mock interviews, 
              evidence-based evaluation metrics, and comprehensive placement readiness assessments.
            </p>
          </div>

          {/* Column 2: Portals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Portal Access</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/login?role=student" className="hover:text-cyan-400 transition-colors">
                  Student Assessment Portal
                </Link>
              </li>
              <li>
                <Link to="/login?role=faculty" className="hover:text-cyan-400 transition-colors">
                  Faculty & Department Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-cyan-400 transition-colors">
                  New Student Registration
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-cyan-400 transition-colors">
                  Application Status Check
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Skill Focus */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Curriculum Focus</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Data Structures & Algorithms</li>
              <li>Full Stack Web Development</li>
              <li>Machine Learning & AI</li>
              <li>Operating Systems & Networks</li>
              <li>System Architecture & Projects</li>
            </ul>
          </div>
        </div>

        {/* Bottom row: University copyright & discrete admin access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} Vignan's Foundation for Science, Technology & Research. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-400">
              Powered by Google Gemini Live AI & Quantum Aurora UI
            </span>

            {/* Discrete Administrative Access */}
            <Link
              to="/login?role=admin"
              className="text-slate-600 hover:text-purple-400 flex items-center gap-1 transition-colors group"
              title="Administrative Control Access"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
