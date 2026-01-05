import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressEntry, UserProfile } from '../services/types';

interface RecoveryContextType {
  progress: ProgressEntry[];
  userProfile: UserProfile | null;
  soberDays: number;
  addProgressEntry: (entry: Omit<ProgressEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  initializeProfile: (startDate: string, motivations: string[]) => Promise<void>;
  getStreakDays: () => number;
  getTotalSoberDays: () => number;
  getDayStatus: (date: string) => 'sober' | 'relapse' | 'no-entry';
  getCalendarMarks: () => Record<string, any>;
  loading: boolean;
  error: string | null;
}

export const RecoveryContext = createContext<RecoveryContextType | undefined>(undefined);

// Валидация данных
const validateProgressEntry = (entry: any): boolean => {
  if (!entry || typeof entry !== 'object') return false;
  if (!entry.status || !['sober', 'relapse'].includes(entry.status)) return false;
  if (entry.mood && (entry.mood < 1 || entry.mood > 5)) return false;
  return true;
};

const validateUserProfile = (profile: any): boolean => {
  if (!profile || typeof profile !== 'object') return false;
  if (profile.startDate && isNaN(new Date(profile.startDate).getTime())) return false;
  return true;
};

export function RecoveryProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [progressData, profileData] = await Promise.all([
        AsyncStorage.getItem('recovery_progress'),
        AsyncStorage.getItem('user_profile')
      ]);

      if (progressData) {
        try {
          const parsedProgress = JSON.parse(progressData);
          if (Array.isArray(parsedProgress)) {
            const validProgress = parsedProgress.filter(validateProgressEntry);
            setProgress(validProgress);
          }
        } catch (parseError) {
          console.error('Failed to parse progress data:', parseError);
          setError('Ошибка загрузки данных о прогрессе');
        }
      }

      if (profileData) {
        try {
          const parsedProfile = JSON.parse(profileData);
          if (validateUserProfile(parsedProfile)) {
            setUserProfile(parsedProfile);
          }
        } catch (parseError) {
          console.error('Failed to parse profile data:', parseError);
          setError('Ошибка загрузки профиля');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProgressEntry = useCallback(async (entry: Omit<ProgressEntry, 'id' | 'createdAt'>) => {
    try {
      if (!validateProgressEntry({ ...entry, id: 'temp', createdAt: new Date().toISOString() })) {
        throw new Error('Недопустимые данные записи');
      }

      const today = new Date().toISOString().split('T')[0];
      const entryDate = entry.date || today;
      
      const existingEntryIndex = progress.findIndex(p => p.date === entryDate);
      
      let updatedProgress: ProgressEntry[];
      
      if (existingEntryIndex !== -1) {
        updatedProgress = [...progress];
        updatedProgress[existingEntryIndex] = {
          ...updatedProgress[existingEntryIndex],
          ...entry,
          date: entryDate
        };
      } else {
        const newEntry: ProgressEntry = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: entryDate,
          createdAt: new Date().toISOString()
        };
        updatedProgress = [...progress, newEntry].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }

      setProgress(updatedProgress);
      await AsyncStorage.setItem('recovery_progress', JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Error adding progress entry:', error);
      setError('Ошибка сохранения записи');
      throw error;
    }
  }, [progress]);

  const updateProfile = useCallback(async (profileUpdate: Partial<UserProfile>) => {
    try {
      if (!userProfile) {
        throw new Error('Профиль не инициализирован');
      }
      
      const updatedProfile = { ...userProfile, ...profileUpdate };
      
      if (!validateUserProfile(updatedProfile)) {
        throw new Error('Недопустимые данные профиля');
      }
      
      setUserProfile(updatedProfile);
      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Ошибка обновления профиля');
      throw error;
    }
  }, [userProfile]);

  // Alias для updateProfile для обратной совместимости
  const updateUserProfile = updateProfile;

  const initializeProfile = useCallback(async (startDate: string, motivations: string[]) => {
    try {
      if (isNaN(new Date(startDate).getTime())) {
        throw new Error('Недопустимая дата');
      }

      const newProfile: UserProfile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startDate,
        motivations: Array.isArray(motivations) ? motivations : [],
        notifications: {
          daily: true,
          time: '09:00',
          emergency: true
        },
        theme: 'nature',
        accessibility: {
          largeText: false,
          highContrast: false,
          voiceFeedback: false,
          hapticFeedback: true
        }
      };

      setUserProfile(newProfile);
      await AsyncStorage.setItem('user_profile', JSON.stringify(newProfile));
    } catch (error) {
      console.error('Error initializing profile:', error);
      setError('Ошибка создания профиля');
      throw error;
    }
  }, []);

  // Мемоизированные вычисления
  const soberDays = useMemo(() => {
    if (!userProfile) return 0;
    try {
      const startDate = new Date(userProfile.startDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (error) {
      console.error('Error calculating sober days:', error);
      return 0;
    }
  }, [userProfile]);

  const getStreakDays = useCallback(() => {
    if (!userProfile || progress.length === 0) return 0;

    try {
      const today = new Date();
      let streak = 0;
      let currentDate = new Date(today);
      const startDate = new Date(userProfile.startDate);

      while (currentDate >= startDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const dayEntry = progress.find(p => p.date === dateString);
        
        if (dayEntry) {
          if (dayEntry.status === 'sober') {
            streak++;
          } else if (dayEntry.status === 'relapse') {
            break;
          }
        } else if (currentDate < new Date().setHours(0, 0, 0, 0)) {
          break;
        }
        
        currentDate.setDate(currentDate.getDate() - 1);
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }, [userProfile, progress]);

  const getTotalSoberDays = useCallback(() => {
    try {
      return progress.filter(entry => entry.status === 'sober').length;
    } catch (error) {
      console.error('Error calculating total sober days:', error);
      return 0;
    }
  }, [progress]);

  const getDayStatus = useCallback((date: string): 'sober' | 'relapse' | 'no-entry' => {
    try {
      const entry = progress.find(p => p.date === date);
      return entry ? entry.status : 'no-entry';
    } catch (error) {
      console.error('Error getting day status:', error);
      return 'no-entry';
    }
  }, [progress]);

  const getCalendarMarks = useCallback(() => {
    const marks: Record<string, any> = {};
    
    try {
      progress.forEach(entry => {
        marks[entry.date] = {
          marked: true,
          dotColor: entry.status === 'sober' ? '#2E7D4A' : '#FF6B6B',
          customStyles: {
            container: {
              backgroundColor: entry.status === 'sober' ? '#E8F5E8' : '#FFE6E6',
              borderRadius: 15,
            },
            text: {
              color: entry.status === 'sober' ? '#2E7D4A' : '#FF6B6B',
              fontWeight: 'bold'
            }
          }
        };
      });
    } catch (error) {
      console.error('Error generating calendar marks:', error);
    }

    return marks;
  }, [progress]);

  const contextValue = useMemo(() => ({
    progress,
    userProfile,
    soberDays,
    addProgressEntry,
    updateProfile,
    updateUserProfile,
    initializeProfile,
    getStreakDays,
    getTotalSoberDays,
    getDayStatus,
    getCalendarMarks,
    loading,
    error
  }), [
    progress,
    userProfile,
    soberDays,
    addProgressEntry,
    updateProfile,
    initializeProfile,
    getStreakDays,
    getTotalSoberDays,
    getDayStatus,
    getCalendarMarks,
    loading,
    error
  ]);

  return (
    <RecoveryContext.Provider value={contextValue}>
      {children}
    </RecoveryContext.Provider>
  );
}
