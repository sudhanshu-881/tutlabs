import React from 'react';

export interface Tutor {
  id: number;
  name: string;
  subjects: string[];
  location: string;
  rating: number;
  image_url: string;
  verified: boolean;
}

export interface Student {
  id: number;
  name: string;
  learning_goals: string[];
  location: string;
  level: string;
  image_url: string;
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
}

// Defines global types for custom elements to be recognized by TypeScript's JSX parser.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name: string;
      };
    }
  }
}
