import React from 'react';

// =============================================
// CORE USER TYPES
// =============================================

export type Theme = 'light' | 'dark';
export type Role = 'student' | 'tutor' | 'admin';
export type SubscriptionTier = 'free' | 'premium' | 'enterprise';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type SessionType = 'online' | 'in_person' | 'hybrid';
export type SessionStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type NotificationType = 'message' | 'booking' | 'payment' | 'system' | 'marketing';
export type ConversationType = 'direct' | 'group' | 'support';

// =============================================
// ENHANCED PROFILE INTERFACE
// =============================================

export interface Profile {
  id: string;
  full_name: string | null;
  education: string | null;
  experience: string | null;
  location: string | null;
  avatar_url: string | null;
  active_role: Role | null;
  preferred_location?: string | null;
  preferred_language?: string;
  timezone?: string;
  notification_preferences?: NotificationPreferences;
  privacy_settings?: PrivacySettings;
  subscription_tier?: SubscriptionTier;
  last_active_at?: string;
  onboarding_completed?: boolean;
  verification_status?: VerificationStatus;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing?: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'connections_only';
  location_sharing: boolean;
  contact_info_visible: boolean;
}

// =============================================
// ENHANCED TUTOR INTERFACE
// =============================================

export interface Tutor {
  id: number;
  user_id: string;
  name: string;
  subjects: string[];
  location: string;
  rating: number;
  image_url: string;
  verified: boolean;
  pincodes?: string[];
  availability?: string | null;
  bio?: string | null;
  // Enhanced fields
  hourly_rate?: number;
  currency?: string;
  languages?: string[];
  teaching_experience_years?: number;
  education_qualifications?: EducationQualification[];
  certifications?: Certification[];
  teaching_methods?: string[];
  available_days?: string[];
  time_slots?: TimeSlot[];
  max_students_per_session?: number;
  online_teaching?: boolean;
  in_person_teaching?: boolean;
  trial_available?: boolean;
  trial_duration_minutes?: number;
  response_time_hours?: number;
  completion_rate?: number;
  total_sessions?: number;
  total_students?: number;
  last_active_at?: string;
  profile_completion_score?: number;
  created_at?: string;
}

export interface EducationQualification {
  degree: string;
  institution: string;
  year: number;
  field_of_study: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date_issued: string;
  expiry_date?: string;
  credential_id?: string;
}

export interface TimeSlot {
  day: string;
  start_time: string;
  end_time: string;
  timezone: string;
}

// =============================================
// ENHANCED STUDENT INTERFACE
// =============================================

export interface Student {
  id: number;
  user_id: string;
  name: string;
  learning_goals: string[];
  location: string;
  level: string;
  image_url: string;
  pincode?: string | null;
  // Enhanced fields
  preferred_language?: string;
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  budget_range?: BudgetRange;
  preferred_timing?: string[];
  learning_goals_detailed?: LearningGoal[];
  current_level?: string;
  target_level?: string;
  study_commitment_hours_per_week?: number;
  preferred_teaching_methods?: string[];
  special_requirements?: string;
  parent_contact_email?: string;
  parent_contact_phone?: string;
  emergency_contact?: EmergencyContact;
  created_at?: string;
}

export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface LearningGoal {
  subject: string;
  level: string;
  target_date?: string;
  priority: 'high' | 'medium' | 'low';
  description?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// =============================================
// MESSAGING SYSTEM TYPES
// =============================================

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  participants?: ConversationParticipant[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at?: string;
  user?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  metadata?: Record<string, any>;
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  receipts?: MessageReceipt[];
  reply_to?: Message;
}

export interface MessageReceipt {
  id: string;
  message_id: string;
  user_id: string;
  status: MessageStatus;
  created_at: string;
}

// =============================================
// SESSION & BOOKING TYPES
// =============================================

export interface Session {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string;
  session_type: SessionType;
  status: SessionStatus;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link?: string;
  location?: string;
  notes?: string;
  price: number;
  currency: string;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  tutor?: Tutor;
  student?: Student;
  feedback?: SessionFeedback[];
}

export interface SessionFeedback {
  id: string;
  session_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  feedback_text?: string;
  categories?: Record<string, number>;
  created_at: string;
  reviewer?: Profile;
}

// =============================================
// PAYMENT & SUBSCRIPTION TYPES
// =============================================

export interface Payment {
  id: string;
  user_id: string;
  session_id?: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_provider: 'stripe' | 'razorpay' | 'paypal';
  provider_transaction_id?: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// NOTIFICATION TYPES
// =============================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
  read_at?: string;
  sent_at?: string;
  created_at: string;
}

// =============================================
// ANALYTICS TYPES
// =============================================

export interface UserAnalytics {
  id: string;
  user_id: string;
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SearchFilters {
  location?: string;
  pincode?: string;
  subjects?: string[];
  min_rating?: number;
  max_price?: number;
  availability?: string[];
  teaching_methods?: string[];
  languages?: string[];
  verified_only?: boolean;
  online_only?: boolean;
  in_person_only?: boolean;
}

export interface TutorSearchResult {
  tutors: Tutor[];
  total: number;
  filters_applied: SearchFilters;
  search_time_ms: number;
}

export interface StudentSearchResult {
  students: Student[];
  total: number;
  filters_applied: SearchFilters;
  search_time_ms: number;
}

// =============================================
// FORM TYPES
// =============================================

export interface TutorOnboardingForm {
  name: string;
  subjects: string[];
  location: string;
  pincodes: string[];
  bio: string;
  hourly_rate: number;
  languages: string[];
  teaching_experience_years: number;
  education_qualifications: EducationQualification[];
  certifications: Certification[];
  teaching_methods: string[];
  available_days: string[];
  time_slots: TimeSlot[];
  max_students_per_session: number;
  online_teaching: boolean;
  in_person_teaching: boolean;
  trial_available: boolean;
  trial_duration_minutes: number;
  response_time_hours: number;
}

export interface StudentOnboardingForm {
  name: string;
  learning_goals: string[];
  location: string;
  level: string;
  preferred_language: string;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  budget_range: BudgetRange;
  preferred_timing: string[];
  learning_goals_detailed: LearningGoal[];
  current_level: string;
  target_level: string;
  study_commitment_hours_per_week: number;
  preferred_teaching_methods: string[];
  special_requirements?: string;
  parent_contact_email?: string;
  parent_contact_phone?: string;
  emergency_contact?: EmergencyContact;
}

// =============================================
// DASHBOARD TYPES
// =============================================

export interface DashboardStats {
  total_sessions: number;
  completed_sessions: number;
  upcoming_sessions: number;
  total_earnings: number;
  average_rating: number;
  total_students: number;
  response_rate: number;
  profile_completion: number;
}

export interface RecentActivity {
  id: string;
  type: 'session' | 'message' | 'payment' | 'review';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// =============================================
// LEGACY TYPES (for backward compatibility)
// =============================================

export interface TuitionRequest {
  id: number;
  subject: string;
  pincode: string;
  class?: string;
  timing?: string;
  location?: string;
  details?: string;
  created_at: string;
}

// Defines global types for custom elements to be recognized by TypeScript's JSX parser.
declare global {
  // FIX: Add Vite environment variable types to the global ImportMeta interface.
  // This ensures TypeScript recognizes `import.meta.env` and provides type safety.
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_CONTACT_EMAIL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name: string;
      };
    }
  }
}
