import axios, { AxiosError } from 'axios';
import {
  StudentProfile,
  StudentStatusInfo,
  InterviewSetupPayload,
  InterviewResult,
  FacultyMember,
  AuditLog,
  ProctoringIncident
} from '../types';

// Use environment variable in production (Render backend URL) or default to local FastAPI
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-mock-interview-smrk.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Bearer JWT token from storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vignan_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified error parsing
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{ detail?: string; message?: string }>;
    if (axiosErr.response?.data?.detail) {
      return axiosErr.response.data.detail;
    }
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
};

// API Services
export const authApi = {
  sendOtp: (email: string, purpose = 'registration') =>
    api.post('/auth/send-otp', { email, purpose }),

  verifyOtp: (email: string, otp: string, purpose = 'registration') =>
    api.post('/auth/verify-otp', { email, otp, purpose }),

  registerStudent: (payload: any, otp: string) =>
    api.post(`/auth/register-student?otp=${otp}`, payload),

  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, password }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  verifyResetOtp: (email: string, otp: string) =>
    api.post('/auth/verify-reset-otp', { email, otp, purpose: 'password_reset' }),

  resetPassword: (payload: { token: string; new_password: string; confirm_password: string }) =>
    api.post('/auth/reset-password', payload),

  getMe: () => api.get('/auth/me'),
};

export const studentApi = {
  getStatus: () => api.get<StudentStatusInfo>('/student/status'),
  getProfile: () => api.get<StudentProfile>('/student/profile'),
  updateProfile: (data: Partial<StudentProfile>) => api.put('/student/profile', data),
  getDashboard: () => api.get('/student/dashboard'),
};

export const interviewApi = {
  getSkills: () => api.get<{ skills: string[] }>('/interviews/skills-list'),
  setup: (payload: InterviewSetupPayload) => api.post('/interviews/setup', payload),
  getDetails: (id: string) => api.get(`/interviews/${id}`),
  endInterview: (id: string, payload: any) => api.post(`/interviews/${id}/end`, payload),
  getResult: (id: string) => api.get<InterviewResult>(`/interviews/${id}/result`),
  downloadPdfUrl: (id: string) => `${API_BASE_URL}/reports/${id}/pdf`,
};

export const approvalsApi = {
  getRequests: (status?: string) =>
    api.get(`/approvals/requests${status ? `?status=${status}` : ''}`),
  makeDecision: (student_id: string, action: string, rejection_reason?: string) =>
    api.post('/approvals/decision', { student_id, action, rejection_reason }),
};

export const facultyApi = {
  getDashboardStats: () => api.get('/faculty/dashboard-stats'),
  listFaculty: () => api.get<FacultyMember[]>('/faculty'),
  createFaculty: (data: any) => api.post<FacultyMember>('/faculty', data),
  updateFaculty: (id: string, data: any) => api.put(`/faculty/${id}`, data),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAuditLogs: (limit = 50, skip = 0) => api.get(`/admin/audit-logs?limit=${limit}&skip=${skip}`),
  getWeights: () => api.get('/admin/evaluation-weights'),
  updateWeights: (weights: Record<string, number>) => api.put('/admin/evaluation-weights', weights),
  getFlaggedIncidents: () => api.get<ProctoringIncident[]>('/admin/flagged-incidents'),
};

export const analyticsApi = {
  getStudents: (params: Record<string, any>) => api.get('/analytics/students', { params }),
  getBranchPerformance: () => api.get('/analytics/branch-performance'),
  getScoreDistribution: () => api.get('/analytics/score-distribution'),
  exportCsvUrl: () => `${API_BASE_URL}/analytics/export-csv`,
};
