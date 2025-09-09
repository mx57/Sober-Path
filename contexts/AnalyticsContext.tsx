import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MoodEntry {
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  triggers?: string[];
  cravingLevel?: 1 | 2 | 3 | 4 | 5;
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

interface WeeklyStats {
  week: string;
  averageMood: number;
  soberDays: number;
  totalDays: number;
  improvementTrends: string[];
}

interface MonthlyInsights {
  month: string;
  strongestDays: string[];
  challengingTimes: string[];
  moodPatterns: { [key: string]: number };
  recommendations: string[];
}

interface AnalyticsContextType {
  moodEntries: MoodEntry[];
  weeklyStats: WeeklyStats[];
  monthlyInsights: MonthlyInsights[];
  addMoodEntry: (entry: MoodEntry) => Promise<void>;
  getAverageMood: (days: number) => number;
  getMoodTrend: () => 'improving' | 'stable' | 'declining';
  getCravingPatterns: () => { time: string; frequency: number }[];
  getPersonalizedInsights: () => string[];
  exportData: () => Promise<string>;
}

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [monthlyInsights, setMonthlyInsights] = useState<MonthlyInsights[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const [moodData, weeklyData, monthlyData] = await Promise.all([
        AsyncStorage.getItem('mood_entries'),
        AsyncStorage.getItem('weekly_stats'),
        AsyncStorage.getItem('monthly_insights')
      ]);

      if (moodData) setMoodEntries(JSON.parse(moodData));
      if (weeklyData) setWeeklyStats(JSON.parse(weeklyData));
      if (monthlyData) setMonthlyInsights(JSON.parse(monthlyData));
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const addMoodEntry = async (entry: MoodEntry) => {
    const updatedEntries = [...moodEntries, entry];
    setMoodEntries(updatedEntries);
    await AsyncStorage.setItem('mood_entries', JSON.stringify(updatedEntries));
    await updateWeeklyStats();
    await updateMonthlyInsights();
  };

  const updateWeeklyStats = async () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    const thisWeekEntries = moodEntries.filter(entry => 
      new Date(entry.date) >= weekStart
    );

    const weekStats: WeeklyStats = {
      week: weekStart.toISOString().split('T')[0],
      averageMood: thisWeekEntries.reduce((sum, entry) => sum + entry.mood, 0) / thisWeekEntries.length || 0,
      soberDays: thisWeekEntries.length,
      totalDays: 7,
      improvementTrends: generateImprovementTrends(thisWeekEntries)
    };

    const updatedStats = [weekStats, ...weeklyStats.slice(0, 11)];
    setWeeklyStats(updatedStats);
    await AsyncStorage.setItem('weekly_stats', JSON.stringify(updatedStats));
  };

  const updateMonthlyInsights = async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthEntries = moodEntries.filter(entry => 
      new Date(entry.date) >= monthStart
    );

    const insights: MonthlyInsights = {
      month: monthStart.toISOString().split('T')[0],
      strongestDays: getStrongestDays(thisMonthEntries),
      challengingTimes: getChallengingTimes(thisMonthEntries),
      moodPatterns: analyzeMoodPatterns(thisMonthEntries),
      recommendations: generateRecommendations(thisMonthEntries)
    };

    const updatedInsights = [insights, ...monthlyInsights.slice(0, 5)];
    setMonthlyInsights(updatedInsights);
    await AsyncStorage.setItem('monthly_insights', JSON.stringify(updatedInsights));
  };

  const getAverageMood = (days: number): number => {
    const recentEntries = moodEntries.slice(-days);
    if (recentEntries.length === 0) return 0;
    return recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
  };

  const getMoodTrend = (): 'improving' | 'stable' | 'declining' => {
    if (moodEntries.length < 7) return 'stable';
    
    const recent = getAverageMood(7);
    const previous = moodEntries.slice(-14, -7).reduce((sum, entry) => sum + entry.mood, 0) / 7 || recent;
    
    if (recent > previous + 0.3) return 'improving';
    if (recent < previous - 0.3) return 'declining';
    return 'stable';
  };

  const getCravingPatterns = () => {
    const patterns: { [key: string]: number } = {};
    
    moodEntries.forEach(entry => {
      if (entry.cravingLevel && entry.cravingLevel >= 4) {
        const hour = new Date(entry.date).getHours();
        const timeSlot = getTimeSlot(hour);
        patterns[timeSlot] = (patterns[timeSlot] || 0) + 1;
      }
    });

    return Object.entries(patterns).map(([time, frequency]) => ({ time, frequency }));
  };

  const getPersonalizedInsights = (): string[] => {
    const insights: string[] = [];
    
    const trend = getMoodTrend();
    if (trend === 'improving') {
      insights.push('Ваше настроение улучшается! Продолжайте в том же духе.');
    } else if (trend === 'declining') {
      insights.push('Обратите внимание на факторы стресса. Используйте техники релаксации.');
    }

    const cravingPatterns = getCravingPatterns();
    if (cravingPatterns.length > 0) {
      const mostChallenging = cravingPatterns.reduce((max, pattern) => 
        pattern.frequency > max.frequency ? pattern : max
      );
      insights.push(`Наиболее сложное время: ${mostChallenging.time}. Подготовьте план действий.`);
    }

    const avgMood = getAverageMood(30);
    if (avgMood >= 4) {
      insights.push('Отличные показатели настроения! Вы на правильном пути.');
    } else if (avgMood < 3) {
      insights.push('Рассмотрите возможность дополнительной поддержки или консультации специалиста.');
    }

    return insights;
  };

  const exportData = async (): Promise<string> => {
    const data = {
      moodEntries,
      weeklyStats,
      monthlyInsights,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  // Helper functions
  const generateImprovementTrends = (entries: MoodEntry[]): string[] => {
    const trends: string[] = [];
    
    if (entries.every(entry => entry.mood >= 3)) {
      trends.push('Стабильное настроение');
    }
    
    if (entries.some(entry => entry.sleepQuality && entry.sleepQuality >= 4)) {
      trends.push('Улучшение сна');
    }
    
    return trends;
  };

  const getStrongestDays = (entries: MoodEntry[]): string[] => {
    return entries
      .filter(entry => entry.mood >= 4)
      .slice(0, 5)
      .map(entry => entry.date);
  };

  const getChallengingTimes = (entries: MoodEntry[]): string[] => {
    return entries
      .filter(entry => entry.cravingLevel && entry.cravingLevel >= 4)
      .slice(0, 3)
      .map(entry => new Date(entry.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
  };

  const analyzeMoodPatterns = (entries: MoodEntry[]) => {
    const patterns: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      const dayOfWeek = new Date(entry.date).toLocaleDateString('ru-RU', { weekday: 'long' });
      patterns[dayOfWeek] = (patterns[dayOfWeek] || 0) + entry.mood;
    });

    return patterns;
  };

  const generateRecommendations = (entries: MoodEntry[]): string[] => {
    const recommendations: string[] = [];
    
    const lowMoodDays = entries.filter(entry => entry.mood <= 2).length;
    if (lowMoodDays > entries.length * 0.3) {
      recommendations.push('Увеличьте физическую активность и время на свежем воздухе');
      recommendations.push('Рассмотрите техники медитации и дыхательные упражнения');
    }

    const highStressDays = entries.filter(entry => entry.stressLevel && entry.stressLevel >= 4).length;
    if (highStressDays > entries.length * 0.2) {
      recommendations.push('Изучите техники управления стрессом');
      recommendations.push('Обратитесь к специалисту для работы со стрессом');
    }

    return recommendations;
  };

  const getTimeSlot = (hour: number): string => {
    if (hour < 6) return 'Ночь';
    if (hour < 12) return 'Утро';
    if (hour < 18) return 'День';
    return 'Вечер';
  };

  return (
    <AnalyticsContext.Provider value={{
      moodEntries,
      weeklyStats,
      monthlyInsights,
      addMoodEntry,
      getAverageMood,
      getMoodTrend,
      getCravingPatterns,
      getPersonalizedInsights,
      exportData
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}