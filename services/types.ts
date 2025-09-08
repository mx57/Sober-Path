export interface ProgressEntry {
  id: string;
  date: string;
  status: 'sober' | 'relapse';
  mood: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: string;
}

export interface PsychologyTip {
  id: string;
  title: string;
  content: string;
  category: 'motivation' | 'coping' | 'understanding' | 'techniques';
  readingTime: number;
}

export interface NLPExercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  steps: string[];
  category: 'anchoring' | 'visualization' | 'reframing' | 'future_pacing';
}

export type NLPCategory = 'anchoring' | 'visualization' | 'reframing' | 'future_pacing';

export interface UserProfile {
  id: string;
  startDate: string;
  name?: string;
  motivations: string[];
  notifications: {
    daily: boolean;
    time: string;
    emergency: boolean;
  };
}

export interface CommunityPost {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  replies: number;
  category: 'success' | 'struggle' | 'advice' | 'support';
}