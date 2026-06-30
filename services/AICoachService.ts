import { findRelevantKnowledge, psychologyKnowledgeBase } from './psychologyKnowledgeBase';
import { Result, success, failure } from './types';
import { articlesDatabase } from './articlesDatabase';
import { microCoursesDatabase } from './microCoursesDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './notificationService';

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

export interface RecommendedCourse {
  id: string;
  title: string;
}

export interface WeeklyRoadmap {
  weekNumber: number;
  focus: string;
  tasks: string[];
  recommendedLessons: string[];
}

export interface EnhancedAIResponse {
  message: string;
  emotionalTone: 'empathetic' | 'motivational' | 'educational' | 'supportive';
  suggestions: string[];
  followUpQuestions: string[];
  memoryUpdates: string[];
  confidenceLevel: number;
  recommendedArticles?: RecommendedArticle[];
  recommendedCourses?: RecommendedCourse[];
  checkInRequired?: boolean;
  isReflection?: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
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

const MEMORY_STORAGE_KEY = 'sober_path_ai_memory';
const CHALLENGES_STORAGE_KEY = 'sober_path_ai_challenges';

export class AICoachService {
  private static memory: Map<string, ConversationMemory> = new Map();
  private static userChallenges: Map<string, AICoachChallenge[]> = new Map();
  private static initialized = false;

  static async loadFromStorage(): Promise<void> {
    if (this.initialized) return;
    try {
      const storedMemory = await AsyncStorage.getItem(MEMORY_STORAGE_KEY);
      if (storedMemory) {
        const parsed = JSON.parse(storedMemory);
        this.memory = new Map(Object.entries(parsed));
      }
      const storedChallenges = await AsyncStorage.getItem(CHALLENGES_STORAGE_KEY);
      if (storedChallenges) {
        const parsed = JSON.parse(storedChallenges);
        this.userChallenges = new Map(Object.entries(parsed));
      }
      this.initialized = true;
    } catch (e) {
      console.error('Failed to load AI Coach data from storage', e);
    }
  }

  private static async saveToStorage(): Promise<void> {
    try {
      const memoryObj = Object.fromEntries(this.memory.entries());
      await AsyncStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memoryObj));

