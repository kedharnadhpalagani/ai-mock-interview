import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi, getErrorMessage } from '../../services/api';
import { StudentProfile } from '../../types';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { 
  User, 
  Calendar, 
  MapPin, 
  School, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ArrowLeft 
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    email: '',
    date_of_birth: '',
    place: '',
    university: "Vignan's University",
    academic_year: 'Third Year',
    branch: 'CSE',
    section: 'A',
    cgpa: 7.5,
    profile_image: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentApi.getProfile();
        const d = res.data;
        setFormData({
          name: d.name || '',
          registration_number: d.registration_number || '',
          email: d.email || '',
          date_of_birth: d.date_of_birth || '2004-01-01',
          place: d.place || '',
          university: d.university || "Vignan's University",
          academic_year: (d.academic_year as any) || 'Third Year',
          branch: (d.branch as any) || 'CSE',
          section: d.section || 'A',
          cgpa: d.cgpa || 7.5,
          profile_image: d.profile_image || '',
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cgpa' ? parseFloat(value) || 0 : value,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profile_image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation: CGPA strictly between 6.0 and 10.0
    if (formData.cgpa < 6.0 || formData.cgpa > 10.0) {
      setError('CGPA must be between 6.0 and 10.0 inclusive.');
      return;
    }

    setSaving(true);
    try {
      await studentApi.updateProfile({
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        place: formData.place,
        university: formData.university,
        academic_year: formData.academic_year as any,
        branch: formData.branch as any,
        section: formData.section,
        cgpa: formData.cgpa,
        profile_image: formData.profile_image,
      });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A1B]">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative">
      <QuantumAuroraBackground />

      <button
        onClick={() => navigate('/student/dashboard')}
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Dashboard</span>
      </button>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-purple-500/30">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/10">
          
          {/* Avatar Upload */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-cyan-400/60 bg-purple-950 flex items-center justify-center shadow-lg">
              {formData.profile_image ? (
                <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-purple-300" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 cursor-pointer shadow-md transition-all">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Student Header */}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-extrabold text-white">{formData.name || 'Student Profile'}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-500/30">
                {formData.registration_number}
              </span>
              <span className="text-xs text-purple-300 bg-purple-950/40 px-2.5 py-0.5 rounded border border-purple-500/30">
                {formData.university}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{formData.email}</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Profile successfully updated! You are eligible for AI Mock Interviews.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input"
              />
            </div>

            {/* University Registration Number (Locked) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                University Registration Number (Verified)
              </label>
              <input
                type="text"
                disabled
                value={formData.registration_number}
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input bg-black/40 text-slate-400 cursor-not-allowed font-mono"
                title="Registration number cannot be changed once verified."
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                required
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input"
              />
            </div>

            {/* Place */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Place / City</label>
              <input
                type="text"
                name="place"
                required
                value={formData.place}
                onChange={handleChange}
                placeholder="e.g. Guntur / Vijayawada"
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input"
              />
            </div>

            {/* University (Defaulted) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">University</label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input"
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Academic Year</label>
              <select
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input"
              >
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
                <option value="Fourth Year">Fourth Year</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input"
              >
                <option value="CSE">CSE (Computer Science & Engineering)</option>
                <option value="ECE">ECE (Electronics & Communication)</option>
                <option value="IT">IT (Information Technology)</option>
                <option value="Mechanical">Mechanical Engineering</option>
                <option value="Civil">Civil Engineering</option>
                <option value="EEE">EEE (Electrical & Electronics)</option>
                <option value="Other">Other Engineering Disciplines</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Section</label>
              <input
                type="text"
                name="section"
                required
                value={formData.section}
                onChange={handleChange}
                placeholder="e.g. A, B, C, or 1"
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input uppercase"
              />
            </div>

            {/* CGPA */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Current Cumulative CGPA (Required: 6.0 to 10.0)
                </label>
                <span className="text-sm font-bold text-cyan-300">{formData.cgpa.toFixed(2)}</span>
              </div>
              <input
                type="number"
                name="cgpa"
                step="0.01"
                min="6.0"
                max="10.0"
                required
                value={formData.cgpa}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl glass-input"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                University eligibility threshold requires CGPA between 6.0 and 10.0 inclusive.
              </p>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save & Complete Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
