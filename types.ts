import React from 'react';

// FIX: Add global declaration for ion-icon custom element to fix TypeScript errors.
// By simplifying the type definition for 'ion-icon', we can resolve the issue where
// TypeScript fails to recognize it as a valid JSX element.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // FIX: Simplified the type for 'ion-icon' to only include used properties,
      // which avoids potential conflicts with React's HTML attribute types and
      // resolves the issue of it not being recognized as a valid JSX element.
      'ion-icon': {
        name: string;
        className?: string;
      };
    }
  }
}

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