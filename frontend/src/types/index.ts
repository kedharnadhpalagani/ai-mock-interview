export type Role = 'student' | 'faculty' | 'admin';

export type AccountStatus = 'pending_approval' | 'active' | 'rejected' | 'suspended';

export interface UserSession {
  user_id: string;
  name: string;
  email: string;
  role: Role;
  account_status: AccountStatus;
  profile_status?: 'incomplete' | 'completed';
  permissions?: string[];
  registration_number?: string;
  rejection_reason?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  registration_number: string;
  email: string;
  date_of_birth?: string;
  place?: string;
  university?: string;
  academic_year?: 'Second Year' | 'Third Year' | 'Fourth Year';
  branch?: 'CSE' | 'ECE' | 'IT' | 'Mechanical' | 'Civil' | 'EEE' | 'Other';
  section?: string;
  cgpa?: number;
  profile_image?: string;
  profile_status: 'incomplete' | 'completed';
  account_status: AccountStatus;
}

export interface StudentStatusInfo {
  account_status: AccountStatus;
  registration_number: string;
  email_verified: boolean;
  profile_status: string;
  rejection_reason?: string;
  message: string;
  can_access_interview: boolean;
}

export interface ProjectDetail {
  title: string;
  description: string;
  technologies: string;
  student_contribution: string;
  challenges: string;
  outcomes: string;
}

export interface InterviewSetupPayload {
  selected_skills: string[];
  projects: ProjectDetail[];
  target_role?: string;
  duration_minutes?: number;
}

export interface EvaluationCategoryBreakdown {
  category_name: string;
  score: number;
  weight: number;
  weighted_score: number;
  feedback: string;
}

export interface InterviewResult {
  id: string;
  interview_id: string;
  student_id: string;
  student_name: string;
  registration_number: string;
  interview_date: string;
  duration_minutes: number;
  skills_assessed: string[];
  project_topics: string[];
  overall_score: number;
  technical_knowledge_score: number;
  project_understanding_score: number;
  communication_score: number;
  problem_solving_score: number;
  behavioral_and_soft_skills_score: number;
  category_breakdown: EvaluationCategoryBreakdown[];
  strong_answers: string[];
  weak_answers: string[];
  knowledge_gaps: string[];
  skills_to_improve: string[];
  recommended_practice_questions: string[];
  suggested_career_roles: string[];
  final_verdict: string;
}

export interface FacultyAnalyticsOverview {
  total_approved_students: number;
  completed_interviews: number;
  average_score: number;
  highest_score: number;
  students_needing_improvement: number;
  recent_activity: Array<{
    interview_id: string;
    student_name: string;
    reg_no: string;
    overall_score: number;
    date: string;
  }>;
}

export interface FacultyMember {
  id: string;
  faculty_id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  permissions: string[];
  account_status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_id?: string;
  target_type?: string;
  reason?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ProctoringIncident {
  interview_id: string;
  student_name: string;
  registration_number: string;
  warnings_count: number;
  status: string;
  incidents: Array<{
    type: string;
    warning_level: number;
    timestamp: string;
    details?: string;
  }>;
  date: string;
}
