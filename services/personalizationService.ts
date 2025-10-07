// Система персонализированных рекомендаций на основе ИИ

export interface UserBehaviorData {
  userId: string;
  mood: number[];
  cravingLevel: number[];
  stressLevel: number[];
  sleepQuality: number[];
  exerciseFrequency: number;
  socialInteraction: number;
  techniques: string[];
  successfulTechniques: string[];
  timeOfDayPreferences: { hour: number; activity: string }[];
  triggerPatterns: TriggerPattern[];
}

export interface TriggerPattern {
  trigger: string;
  frequency: number;
  severity: number;
  timePattern: string; // morning, afternoon, evening, night
  contextual: string[]; // work, home, social, alone
  emotionalState: string; // stressed, sad, angry, bored
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'technique' | 'activity' | 'reminder' | 'social' | 'emergency';
  title: string;
  description: string;
  confidence: number; // 0-1
  reasoning: string;
  timeToComplete: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  personalizedMessage: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export class PersonalizationEngine {
  private userBehavior: Map<string, UserBehaviorData> = new Map();
  
  // Анализ паттернов пользователя
  analyzeUserPatterns(userId: string, behaviorData: UserBehaviorData): UserProfile {
    const patterns = {
      moodPatterns: this.analyzeMoodPatterns(behaviorData.mood),
      cravingTriggers: this.identifyCravingTriggers(behaviorData),
      optimalTimes: this.findOptimalTimes(behaviorData.timeOfDayPreferences),
      preferredTechniques: this.rankTechniques(behaviorData.techniques, behaviorData.successfulTechniques),
      riskFactors: this.assessRiskFactors(behaviorData),
      resilience: this.calculateResilienceScore(behaviorData)
    };

    return {
      userId,
      patterns,
      lastAnalyzed: new Date(),
      confidenceLevel: this.calculateConfidence(behaviorData)
    };
  }

  // Генерация персонализированных рекомендаций
  generateRecommendations(userId: string, currentContext: CurrentContext): PersonalizedRecommendation[] {
    const userProfile = this.getUserProfile(userId);
    const recommendations: PersonalizedRecommendation[] = [];

    // Анализ текущего состояния
    const currentRisk = this.assessCurrentRisk(currentContext, userProfile);
    
    if (currentRisk.level === 'high') {
      recommendations.push(...this.generateEmergencyRecommendations(currentContext, userProfile));
    } else if (currentRisk.level === 'medium') {
      recommendations.push(...this.generatePreventiveRecommendations(currentContext, userProfile));
    } else {
      recommendations.push(...this.generateMaintenanceRecommendations(currentContext, userProfile));
    }

    // Добавляем персонализированные техники
    recommendations.push(...this.recommendOptimalTechniques(currentContext, userProfile));
    
    // Социальные рекомендации
    recommendations.push(...this.recommendSocialSupport(currentContext, userProfile));

    // Сортируем по приоритету и уверенности
    return recommendations.sort((a, b) => 
      (b.confidence * this.getUrgencyWeight(b.urgency)) - 
      (a.confidence * this.getUrgencyWeight(a.urgency))
    ).slice(0, 5);
  }

  private analyzeMoodPatterns(moodData: number[]): MoodPattern {
    const recentMood = moodData.slice(-7); // Последняя неделя
    const average = recentMood.reduce((a, b) => a + b, 0) / recentMood.length;
    const trend = this.calculateTrend(recentMood);
    const volatility = this.calculateVolatility(recentMood);

    return {
      averageMood: average,
      trend: trend, // 'improving', 'stable', 'declining'
      volatility: volatility, // 'stable', 'moderate', 'high'
      lowMoodTriggers: this.identifyLowMoodTriggers(moodData)
    };
  }

  private identifyCravingTriggers(behaviorData: UserBehaviorData): CravingAnalysis {
    const triggers = behaviorData.triggerPatterns;
    const highRiskTriggers = triggers
      .filter(t => t.severity >= 7)
      .sort((a, b) => b.frequency - a.frequency);

    const timeBasedTriggers = this.groupTriggersByTime(triggers);
    const emotionalTriggers = this.groupTriggersByEmotion(triggers);
    const contextualTriggers = this.groupTriggersByContext(triggers);

    return {
      highRiskTriggers: highRiskTriggers.slice(0, 3),
      timeBasedTriggers,
      emotionalTriggers,
      contextualTriggers,
      overallRiskScore: this.calculateOverallRisk(triggers)
    };
  }

  private recommendOptimalTechniques(context: CurrentContext, profile: UserProfile): PersonalizedRecommendation[] {
    const techniques = [];
    const currentMood = context.currentMood;
    const timeOfDay = new Date().getHours();

    // Рекомендации на основе настроения
    if (currentMood <= 3) {
      techniques.push({
        id: 'mood-boost-technique',
        type: 'technique' as const,
        title: 'Техника поднятия настроения',
        description: 'Специально подобранная техника для улучшения вашего настроения',
        confidence: 0.85,
        reasoning: 'Ваше текущее настроение ниже среднего. Эта техника показала 78% эффективность для вас в похожих ситуациях.',
        timeToComplete: 15,
        difficulty: 'easy' as const,
        category: 'НЛП',
        personalizedMessage: `Привет! Я заметил, что ваше настроение сейчас ${currentMood}/5. В прошлый раз когда вы чувствовали себя так же, техника "Якорение ресурсов" помогла вам на 40% улучшить состояние. Попробуем?`,
        urgency: 'medium' as const
      });
    }

    // Рекомендации на основе времени дня
    if (timeOfDay >= 22 || timeOfDay <= 6) {
      techniques.push({
        id: 'sleep-preparation',
        type: 'technique' as const,
        title: 'Подготовка к здоровому сну',
        description: 'Расслабляющая техника для качественного отдыха',
        confidence: 0.92,
        reasoning: 'В это время суток вы обычно испытываете повышенную тягу. Хороший сон - ключ к успешному восстановлению.',
        timeToComplete: 20,
        difficulty: 'easy' as const,
        category: 'Интегративные методы',
        personalizedMessage: `Время подготовиться к отдыху! Ваш сон улучшился на 35% после применения техник релаксации. Давайте повторим успех?`,
        urgency: 'medium' as const
      });
    }

    return techniques;
  }

  private generateEmergencyRecommendations(context: CurrentContext, profile: UserProfile): PersonalizedRecommendation[] {
    return [
      {
        id: 'emergency-grounding',
        type: 'emergency',
        title: 'СРОЧНО: Техника заземления',
        description: 'Быстрая техника для снижения острой тяги',
        confidence: 0.95,
        reasoning: 'Обнаружена критическая ситуация. Эта техника помогла вам в 90% похожих случаев.',
        timeToComplete: 5,
        difficulty: 'easy',
        category: 'Кризисная помощь',
        personalizedMessage: 'Я чувствую, что сейчас очень трудно. Давайте вместе преодолеем этот момент. Вы уже 12 раз справлялись с подобным - справитесь и сейчас!',
        urgency: 'critical'
      },
      {
        id: 'emergency-contact',
        type: 'social',
        title: 'Связаться с поддержкой',
        description: 'Обратиться к вашему ментору или в службу поддержки',
        confidence: 0.88,
        reasoning: 'Социальная поддержка критически важна в данный момент.',
        timeToComplete: 2,
        difficulty: 'easy',
        category: 'Поддержка',
        personalizedMessage: 'Помните: вы не одни. Ваш ментор Анна доступна сейчас. Также работает круглосуточная линия поддержки.',
        urgency: 'critical'
      }
    ];
  }

  private calculateOverallRisk(triggers: TriggerPattern[]): number {
    const weightedRisk = triggers.reduce((risk, trigger) => {
      return risk + (trigger.frequency * trigger.severity / 10);
    }, 0);
    
    return Math.min(weightedRisk / triggers.length, 10);
  }

  private getUrgencyWeight(urgency: string): number {
    switch (urgency) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  // Машинное обучение для улучшения рекомендаций
  updateRecommendationEffectiveness(userId: string, recommendationId: string, outcome: RecommendationOutcome) {
    const userProfile = this.getUserProfile(userId);
    
    // Обновляем веса для различных факторов
    this.updateTechniqueWeights(recommendationId, outcome);
    this.updateContextualWeights(outcome.context, outcome.effectiveness);
    this.updateTimeBasedWeights(outcome.timeOfDay, outcome.effectiveness);
    
    // Сохраняем обучающие данные
    this.saveLearningData({
      userId,
      recommendationId,
      context: outcome.context,
      effectiveness: outcome.effectiveness,
      timestamp: new Date()
    });
  }

  private getUserProfile(userId: string): UserProfile {
    // Заглушка - в реальном приложении загружается из БД
    return {
      userId,
      patterns: {} as any,
      lastAnalyzed: new Date(),
      confidenceLevel: 0.8
    };
  }

  private calculateTrend(data: number[]): 'improving' | 'stable' | 'declining' {
    if (data.length < 3) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 0.5) return 'improving';
    if (secondAvg < firstAvg - 0.5) return 'declining';
    return 'stable';
  }

  private calculateVolatility(data: number[]): 'stable' | 'moderate' | 'high' {
    const average = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / data.length;
    
    if (variance < 0.5) return 'stable';
    if (variance < 1.5) return 'moderate';
    return 'high';
  }
}

// Типы для системы персонализации
interface CurrentContext {
  currentMood: number;
  cravingLevel: number;
  stressLevel: number;
  location: string;
  timeOfDay: number;
  dayOfWeek: number;
  recentActivities: string[];
  socialContext: 'alone' | 'with_family' | 'with_friends' | 'at_work';
}

interface UserProfile {
  userId: string;
  patterns: {
    moodPatterns: MoodPattern;
    cravingTriggers: CravingAnalysis;
    optimalTimes: OptimalTimePattern[];
    preferredTechniques: TechniqueRanking[];
    riskFactors: RiskFactor[];
    resilience: ResilienceScore;
  };
  lastAnalyzed: Date;
  confidenceLevel: number;
}

interface MoodPattern {
  averageMood: number;
  trend: 'improving' | 'stable' | 'declining';
  volatility: 'stable' | 'moderate' | 'high';
  lowMoodTriggers: string[];
}

interface CravingAnalysis {
  highRiskTriggers: TriggerPattern[];
  timeBasedTriggers: { [key: string]: TriggerPattern[] };
  emotionalTriggers: { [key: string]: TriggerPattern[] };
  contextualTriggers: { [key: string]: TriggerPattern[] };
  overallRiskScore: number;
}

interface OptimalTimePattern {
  timeRange: string;
  optimalActivities: string[];
  effectiveness: number;
}

interface TechniqueRanking {
  techniqueId: string;
  successRate: number;
  preferredContexts: string[];
  averageRating: number;
}

interface RiskFactor {
  factor: string;
  impact: number;
  frequency: number;
  mitigation: string[];
}

interface ResilienceScore {
  overall: number;
  emotional: number;
  social: number;
  cognitive: number;
  behavioral: number;
}

interface RecommendationOutcome {
  effectiveness: number; // 1-5
  completed: boolean;
  timeSpent: number;
  context: CurrentContext;
  timeOfDay: number;
  feedback: string;
}

export default PersonalizationEngine;