export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function success<T>(data: T): Result<T, any> {
  return { success: true, data };
}

export function failure<E>(error: E): Result<any, E> {
  return { success: false, error };
}

export interface UIState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// Добавленные недостающие типы
export interface ProgressEntry {
  id: string;
  date: string;
  status: 'sober' | 'relapse';
  mood: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  startDate: string;
  motivations: string[];
  notifications: {
    daily: boolean;
    time: string;
    emergency: boolean;
  };
  theme: string;
  accessibility: {
    largeText: boolean;
    highContrast: boolean;
    voiceFeedback: boolean;
    hapticFeedback: boolean;
  };
}

export interface MoodEntry {
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  triggers?: string[];
  cravingLevel?: 1 | 2 | 3 | 4 | 5;
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface PsychologyTip {
  id: string;
  title: string;
  content: string;
  category: 'understanding' | 'techniques' | 'motivation' | 'coping';
  readingTime: number;
}

export interface NLPExercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  steps: string[];
}

export type NLPCategory = 'anchoring' | 'visualization' | 'reframing' | 'future_pacing';
