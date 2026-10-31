import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  BarChart3, 
  FileText,
  Sliders,
  Settings
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0A0A1B]/80 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Vignan University Logo & Title Branding */}
          <Link to="/" className="flex items-center gap-3.5 group transition-transform duration-200 hover:scale-[1.01]">
            <img 
              src="/assets/vignan-logo.png" 
              alt="Vignan's University Official Logo" 
              className="h-12 w-auto object-contain flex-shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-aurora-cyan transition-colors">
                Vignan's University
              </span>
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-purple-400">
                AI Mock Interview Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  How It Works
                </a>
                <a href="#evaluation" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Evaluation
                </a>

                <div className="flex items-center gap-3 ml-2 border-l border-white/10 pl-6">
                  {/* Student Login Button */}
                  <Link
                    to="/login?role=student"
                    className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-200 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Student Login
                  </Link>

                  {/* Faculty Login Button */}
                  <Link
                    to="/login?role=faculty"
                    className="px-4 py-2 text-sm font-semibold rounded-lg text-purple-300 hover:text-white border border-purple-500/40 hover:bg-purple-500/10 transition-all"
                  >
                    Faculty Login
                  </Link>

                  {/* Get Started / Register CTA */}
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-sm font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            ) : (
              // Authenticated Navigation based on role
              <div className="flex items-center gap-5">
                {user.role === 'student' && (
                  <>
                    <Link
                      to="/student/dashboard"
                      className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Dashboard
                    </Link>
                    {user.account_status === 'active' && (
                      <Link
                        to="/student/interview-setup"
                        className="px-4 py-2 text-sm font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 flex items-center gap-1.5 shadow-md shadow-purple-500/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        Start Mock Interview
                      </Link>
                    )}
                    <Link
                      to="/student/profile"
                      className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      Profile
                    </Link>
                    <Link
                      to="/status"
                      className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Status
                    </Link>
                  </>
                )}

                {user.role === 'faculty' && (
                  <>
                    <Link
                      to="/faculty/dashboard"
                      className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Faculty Portal
                    </Link>
                    {user.permissions?.includes('student_approval') && (
                      <Link
                        to="/faculty/approvals"
                        className="text-sm font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        Student Approvals
                      </Link>
                    )}
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      Admin Control
                    </Link>
                    <Link
                      to="/admin/approvals"
                      className="text-sm font-medium text-slate-300 hover:text-white"
                    >
                      Approvals
                    </Link>
                    <Link
                      to="/admin/faculty"
                      className="text-sm font-medium text-slate-300 hover:text-white"
                    >
                      Faculty
                    </Link>
                    <Link
                      to="/admin/weights"
                      className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      Weights
                    </Link>
                    <Link
                      to="/admin/audit-logs"
                      className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      Audit
                    </Link>
                  </>
                )}

                {/* User Pill & Logout */}
                <div className="flex items-center gap-3 border-l border-white/10 pl-5">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-white leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-cyan-400 tracking-wider">
                      {user.role} {user.account_status !== 'active' && `(${user.account_status})`}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-3 bg-[#10102B] border-b border-purple-500/20">
          {!user ? (
            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                to="/login?role=student"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-white bg-purple-900/40 border border-purple-500/30 font-semibold text-sm"
              >
                Student Login
              </Link>
              <Link
                to="/login?role=faculty"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-purple-300 border border-purple-500/40 font-semibold text-sm"
              >
                Faculty Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-white bg-gradient-to-r from-purple-600 to-cyan-500 font-bold text-sm"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <div className="py-2 border-b border-white/10 mb-1">
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-cyan-400 capitalize">{user.role} • {user.account_status}</p>
              </div>

              {user.role === 'student' && (
                <>
                  <Link to="/student/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-200 py-1.5">
                    Dashboard
                  </Link>
                  <Link to="/student/interview-setup" onClick={() => setMobileMenuOpen(false)} className="text-sm text-cyan-300 py-1.5 font-semibold">
                    Start Mock Interview
                  </Link>
                  <Link to="/student/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-200 py-1.5">
                    Profile
                  </Link>
                  <Link to="/status" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-200 py-1.5">
                    Application Status
                  </Link>
                </>
              )}

              {user.role === 'faculty' && (
                <>
                  <Link to="/faculty/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-200 py-1.5">
                    Faculty Dashboard
                  </Link>
                  {user.permissions?.includes('student_approval') && (
                    <Link to="/faculty/approvals" onClick={() => setMobileMenuOpen(false)} className="text-sm text-amber-300 py-1.5">
                      Student Approvals
                    </Link>
                  )}
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-200 py-1.5">
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/approvals" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-200 py-1.5">
                    Approval Requests
                  </Link>
                  <Link to="/admin/faculty" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-200 py-1.5">
                    Faculty Management
                  </Link>
                  <Link to="/admin/weights" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-200 py-1.5">
                    Evaluation Weights
                  </Link>
                  <Link to="/admin/audit-logs" onClick={() => setMobileMenuOpen(false)} className="text-sm text-slate-200 py-1.5">
                    Audit Logs
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mt-3 text-left text-sm text-rose-400 font-semibold py-1.5 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
