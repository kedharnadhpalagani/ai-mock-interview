import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi, getErrorMessage } from '../../services/api';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { Role } from '../../types';
import { 
  User, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  GraduationCap, 
  Briefcase, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const roleParam = searchParams.get('role') as Role | null;
  const [activeRole, setActiveRole] = useState<Role>(roleParam || 'student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleParam && ['student', 'faculty', 'admin'].includes(roleParam)) {
      setActiveRole(roleParam);
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(identifier.trim(), password);
      const data = res.data;

      // Persist session in AuthContext
      login(data.access_token, data);

      // Role and status routing logic
      if (data.role === 'student') {
        if (data.account_status === 'pending_approval' || data.account_status === 'rejected') {
          navigate('/status');
        } else {
          navigate('/student/dashboard');
        }
      } else if (data.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <QuantumAuroraBackground />

      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/30 relative">
        
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <img 
            src="/assets/vignan-logo.png" 
            alt="Vignan University" 
            className="h-12 w-auto mx-auto object-contain"
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Sign In</h2>
          <p className="text-xs text-slate-400">
            AI Mock Interview Portal • Vignan's University
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setActiveRole('student'); setError(null); }}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'student'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('faculty'); setError(null); }}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'faculty'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Faculty</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('admin'); setError(null); }}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {activeRole === 'student'
                ? 'Email or Registration Number'
                : activeRole === 'faculty'
                ? 'Faculty ID or Email'
                : 'Administrator Username'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  activeRole === 'student'
                    ? 'e.g. 211FA04001 or email'
                    : activeRole === 'faculty'
                    ? 'e.g. FAC101 or faculty email'
                    : 'Admin username'
                }
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              {activeRole === 'student' && (
                <Link to="/forgot-password" className="text-[11px] text-cyan-400 hover:text-cyan-300">
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In as {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Guidance */}
        <div className="mt-8 text-center text-xs text-slate-400 border-t border-white/10 pt-4 space-y-2">
          {activeRole === 'student' ? (
            <p>
              New student?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold">
                Register for Placement Mocks
              </Link>
            </p>
          ) : activeRole === 'faculty' ? (
            <p className="text-slate-500 text-[11px]">
              Faculty credentials are provisioned by University Administration.
            </p>
          ) : (
            <p className="text-slate-500 text-[11px]">
              Initial admin credentials are configured during Render deployment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
