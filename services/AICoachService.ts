import { findRelevantKnowledge, psychologyKnowledgeBase } from './psychologyKnowledgeBase';
import { Result, success, failure } from './types';
import { articlesDatabase } from './articlesDatabase';

export interface AICoachMessage {
  id: string;
  type: 'motivation' | 'warning' | 'celebration' | 'guidance' | 'crisis';
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actions?: {
    text: string;
    action: string;
  }[];
}

export interface TriggerPattern {
  id: string;
  name: string;
  type: 'emotional' | 'social' | 'environmental' | 'temporal';
  description: string;
  severity: 1 | 2 | 3 | 4 | 5;
  frequency: number;
  lastOccurrence?: Date;
  countermeasures: string[];
}

export interface HealthMetrics {
  heartRate?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  hydration?: 1 | 2 | 3 | 4 | 5;
  physicalActivity?: number;
  screenTime?: number;
  socialInteraction?: 1 | 2 | 3 | 4 | 5;
}

export interface ConversationMemory {
  userId: string;
  conversations: {
    timestamp: Date;
    userMessage: string;
    aiResponse: string;
    userMood: number;
    topics: string[];
  }[];
  userPreferences: {
    preferredTechniques: string[];
    triggersIdentified: string[];
    goalsSet: string[];
    challengesFaced: string[];
  };
  emotionalPattern: {
    averageMood: number;
    moodTrend: 'improving' | 'stable' | 'declining';
    commonEmotions: string[];
  };
}

export interface RecommendedArticle {
  id: string;
  title: string;
  category: string;
}

export interface EnhancedAIResponse {
  message: string;
  emotionalTone: 'empathetic' | 'motivational' | 'educational' | 'supportive';
  suggestions: string[];
  followUpQuestions: string[];
  memoryUpdates: string[];
  confidenceLevel: number;
  recommendedArticles?: RecommendedArticle[];
}

export interface AICoachChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'mindfulness' | 'social' | 'physical' | 'educational';
  completed: boolean;
  rewardPoints: number;
  icon: string;
}

export class AICoachService {
  private static memory: Map<string, ConversationMemory> = new Map();
  private static userChallenges: Map<string, AICoachChallenge[]> = new Map();

  static initializeUserMemory(userId: string): void {
    if (!this.memory.has(userId)) {
      this.memory.set(userId, {
        userId,
        conversations: [],
        userPreferences: {
          preferredTechniques: [],
          triggersIdentified: [],
          goalsSet: [],
          challengesFaced: []
        },
        emotionalPattern: {
          averageMood: 3,
          moodTrend: 'stable',
          commonEmotions: []
        }
      });
    }
  }

  private static getUserMemory(userId: string): ConversationMemory {
    this.initializeUserMemory(userId);
    return this.memory.get(userId)!;
  }

  static analyzeUserBehavior(data: {
    mood: number;
    cravingLevel: number;
    stressLevel: number;
    healthMetrics: HealthMetrics;
    recentEvents: string[];
  }): Result<AICoachMessage[]> {
    try {
        const messages: AICoachMessage[] = [];
        const now = new Date();

        if (data.cravingLevel >= 4 && data.stressLevel >= 4) {
        messages.push({
            id: `crisis_${Date.now()}`,
            type: 'crisis',
            priority: 'critical',
            timestamp: now,
            message: 'Я вижу, что сейчас вам очень трудно. Высокий уровень стресса и тяги могут привести к срыву. Давайте вместе преодолеем этот момент.',
            actions: [
            { text: 'Экстренные техники', action: 'emergency_techniques' },
            { text: 'Связаться с поддержкой', action: 'contact_support' }
            ]
        });
        }
        return success(messages);
    } catch (e) {
        return failure(e as Error);
    }
  }

