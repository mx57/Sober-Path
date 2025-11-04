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
  getTotalSoberDays: () => number;
  getDayStatus: (date: string) => 'sober' | 'relapse' | 'no-entry';
  getCalendarMarks: () => Record<string, any>;
  loading: boolean;
}

export const RecoveryContext = createContext<RecoveryContextType | undefined>(undefined);

export function RecoveryProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const updateUserProfile = updateProfile; // Экспортируем для использования в компонентах

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
        const parsedProgress = JSON.parse(progressData);
        setProgress(Array.isArray(parsedProgress) ? parsedProgress : []);
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
    try {
      const today = new Date().toISOString().split('T')[0];
      const entryDate = entry.date || today;
      
      // Проверяем, есть ли уже запись за этот день
      const existingEntryIndex = progress.findIndex(p => p.date === entryDate);
      
      if (existingEntryIndex !== -1) {
        // Обновляем существующую запись
        const updatedProgress = [...progress];
        updatedProgress[existingEntryIndex] = {
          ...updatedProgress[existingEntryIndex],
          ...entry,
          date: entryDate
        };
        setProgress(updatedProgress);
        await AsyncStorage.setItem('recovery_progress', JSON.stringify(updatedProgress));
      } else {
        // Создаем новую запись
        const newEntry: ProgressEntry = {
          ...entry,
          id: Date.now().toString(),
          date: entryDate,
          createdAt: new Date().toISOString()
        };

        const updatedProgress = [...progress, newEntry];
        setProgress(updatedProgress);
        await AsyncStorage.setItem('recovery_progress', JSON.stringify(updatedProgress));
      }
    } catch (error) {
      console.error('Error adding progress entry:', error);
    }
  };

  const updateProfile = async (profileUpdate: Partial<UserProfile>) => {
    try {
      if (!userProfile) return;
      
      const updatedProfile = { ...userProfile, ...profileUpdate };
      setUserProfile(updatedProfile);
      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const initializeProfile = async (startDate: string, motivations: string[]) => {
    try {
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
    } catch (error) {
      console.error('Error initializing profile:', error);
    }
  };

  // Общее количество дней с начала пути
  const soberDays = userProfile 
    ? Math.max(0, Math.floor((Date.now() - new Date(userProfile.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Текущая серия трезвых дней (подряд)
  const getStreakDays = () => {
    if (!userProfile || progress.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    // Идем назад по дням и проверяем статус
    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayEntry = progress.find(p => p.date === dateString);
      
      if (dayEntry) {
        if (dayEntry.status === 'sober') {
          streak++;
        } else if (dayEntry.status === 'relapse') {
          break; // Прерываем серию при срыве
        }
      } else {
        // Если нет записи, считаем как пропущенный день
        break;
      }
      
      // Переходим к предыдущему дню
      currentDate.setDate(currentDate.getDate() - 1);
      
      // Не идем дальше даты начала пути
      if (currentDate < new Date(userProfile.startDate)) {
        break;
      }
    }

    return streak;
  };

  // Общее количество трезвых дней (не подряд)
  const getTotalSoberDays = () => {
    return progress.filter(entry => entry.status === 'sober').length;
  };

  // Статус конкретного дня
  const getDayStatus = (date: string): 'sober' | 'relapse' | 'no-entry' => {
    const entry = progress.find(p => p.date === date);
    if (!entry) return 'no-entry';
    return entry.status;
  };

  // Метки для календаря
  const getCalendarMarks = () => {
    const marks: Record<string, any> = {};
    
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

    return marks;
  };

  return (
    <RecoveryContext.Provider value={{
      progress,
      userProfile,
      soberDays,
      addProgressEntry,
      updateProfile,
      updateUserProfile: updateProfile,
      initializeProfile,
      getStreakDays,
      getTotalSoberDays,
      getDayStatus,
      getCalendarMarks,
      loading
    }}>
      {children}
    </RecoveryContext.Provider>
  );
}