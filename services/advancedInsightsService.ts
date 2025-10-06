// Расширенная аналитическая служба с ИИ-инсайтами
import { ProgressEntry, MoodEntry } from './types';

export interface PersonalInsight {
  id: string;
  type: 'pattern' | 'risk' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  actionableAdvice: string[];
  relatedData: any;
  timestamp: Date;
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
  emergencyContacts?: string[];
}

export interface MotivationalContent {
  type: 'quote' | 'story' | 'tip' | 'challenge';
  content: string;
  author?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  duration?: number; // в минутах
}

class AdvancedInsightsService {
  private patterns: Map<string, any[]> = new Map();
  
  // Анализ паттернов поведения с ИИ
  analyzeUserPatterns(progressData: ProgressEntry[], moodData: MoodEntry[]): PersonalInsight[] {
    const insights: PersonalInsight[] = [];
    
    // Анализ временных паттернов
    const timePatterns = this.analyzeTimePatterns(progressData);
    if (timePatterns.length > 0) {
      insights.push({
        id: `time-pattern-${Date.now()}`,
        type: 'pattern',
        title: '🕒 Паттерн времени обнаружен',
        description: `Вы чаще испытываете трудности в ${timePatterns[0].period}`,
        severity: 'medium',
        confidence: 0.85,
        actionableAdvice: [
          'Планируйте активности на сложные периоды',
          'Создайте ритуалы для этого времени дня',
          'Обратитесь к поддержке в это время'
        ],
        relatedData: timePatterns,
        timestamp: new Date()
      });
    }
    
    // Анализ эмоциональных триггеров
    const emotionalTriggers = this.analyzeEmotionalTriggers(moodData);
    if (emotionalTriggers.riskMoods.length > 0) {
      insights.push({
        id: `emotion-trigger-${Date.now()}`,
        type: 'risk',
        title: '⚠️ Эмоциональные триггеры',
        description: `Низкое настроение повышает риск срыва`,
        severity: 'high',
        confidence: 0.92,
        actionableAdvice: [
          'Практикуйте техники эмоциональной регуляции',
          'Ведите дневник эмоций',
          'Обратитесь к специалисту при продолжительном плохом настроении'
        ],
        relatedData: emotionalTriggers,
        timestamp: new Date()
      });
    }
    
    // Анализ прогресса и достижений
    const streakAnalysis = this.analyzeStreakProgress(progressData);
    if (streakAnalysis.milestone) {
      insights.push({
        id: `milestone-${Date.now()}`,
        type: 'achievement',
        title: '🎉 Важная веха достигнута!',
        description: `Вы прошли ${streakAnalysis.milestone} дней - это серьезное достижение!`,
        severity: 'low',
        confidence: 1.0,
        actionableAdvice: [
          'Отпразднуйте свой успех здоровым способом',
          'Поделитесь достижением с близкими',
          'Установите новую цель для мотивации'
        ],
        relatedData: streakAnalysis,
        timestamp: new Date()
      });
    }
    
    return insights;
  }
  
  // Оценка риска рецидива в реальном времени
  assessRelapsRisk(recentData: {
    mood: number;
    stress: number;
    sleep: number;
    socialSupport: number;
    cravings: number;
  }): RiskAssessment {
    const riskFactors: string[] = [];
    let riskScore = 0;
    
    // Анализ факторов риска
    if (recentData.mood <= 2) {
      riskFactors.push('Низкое настроение');
      riskScore += 25;
    }
    
    if (recentData.stress >= 4) {
      riskFactors.push('Высокий уровень стресса');
      riskScore += 20;
    }
    
    if (recentData.sleep <= 2) {
      riskFactors.push('Плохое качество сна');
      riskScore += 15;
    }
    
    if (recentData.socialSupport <= 2) {
      riskFactors.push('Недостаток социальной поддержки');
      riskScore += 20;
    }
    
    if (recentData.cravings >= 4) {
      riskFactors.push('Сильная тяга к алкоголю');
      riskScore += 30;
    }
    
    // Определение уровня риска
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore <= 20) riskLevel = 'low';
    else if (riskScore <= 50) riskLevel = 'medium';
    else if (riskScore <= 80) riskLevel = 'high';
    else riskLevel = 'critical';
    
    // Персонализированные рекомендации
    const recommendations = this.generateRiskRecommendations(riskLevel, riskFactors);
    