  static async getEnhancedResponse(
    userId: string,
    userMessage: string,
    context: {
      userMood: number;
      soberDays: number;
      cravingLevel: number;
      stressLevel?: number;
      timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    }
  ): Promise<Result<EnhancedAIResponse>> {
    try {
        const memory = this.getUserMemory(userId);
        const lowercaseMessage = userMessage.toLowerCase();

        const topics = this.extractTopics(lowercaseMessage);
        const knowledgeMatch = findRelevantKnowledge(userMessage);

        let response: string;
        let emotionalTone: 'empathetic' | 'motivational' | 'educational' | 'supportive';
        let suggestions: string[] = [];
        let followUpQuestions: string[] = [];

        if (knowledgeMatch) {
          response = knowledgeMatch.response;
          emotionalTone = this.determineTone(knowledgeMatch.category);
          suggestions = knowledgeMatch.techniques.slice(0, 3);
          followUpQuestions = this.generateFollowUp(knowledgeMatch.category);
        } else {
          response = "Я рядом и готов поддержать вас на пути к трезвости. Расскажите подробнее, что вы сейчас чувствуете?";
          emotionalTone = 'supportive';
          suggestions = ['Дыхательное упражнение', 'Прогулка', 'HALT проверка'];
          followUpQuestions = ['Как прошел ваш день?', 'Что сейчас больше всего беспокоит?'];
        }

        // Проактивная поддержка при высоком стрессе
        if (context.stressLevel && context.stressLevel >= 4 && !topics.includes('Стресс')) {
          response = `Я заметил, что у вас высокий уровень стресса. Это может быть триггером. ${response}`;
          suggestions.unshift('Снять напряжение');
        }

        const recommendedArticles = this.recommendArticles(topics);
        this.updateMemory(userId, userMessage, response, context.userMood, topics);

        return success({
          message: response,
          emotionalTone,
          suggestions: Array.from(new Set(suggestions)).slice(0, 4),
          followUpQuestions,
          memoryUpdates: [`Updated memory for ${userId}`, `Detected topics: ${topics.join(', ')}`],
          confidenceLevel: knowledgeMatch ? 0.95 : 0.6,
          recommendedArticles
        });
    } catch (e) {
        return failure(e as Error);
    }
  }

  static getChatStarters(context: {
    mood: number;
    soberDays: number;
    lastAchievement?: string
  }): string[] {
    const starters = ['Как дела?'];

    if (context.mood <= 2) {
      starters.push('Мне грустно', 'Как справиться со стрессом?');
    } else if (context.mood >= 4) {
      starters.push('У меня отличный день!', 'Как закрепить успех?');
    }

    if (context.soberDays % 7 === 0 && context.soberDays > 0) {
      starters.push('Сегодня юбилей трезвости!');
    }

    starters.push('Нужна мотивация', 'Техника на сегодня');

    return Array.from(new Set(starters)).slice(0, 4);
  }

  private static determineTone(category: string): 'empathetic' | 'motivational' | 'educational' | 'supportive' {
    switch (category) {
      case 'Эмоциональная регуляция': return 'empathetic';
      case 'Мотивация и целеполагание': return 'motivational';
      case 'Когнитивные искажения': return 'educational';
      case 'Работа с тягой и триггерами': return 'supportive';
      default: return 'supportive';
    }
  }

  private static generateFollowUp(category: string): string[] {
    switch (category) {
      case 'Эмоциональная регуляция': return ['Как часто вы это чувствуете?', 'Что обычно помогает вам успокоиться?'];
      case 'Работа с тягой и триггерами': return ['Где вы сейчас находитесь?', 'Что произошло непосредственно перед этим?'];
      case 'Мотивация и целеполагание': return ['Какая ваша главная цель на сегодня?', 'Что дает вам силы продолжать?'];
      default: return ['Как я еще могу вам помочь?'];
    }
  }

  static getUserInsights(userId: string) {
    const memory = this.getUserMemory(userId);
    return {
      conversationCount: memory.conversations.length,
      averageMood: memory.emotionalPattern.averageMood,
      moodTrend: memory.emotionalPattern.moodTrend,
      commonTopics: memory.emotionalPattern.commonEmotions,
      achievements: memory.userPreferences.goalsSet,
      progressSummary: memory.emotionalPattern.moodTrend === 'improving'
        ? 'Ваше состояние улучшается.'
        : 'Мы продолжаем работу.'
    };
  }

  static detectTriggerPatterns(userId: string): TriggerPattern[] {
    // В реальном приложении здесь был бы сложный анализ истории
    return [
      {
        id: '1',
        name: 'Вечерний стресс',
        type: 'temporal',
        description: 'Повышенная тяга в вечернее время',
        severity: 4,
        frequency: 3,
        countermeasures: ['Медитация', 'Вечерний чай', 'Чтение статей о сне']
      }
    ];
  }

  static generatePredictiveInsights(userId: string) {
    return [
      {
        id: 'p1',
        type: 'risk_prediction',
        title: 'Риск в выходные',
        description: 'Повышенный риск из-за изменения привычного графика',
        confidence: 70
      }
    ];
  }