      const challengesObj = Object.fromEntries(this.userChallenges.entries());
      await AsyncStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challengesObj));
    } catch (e) {
      console.error('Failed to save AI Coach data to storage', e);
    }
  }

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
    return this.memory.get(userId) || {
      userId,
      conversations: [],
      userPreferences: { preferredTechniques: [], triggersIdentified: [], goalsSet: [], challengesFaced: [] },
      emotionalPattern: { averageMood: 3, moodTrend: 'stable', commonEmotions: [] }
    };
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
          // Контекстные ответы на основе прогресса
          if (context.soberDays > 365) {
            response = `Ваш путь длиной в ${context.soberDays} дней — это настоящее вдохновение. Как опытный человек в трезвости, что вы чувствуете сегодня?`;
          } else if (context.soberDays > 30) {
            response = `Поздравляю с ${context.soberDays} днями трезвости! Вы уже заложили крепкий фундамент. О чем бы вы хотели поговорить сегодня?`;
          } else if (context.soberDays > 0) {
            response = `Каждый день сейчас на вес золота. Идет ${context.soberDays}-й день вашего нового пути. Как ваша тяга и настроение сейчас?`;
          } else {
            response = "Я рядом и готов поддержать вас в самом начале пути к трезвости. Расскажите подробнее, что вы сейчас чувствуете? Первый шаг самый важный.";
          }

          emotionalTone = 'supportive';
          suggestions = ['Дыхательное упражнение', 'Прогулка', 'HALT проверка'];
          followUpQuestions = ['Как прошел ваш день?', 'Что сейчас больше всего беспокоит?'];
        }

        // Интеграция личных достижений из памяти
        const achievements = memory.userPreferences.goalsSet;
        if (achievements.length > 0 && Math.random() > 0.7) {
          const lastAchievement = achievements[achievements.length - 1];
          response = `${response}\n\nКстати, я помню ваш успех: ${lastAchievement.replace('Упоминание прогресса: ', '')}. Это было круто!`;
        }

        // Проактивная поддержка при высоком стрессе
        if (context.stressLevel && context.stressLevel >= 4 && !topics.includes('Стресс')) {
          response = `Я заметил, что у вас высокий уровень стресса. Это может быть триггером. ${response}`;
          suggestions.unshift('Снять напряжение');
        }

        const recommendedArticles = this.recommendArticles(topics);
        const recommendedCourses = this.recommendCourses(topics, context.soberDays);
        await this.updateMemory(userId, userMessage, response, context.userMood, topics);

        // Проверка необходимости эмоционального чек-ина
        const checkInRequired = (context.stressLevel !== undefined && context.stressLevel >= 4) || context.cravingLevel >= 4;
        const urgency = context.cravingLevel >= 5 ? 'critical' : context.cravingLevel >= 4 ? 'high' : context.stressLevel && context.stressLevel >= 4 ? 'medium' : 'low';

        // Обновляем адаптивные уведомления на основе прогресса
        await NotificationService.scheduleAdaptiveNotifications(context.soberDays);

        return success({
          message: response,
          emotionalTone,
          suggestions: Array.from(new Set(suggestions)).slice(0, 4),
          followUpQuestions,
          memoryUpdates: [`Updated memory for ${userId}`, `Detected topics: ${topics.join(', ')}`],
          confidenceLevel: knowledgeMatch ? 0.95 : 0.6,
          recommendedArticles,
          recommendedCourses,
          checkInRequired,
          urgency
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
    let starters: string[] = [];

    if (context.mood <= 2) {
      starters = [
        "Мне тяжело сегодня",
        "Нужна поддержка",
        "Чувствую тягу",
        "Как справиться со стрессом?"
      ];
    } else if (context.mood >= 4) {
      starters = [
        "У меня отличный день!",
        "Хочу поделиться прогрессом",
        "Как закрепить успех?",
        "Благодарен за поддержку"
      ];
    } else {
      starters = [
        "Как дела?",
        "Нужен совет",
        "Техника на сегодня",
        "Расскажи что-нибудь мотивирующее"
      ];
    }

    if (context.soberDays % 7 === 0 && context.soberDays > 0) {
      starters.unshift('Сегодня юбилей трезвости!');
    }

    if (context.lastAchievement) {
      starters.push(`О моем успехе: ${context.lastAchievement}`);
    }

    return Array.from(new Set(starters)).slice(0, 5);
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

  static async scheduleAssistantReminder(userId: string, message: string, delaySeconds: number = 3600): Promise<void> {
    await NotificationService.scheduleDelayedNotification(
      '💡 Поддержка от Коуча',
      message,
      delaySeconds
    );
  }

  static async getWeeklyRoadmap(userId: string, soberDays: number): Promise<WeeklyRoadmap> {
    const memory = this.getUserMemory(userId);
    const triggers = this.detectTriggerPatterns(userId);

    let focus = "Укрепление фундамента";
    let tasks = ["Отмечать прогресс ежедневно", "Прочитать 2 статьи о тяге", "Сделать HALT-чек утром"];
    let recommendedLessons = ["f1_l1", "f1_l2"];

    if (soberDays > 30) {
      focus = "Эмоциональная зрелость";
      tasks = ["Начать новое хобби", "Помочь новичку в сообществе", "Практика осознанности 15 мин"];
      recommendedLessons = ["lr_l1", "lr_l2"];
    } else if (triggers.some(t => t.severity >= 4)) {
      focus = "Работа с острыми триггерами";
      tasks = ["Составить карту триггеров", "Сделать упражнение 'Серфинг по тяге'", "Избегать шумных компаний"];
      recommendedLessons = ["tr_l1", "tr_l2"];
    }

    return {
      weekNumber: Math.floor(soberDays / 7) + 1,
      focus,
      tasks,
      recommendedLessons
    };
  }

  static async getEveningReflection(userId: string): Promise<EnhancedAIResponse> {
    const memory = this.getUserMemory(userId);
    const todayConversations = memory.conversations.filter(c =>
      new Date(c.timestamp).toDateString() === new Date().toDateString()
    );

    let message = "Добрый вечер! Давайте подведем итоги сегодняшнего дня. Как вы оцениваете свою трезвость сегодня?";

    if (todayConversations.length > 0) {
      const topics = todayConversations.flatMap(c => c.topics);
      if (topics.includes('Стресс') || topics.includes('Тяга')) {
        message = "Добрый вечер. Сегодня был непростой день, мы обсуждали трудности. Я горжусь тем, что вы справились. Как ваше состояние сейчас, перед сном?";
      } else {
        message = "Добрый вечер! Сегодня был продуктивный день. Что было самым приятным в вашей трезвости сегодня?";
      }
    }

    return {
      message,
      emotionalTone: 'supportive',
      suggestions: ['День прошел отлично', 'Было трудно, но я здесь', 'Нужна поддержка на завтра'],
      followUpQuestions: ['О чем вы думаете сейчас?', 'Что планируете на завтра?'],
      memoryUpdates: ['Initiated evening reflection'],
      confidenceLevel: 1.0,
      isReflection: true
    };
  }

  static async generateDailyChallenges(userId: string, soberDays: number): Promise<AICoachChallenge[]> {
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
    await this.saveToStorage();
    return challenges;
  }

  static async getChallenges(userId: string): Promise<AICoachChallenge[]> {
    await this.loadFromStorage();
    if (!this.userChallenges.has(userId)) {
        return await this.generateDailyChallenges(userId, 0);
    }
    return this.userChallenges.get(userId)!;
  }

  static async completeChallenge(userId: string, challengeId: string): Promise<Result<AICoachChallenge[]>> {
    const challenges = await this.getChallenges(userId);
    const updated = challenges.map(ch =>
        ch.id === challengeId ? { ...ch, completed: true } : ch
    );
    this.userChallenges.set(userId, updated);
    await this.saveToStorage();
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

  private static recommendCourses(topics: string[], soberDays: number): RecommendedCourse[] {
    const recommended: RecommendedCourse[] = [];

    if (soberDays < 7) {
      const course = microCoursesDatabase.find(c => c.id === 'foundation_week_1');
      if (course) recommended.push({ id: course.id, title: course.title });
    }

    if (topics.some(t => t.toLowerCase().includes('триггер') || t.toLowerCase().includes('тяга'))) {
      const course = microCoursesDatabase.find(c => c.id === 'triggers_mastery');
      if (course) recommended.push({ id: course.id, title: course.title });
    }

    if (soberDays > 30 && recommended.length === 0) {
      const course = microCoursesDatabase.find(c => c.id === 'life_rebuild');
      if (course) recommended.push({ id: course.id, title: course.title });
    }

    return recommended.slice(0, 2);
  }

  private static async updateMemory(
    userId: string,
    userMessage: string,
    aiResponse: string,
    userMood: number,
    topics: string[]
  ): Promise<void> {
    await this.loadFromStorage();
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

    await this.saveToStorage();
  }
}
