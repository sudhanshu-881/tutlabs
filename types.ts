import React from 'react';

export interface Tutor {
  id: number;
  name: string;
  subjects: string[];
  location: string;
  rating: number;
  image_url: string;
  verified: boolean;
  pincodes?: string[];
  availability?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Student {
  id: number;
  name: string;
  learning_goals: string[];
  location: string;
  level: string;
  image_url: string;
  pincode?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export type Theme = 'light' | 'dark';

export type Role = 'student' | 'tutor';

export interface Profile {
  id: string;
  full_name: string | null;
  education: string | null;
  experience: string | null;
  location: string | null;
  avatar_url: string | null;
  active_role: Role | null;
  preferred_location?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TuitionRequest {
  id: number;
  title: string;
  description: string;
  subjects: string[];
  level: string;
  location: string;
  pincode: string;
  budget_min?: number;
  budget_max?: number;
  preferred_timing?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  updated_at: string;
  read_at?: string | null;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
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
