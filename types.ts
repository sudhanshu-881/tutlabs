import React from 'react';

// FIX: Correctly define the 'ion-icon' custom element for JSX to resolve TypeScript errors.
// The previous definition was not being correctly applied. This more robust definition
// ensures 'ion-icon' is recognized as a valid JSX element with all its expected props.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name: string;
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
