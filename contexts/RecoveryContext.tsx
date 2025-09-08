import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressEntry, UserProfile } from '../services/types';

interface RecoveryContextType {
  progress: ProgressEntry[];
  userProfile: UserProfile | null;
  soberDays: number;
  addProgressEntry: (entry: Omit<ProgressEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  initializeProfile: (startDate: string, motivations: string[]) => Promise<void>;
  getStreakDays: () => number;
  loading: boolean;
}

export const RecoveryContext = createContext<RecoveryContextType | undefined>(undefined);

export function RecoveryProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progressData, profileData] = await Promise.all([
        AsyncStorage.getItem('recovery_progress'),
        AsyncStorage.getItem('user_profile')
      ]);

      if (progressData) {
        setProgress(JSON.parse(progressData));
      }
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProgressEntry = async (entry: Omit<ProgressEntry, 'id' | 'createdAt'>) => {
    const newEntry: ProgressEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const updatedProgress = [...progress, newEntry];
    setProgress(updatedProgress);
    await AsyncStorage.setItem('recovery_progress', JSON.stringify(updatedProgress));
  };

  const updateProfile = async (profileUpdate: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const updatedProfile = { ...userProfile, ...profileUpdate };
    setUserProfile(updatedProfile);
    await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
  };

  const initializeProfile = async (startDate: string, motivations: string[]) => {
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      startDate,
      motivations,
      notifications: {
        daily: true,
        time: '09:00',
        emergency: true
      }
    };

    setUserProfile(newProfile);
    await AsyncStorage.setItem('user_profile', JSON.stringify(newProfile));
  };

  const soberDays = userProfile 
    ? Math.floor((Date.now() - new Date(userProfile.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getStreakDays = () => {
    if (progress.length === 0) return soberDays;

    let streak = 0;
    const sortedProgress = [...progress].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const entry of sortedProgress) {
      if (entry.status === 'sober') {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  return (
    <RecoveryContext.Provider value={{
      progress,
      userProfile,
      soberDays,
      addProgressEntry,
      updateProfile,
      initializeProfile,
      getStreakDays,
      loading
    }}>
      {children}
    </RecoveryContext.Provider>
  );
}