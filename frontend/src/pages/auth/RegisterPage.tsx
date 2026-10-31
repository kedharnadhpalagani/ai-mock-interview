import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi, getErrorMessage } from '../../services/api';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { User, Mail, Hash, Lock, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    regNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.sendOtp(formData.email.trim(), 'registration');
      setOtpMessage(res.data.message || 'Verification code sent to your email.');
      setOtpStep(true);
      startCooldown();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.sendOtp(formData.email.trim(), 'registration');
      setOtpMessage(res.data.message || 'A new verification code has been dispatched.');
      startCooldown();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        full_name: formData.fullName.trim(),
        university_reg_number: formData.regNumber.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      const res = await authApi.registerStudent(payload, otpCode.trim());
      // Log user in with restricted pending_approval token
      login(res.data.access_token, res.data);
      // Route immediately to application status page
      navigate('/status');
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
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/20 text-xs font-semibold text-cyan-300">
            Student Onboarding
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Create Student Account</h2>
          <p className="text-xs text-slate-400">
            Official registration for Vignan University mock placements
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!otpStep ? (
          // Step 1: Student Information Form
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">University Registration Number</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="regNumber"
                  required
                  value={formData.regNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 211FA04001"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Student Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@vignan.ac.in or personal email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
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
                  <span>Verify Email via OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          // Step 2: OTP Entry Form
          <form onSubmit={handleVerifyAndRegister} className="space-y-6">
            <div className="p-4 rounded-xl bg-purple-900/30 border border-purple-500/20 text-center space-y-1">
              <KeyRound className="w-8 h-8 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-slate-300">
                A 6-digit verification code has been dispatched via Resend to:
              </p>
              <p className="text-sm font-bold text-cyan-300">{formData.email}</p>
            </div>

            {otpMessage && (
              <p className="text-xs text-center text-emerald-400">{otpMessage}</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 text-center mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[12px] text-2xl font-black py-3 rounded-xl glass-input text-cyan-300 placeholder:tracking-normal placeholder:text-slate-600"
              />
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Code expires in 5 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & Register</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="text-slate-400 hover:text-white"
              >
                ← Back to Details
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendOtp}
                className="text-cyan-400 hover:text-cyan-300 font-semibold disabled:text-slate-600 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-400 border-t border-white/10 pt-4">
          Already registered?{' '}
          <Link to="/login?role=student" className="text-cyan-400 hover:text-cyan-300 font-bold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