    return {
      riskLevel,
      factors: riskFactors,
      recommendations,
      emergencyContacts: riskLevel === 'critical' ? [
        '☎️ Горячая линия наркологической помощи: 8-800-200-02-00',
        '🚑 Скорая помощь: 103',
        '👥 Анонимные Алкоголики: 8-800-755-17-17'
      ] : undefined
    };
  }
  
  // Генерация персонализированного мотивационного контента
  generateMotivationalContent(userProfile: any, currentStreak: number): MotivationalContent[] {
    const content: MotivationalContent[] = [];
    
    // Мотивационные цитаты на основе прогресса
    if (currentStreak < 7) {
      content.push({
        type: 'quote',
        content: 'Каждый день трезвости - это победа. Вы сильнее, чем думаете!',
        author: 'Программа восстановления'
      });
    } else if (currentStreak < 30) {
      content.push({
        type: 'story',
        content: 'История успеха: "После двух недель без алкоголя я заметил, что стал лучше спать и у меня появилось больше энергии для семьи."',
        author: 'Михаил, 2 года трезвости'
      });
    } else {
      content.push({
        type: 'challenge',
        content: 'Вызов на сегодня: Найдите новое хобби или займитесь творчеством. Откройте в себе таланты!',
        difficulty: 'medium',
        duration: 60
      });
    }
    
    // Практические советы
    content.push({
      type: 'tip',
      content: 'Совет дня: Создайте "аптечку трезвости" - список действий, которые помогают в моменты слабости.',
      duration: 5
    });
    
    return content;
  }
  
  // Предиктивная модель для определения оптимального времени вмешательства
  predictOptimalInterventionTime(userData: any): Date[] {
    const riskTimes: Date[] = [];
    const now = new Date();
    
    // Анализ исторических данных для предсказания рискованных моментов
    // В реальном приложении здесь был бы более сложный ML-алгоритм
    
    // Пятница вечер - статистически рискованное время
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + (5 - now.getDay() + 7) % 7);
    nextFriday.setHours(18, 0, 0, 0);
    riskTimes.push(nextFriday);
    
    // Выходные дни
    const weekend = new Date(now);
    weekend.setDate(now.getDate() + (6 - now.getDay() + 7) % 7);
    weekend.setHours(14, 0, 0, 0);
    riskTimes.push(weekend);
    
    return riskTimes;
  }
  
  private analyzeTimePatterns(data: ProgressEntry[]): any[] {
    const hourlyStats = new Map<number, { total: number; relapses: number }>();
    
    data.forEach(entry => {
      const hour = new Date(entry.date).getHours();
      const stats = hourlyStats.get(hour) || { total: 0, relapses: 0 };
      stats.total++;
      if (entry.status === 'relapse') stats.relapses++;
      hourlyStats.set(hour, stats);
    });
    
    const patterns = [];
    for (const [hour, stats] of hourlyStats) {
      if (stats.total > 5 && stats.relapses / stats.total > 0.3) {
        let period = 'утром';
        if (hour >= 12 && hour < 18) period = 'днем';
        else if (hour >= 18 && hour < 22) period = 'вечером';
        else if (hour >= 22 || hour < 6) period = 'ночью';
        
        patterns.push({ hour, period, riskRate: stats.relapses / stats.total });
      }
    }
    
    return patterns;
  }
  
  private analyzeEmotionalTriggers(moodData: MoodEntry[]): any {
    const lowMoodDays = moodData.filter(entry => entry.mood <= 2);
    const totalDays = moodData.length;
    
    return {
      riskMoods: lowMoodDays,
      riskRate: lowMoodDays.length / totalDays,
      averageMood: moodData.reduce((sum, entry) => sum + entry.mood, 0) / totalDays
    };
  }
  
  private analyzeStreakProgress(data: ProgressEntry[]): any {
    const currentStreak = this.calculateCurrentStreak(data);
    const milestones = [1, 3, 7, 14, 30, 60, 90, 180, 365];
    
    const reachedMilestone = milestones.find(milestone => 
      currentStreak === milestone || 
      (currentStreak > milestone && !milestones.some(m => m > milestone && m <= currentStreak))
    );
    
    return {
      currentStreak,
      milestone: reachedMilestone,
      nextMilestone: milestones.find(m => m > currentStreak)
    };
  }
  
  private calculateCurrentStreak(data: ProgressEntry[]): number {
    const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    
    for (const entry of sortedData) {
      if (entry.status === 'sober') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  private generateRiskRecommendations(riskLevel: string, factors: string[]): string[] {
    const baseRecommendations = [
      '🧘 Практикуйте дыхательные техники',
      '🚶 Сделайте прогулку на свежем воздухе',
      '💬 Свяжитесь с другом или наставником',
      '📱 Воспользуйтесь приложением для медитации'
    ];
    
    const riskSpecificRecommendations: { [key: string]: string[] } = {
      low: [
        '📚 Почитайте мотивационную книгу',
        '🎵 Послушайте расслабляющую музыку'
      ],
      medium: [
        '🏃 Займитесь физическими упражнениями',
        '☎️ Позвоните на горячую линию поддержки',
        '🎯 Переключитесь на конкретную задачу'
      ],
      high: [
        '🚨 Немедленно обратитесь за помощью',
        '🏥 Рассмотрите возможность обращения к специалисту',
        '👨‍👩‍👧‍👦 Проведите время с близкими людьми'
      ],
      critical: [
        '🆘 СРОЧНО обратитесь в службу кризисного вмешательства',
        '🏥 Рассмотрите возможность госпитализации',
        '👮 При необходимости вызовите службу экстренного реагирования'
      ]
    };
    
    return [...baseRecommendations, ...(riskSpecificRecommendations[riskLevel] || [])];
  }
}

export const advancedInsightsService = new AdvancedInsightsService();