  static async getMotivationalMessage(soberDays: number): Promise<string> {
    if (soberDays === 0) return "Начало пути - самый сложный и важный шаг. Вы уже здесь, и это победа!";
    if (soberDays % 7 === 0) return `Вы трезвы уже ${soberDays / 7} недель! Это потрясающий результат.`;
    return `Поздравляю с ${soberDays} днями трезвости! Каждый день делает вас сильнее.`;
  }

  static generateDailyChallenges(userId: string, soberDays: number): AICoachChallenge[] {
    const challenges: AICoachChallenge[] = [
      {
        id: 'ch1',
        title: 'Минута тишины',
        description: 'Проведите 5 минут в полной тишине, наблюдая за дыханием.',
        difficulty: 'easy',
        type: 'mindfulness',
        completed: false,
        rewardPoints: 10,
        icon: 'self-improvement'
      },
      {
        id: 'ch2',
        title: 'Трезвый диалог',
        description: 'Поделитесь своими чувствами с близким человеком или в сообществе.',
        difficulty: 'medium',
        type: 'social',
        completed: false,
        rewardPoints: 20,
        icon: 'chat'
      },
      {
        id: 'ch3',
        title: 'Новое знание',
        description: 'Прочитайте одну статью из базы знаний сегодня.',
        difficulty: 'easy',
        type: 'educational',
        completed: false,
        rewardPoints: 15,
        icon: 'book'
      }
    ];

    if (soberDays > 30) {
        challenges.push({
            id: 'ch4',
            title: 'Наставничество',
            description: 'Оставьте поддерживающий комментарий новичку в сообществе.',
            difficulty: 'hard',
            type: 'social',
            completed: false,
            rewardPoints: 50,
            icon: 'stars'
        });
    }

    this.userChallenges.set(userId, challenges);
    return challenges;
  }

  static getChallenges(userId: string): AICoachChallenge[] {
    if (!this.userChallenges.has(userId)) {
        return this.generateDailyChallenges(userId, 0);
    }
    return this.userChallenges.get(userId)!;
  }

  static completeChallenge(userId: string, challengeId: string): Result<AICoachChallenge[]> {
    const challenges = this.getChallenges(userId);
    const updated = challenges.map(ch =>
        ch.id === challengeId ? { ...ch, completed: true } : ch
    );
    this.userChallenges.set(userId, updated);
    return success(updated);
  }

  private static extractTopics(message: string): string[] {
    const topics: Set<string> = new Set();
    const lowerMessage = message.toLowerCase();

    // Извлекаем топики на основе базы знаний
    psychologyKnowledgeBase.forEach(kb => {
      kb.topics.forEach(topic => {
        if (topic.keyword.some(kw => lowerMessage.includes(kw.toLowerCase()))) {
          topics.add(kb.category);
          // Добавляем также конкретные теги для поиска статей
          topic.keyword.forEach(kw => {
            if (kw.length > 4) topics.add(kw);
          });
        }
      });
    });

    return Array.from(topics);
  }

  private static recommendArticles(topics: string[]): RecommendedArticle[] {
    if (topics.length === 0) return [];

    // Поиск статей по совпадению категории или тегов
    const recommended = articlesDatabase
      .filter(article =>
        topics.some(topic =>
          article.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase())) ||
          article.category.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(article.category.toLowerCase())
        )
      )
      .sort((a, b) => b.readTime - a.readTime) // Предлагаем более глубокие статьи первыми
      .slice(0, 3)
      .map(a => ({ id: a.id, title: a.title, category: a.category }));

    return recommended;
  }

  private static updateMemory(
    userId: string,
    userMessage: string,
    aiResponse: string,
    userMood: number,
    topics: string[]
  ): void {
    const memory = this.getUserMemory(userId);
    memory.conversations.push({
      timestamp: new Date(),
      userMessage,
      aiResponse,
      userMood,
      topics
    });

    // Обнаружение достижений
    if (userMessage.toLowerCase().includes('дней') || userMessage.toLowerCase().includes('неделя')) {
      const achievement = `Упоминание прогресса: "${userMessage}"`;
      if (!memory.userPreferences.goalsSet.includes(achievement)) {
        memory.userPreferences.goalsSet.push(achievement);
      }
    }

    // Обновляем статистику по эмоциям/топикам
    if (topics.length > 0) {
      const currentEmotions = [...memory.emotionalPattern.commonEmotions, ...topics];
      memory.emotionalPattern.commonEmotions = Array.from(new Set(currentEmotions)).slice(-10);
    }
  }
}
