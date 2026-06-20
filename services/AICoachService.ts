import { findRelevantKnowledge } from './psychologyKnowledgeBase';

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

export interface EnhancedAIResponse {
  message: string;
  emotionalTone: 'empathetic' | 'motivational' | 'educational' | 'supportive';
  suggestions: string[];
  followUpQuestions: string[];
  memoryUpdates: string[];
  confidenceLevel: number;
}

export class AICoachService {
  private static memory: Map<string, ConversationMemory> = new Map();

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
  }): AICoachMessage[] {
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
    return messages;
  }

  static async getEnhancedResponse(
    userId: string,
    userMessage: string,
    context: {
      userMood: number;
      soberDays: number;
      cravingLevel: number;
      timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    }
  ): Promise<EnhancedAIResponse> {
    const memory = this.getUserMemory(userId);
    const lowercaseMessage = userMessage.toLowerCase();

    const topics = this.extractTopics(lowercaseMessage);
    const knowledgeMatch = findRelevantKnowledge(userMessage);

    let response: string;
    let emotionalTone: 'empathetic' | 'motivational' | 'educational' | 'supportive';
    let suggestions: string[] = [];

    if (knowledgeMatch) {
      response = knowledgeMatch.response;
      emotionalTone = 'educational';
      suggestions = knowledgeMatch.techniques.slice(0, 3);
    } else {
      response = "Я рядом и готов поддержать вас на пути к трезвости.";
      emotionalTone = 'supportive';
      suggestions = ['Дыхательное упражнение', 'Прогулка'];
    }

    this.updateMemory(userId, userMessage, response, context.userMood, topics);

    return {
      message: response,
      emotionalTone,
      suggestions,
      followUpQuestions: [],
      memoryUpdates: [`Updated memory for ${userId}`],
      confidenceLevel: knowledgeMatch ? 0.9 : 0.6
    };
  }

  static getUserInsights(userId: string) {
    const memory = this.getUserMemory(userId);
    return {
      conversationCount: memory.conversations.length,
      averageMood: memory.emotionalPattern.averageMood,
      moodTrend: memory.emotionalPattern.moodTrend,
      commonTopics: memory.emotionalPattern.commonEmotions,
      progressSummary: memory.emotionalPattern.moodTrend === 'improving'
        ? 'Ваше состояние улучшается.'
        : 'Мы продолжаем работу.'
    };
  }

  static detectTriggerPatterns(userId: string): TriggerPattern[] {
    return [
      {
        id: '1',
        name: 'Вечерний стресс',
        type: 'temporal',
        description: 'Повышенная тяга вечером',
        severity: 4,
        frequency: 3,
        countermeasures: ['Медитация', 'Чай']
      }
    ];
  }

  static generatePredictiveInsights(userId: string) {
    return [
      {
        id: 'p1',
        type: 'risk_prediction',
        title: 'Риск в выходные',
        description: 'Повышенный риск срыва в субботу',
        confidence: 70
      }
    ];
  }

  // Added missing helper methods for better functionality
  static async getMotivationalMessage(soberDays: number): Promise<string> {
    if (soberDays === 0) return "Начало пути - самый важный шаг. Вы справитесь!";
    return `Поздравляю с ${soberDays} днями трезвости! Ваш прогресс вдохновляет.`;
  }

  private static extractTopics(message: string): string[] {
    const topicKeywords = {
      craving: ['хочу выпить', 'тяга', 'искушение'],
      anxiety: ['тревога', 'беспокойство', 'страх']
    };
    const topics: string[] = [];
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => message.includes(keyword))) {
        topics.push(topic);
      }
    });
    return topics;
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
  }
}
