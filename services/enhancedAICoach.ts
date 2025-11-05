// Улучшенный AI-коуч с контекстной памятью и эмоциональным интеллектом

import { findRelevantKnowledge } from './psychologyKnowledgeBase';

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

export class EnhancedAICoach {
  private memory: Map<string, ConversationMemory> = new Map();
  
  // Инициализация памяти для пользователя
  initializeUserMemory(userId: string): void {
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
  
  // Получение памяти пользователя
  private getUserMemory(userId: string): ConversationMemory {
    this.initializeUserMemory(userId);
    return this.memory.get(userId)!;
  }
  
  // Обновление памяти
  private updateMemory(
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
    
    // Ограничиваем историю последними 100 сообщениями
    if (memory.conversations.length > 100) {
      memory.conversations = memory.conversations.slice(-50);
    }
    
    // Обновляем эмоциональный паттерн
    this.updateEmotionalPattern(userId);
  }
  
  // Анализ эмоционального паттерна
  private updateEmotionalPattern(userId: string): void {
    const memory = this.getUserMemory(userId);
    const recentConversations = memory.conversations.slice(-10);
    
    if (recentConversations.length === 0) return;
    
    // Средний уровень настроения
    const averageMood = recentConversations.reduce((sum, conv) => sum + conv.userMood, 0) / recentConversations.length;
    
    // Тренд настроения
    const firstHalf = recentConversations.slice(0, Math.floor(recentConversations.length / 2));
    const secondHalf = recentConversations.slice(Math.floor(recentConversations.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, conv) => sum + conv.userMood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, conv) => sum + conv.userMood, 0) / secondHalf.length;
    
    const moodTrend: 'improving' | 'stable' | 'declining' = 
      secondAvg > firstAvg + 0.5 ? 'improving' :
      secondAvg < firstAvg - 0.5 ? 'declining' :
      'stable';
    
    memory.emotionalPattern = {
      averageMood,
      moodTrend,
      commonEmotions: this.extractCommonEmotions(recentConversations)
    };
  }
  
  // Извлечение общих эмоций из разговоров
  private extractCommonEmotions(conversations: any[]): string[] {
    const emotionKeywords = {
      anxiety: ['тревога', 'беспокойство', 'волнуюсь', 'страх', 'паника'],
      sadness: ['грусть', 'печаль', 'депрессия', 'тоска'],
      anger: ['злость', 'раздражение', 'гнев', 'бесит'],
      craving: ['хочу выпить', 'тяга', 'искушение'],
      hope: ['надежда', 'лучше', 'прогресс', 'получается']
    };
    
    const emotionCounts: Record<string, number> = {};
    
    conversations.forEach(conv => {
      const message = conv.userMessage.toLowerCase();
      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.some(keyword => message.includes(keyword))) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }
      });
    });
    
    return Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion);
  }
  
  // Генерация персонализированного ответа с учетом контекста
  async getEnhancedResponse(
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
    
    // Анализ текущего сообщения
    const sentiment = this.analyzeSentiment(userMessage);
    const topics = this.extractTopics(userMessage);
    const urgency = this.assessUrgency(userMessage, context.cravingLevel);
    
    // Проверка базы психологических знаний
    const knowledgeMatch = findRelevantKnowledge(userMessage);
    
    let response: string;
    let emotionalTone: 'empathetic' | 'motivational' | 'educational' | 'supportive';
    let suggestions: string[] = [];
    let followUpQuestions: string[] = [];
    
    if (knowledgeMatch) {
      // Используем профессиональные знания
      response = this.personalizeKnowledgeResponse(knowledgeMatch.response, memory, context);
      emotionalTone = 'educational';
      suggestions = knowledgeMatch.techniques.slice(0, 3);
    } else {
      // Генерируем контекстный ответ
      const generatedResponse = this.generateContextualResponse(
        userMessage,
        sentiment,
        topics,
        urgency,
        memory,
        context
      );
      
      response = generatedResponse.message;
      emotionalTone = generatedResponse.tone;
      suggestions = generatedResponse.suggestions;
      followUpQuestions = generatedResponse.followUp;
    }
    
    // Обновляем память
    this.updateMemory(userId, userMessage, response, context.userMood, topics);
    
    return {
      message: response,
      emotionalTone,
      suggestions,
      followUpQuestions,
      memoryUpdates: [`Обновлен эмоциональный паттерн`, `Сохранены темы: ${topics.join(', ')}`],
      confidenceLevel: knowledgeMatch ? 0.9 : 0.7
    };
  }
  
  // Анализ сентимента сообщения
  private analyzeSentiment(message: string): {
    polarity: 'positive' | 'negative' | 'neutral';
    intensity: number;
  } {
    const lowercaseMessage = message.toLowerCase();
    
    const positiveWords = ['хорошо', 'лучше', 'получается', 'рад', 'счастлив', 'прогресс'];
    const negativeWords = ['плохо', 'хуже', 'ужасно', 'не могу', 'провал', 'тяжело'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (lowercaseMessage.includes(word)) score += 1;
    });
    negativeWords.forEach(word => {
      if (lowercaseMessage.includes(word)) score -= 1;
    });
    
    const polarity: 'positive' | 'negative' | 'neutral' = 
      score > 0 ? 'positive' :
      score < 0 ? 'negative' :
      'neutral';
    
    return {
      polarity,
      intensity: Math.abs(score)
    };
  }
  
  // Извлечение тем
  private extractTopics(message: string): string[] {
    const topicKeywords = {
      craving: ['хочу выпить', 'тяга', 'искушение'],
      anxiety: ['тревога', 'беспокойство', 'страх'],
      progress: ['прогресс', 'улучшение', 'получается'],
      relapse: ['сорвался', 'рецидив', 'выпил'],
      sleep: ['сон', 'бессонница', 'не могу спать'],
      support: ['помощь', 'поддержка', 'не знаю что делать']
    };
    
    const lowercaseMessage = message.toLowerCase();
    const topics: string[] = [];
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowercaseMessage.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  }
  
  // Оценка срочности
  private assessUrgency(message: string, cravingLevel: number): 'low' | 'medium' | 'high' | 'crisis' {
    const crisisKeywords = ['хочу выпить', 'не могу', 'сорвусь', 'помогите'];
    const lowercaseMessage = message.toLowerCase();
    
    if (crisisKeywords.some(keyword => lowercaseMessage.includes(keyword)) && cravingLevel >= 4) {
      return 'crisis';
    }
    
    if (cravingLevel >= 4) return 'high';
    if (cravingLevel >= 3) return 'medium';
    return 'low';
  }
  
  // Персонализация ответа из базы знаний
  private personalizeKnowledgeResponse(
    baseResponse: string,
    memory: ConversationMemory,
    context: any
  ): string {
    let personalizedResponse = baseResponse;
    
    // Добавляем персональный контекст
    if (context.soberDays > 0) {
      personalizedResponse = `С учетом ваших ${context.soberDays} дней трезвости, ` + personalizedResponse.charAt(0).toLowerCase() + personalizedResponse.slice(1);
    }
    
    // Учитываем эмоциональный паттерн
    if (memory.emotionalPattern.moodTrend === 'improving') {
      personalizedResponse += '\n\nЯ замечаю позитивную динамику в вашем настроении. Это отличный знак!';
    } else if (memory.emotionalPattern.moodTrend === 'declining') {
      personalizedResponse += '\n\nЯ заметил, что ваше настроение снижается. Давайте уделим этому особое внимание.';
    }
    
    return personalizedResponse;
  }
  
  // Генерация контекстного ответа
  private generateContextualResponse(
    userMessage: string,
    sentiment: any,
    topics: string[],
    urgency: string,
    memory: ConversationMemory,
    context: any
  ): {
    message: string;
    tone: 'empathetic' | 'motivational' | 'educational' | 'supportive';
    suggestions: string[];
    followUp: string[];
  } {
    let message = '';
    let tone: 'empathetic' | 'motivational' | 'educational' | 'supportive' = 'supportive';
    let suggestions: string[] = [];
    let followUp: string[] = [];
    
    // Кризисная ситуация
    if (urgency === 'crisis') {
      tone = 'empathetic';
      message = `Я понимаю, что сейчас очень тяжело. Это чувство временно. За ${context.soberDays} дней вы уже доказали свою силу. Давайте вместе пройдем через это.`;
      suggestions = [
        'Немедленная дыхательная техника 4-7-8',
        'Позвонить другу или в службу поддержки',
        'Выйти на прогулку прямо сейчас',
        'Использовать технику "Играть до конца"'
      ];
      followUp = [
        'Вы в безопасном месте сейчас?',
        'Есть ли кто-то, кому вы можете позвонить?',
        'Что помогало вам раньше в подобных ситуациях?'
      ];
    }
    
    // Позитивный прогресс
    else if (sentiment.polarity === 'positive') {
      tone = 'motivational';
      message = `Это замечательно! Ваш прогресс вдохновляет. ${context.soberDays} дней трезвости - это серьезное достижение. Что конкретно помогает вам оставаться на этом пути?`;
      suggestions = [
        'Записать этот момент в дневник успехов',
        'Поделиться своим опытом с другими',
        'Установить новую цель для продолжения роста'
      ];
      followUp = [
        'Какие изменения вы замечаете в себе?',
        'Что бы вы посоветовали тому, кто только начинает путь?'
      ];
    }
    
    // Трудности и вызовы
    else if (sentiment.polarity === 'negative') {
      tone = 'empathetic';
      message = `Я слышу вашу боль. Трудные моменты - это часть пути восстановления. Важно, что вы обратились за поддержкой, а не действовали импульсивно. Это показывает вашу силу.`;
      suggestions = [
        'Практика самосострадания',
        'Техника RAIN для работы с эмоциями',
        'Короткая медитация для стабилизации'
      ];
      followUp = [
        'Что конкретно вызывает эти чувства?',
        'Какая поддержка вам нужна прямо сейчас?',
        'Использовали ли вы техники самопомощи сегодня?'
      ];
    }
    
    // Нейтральный запрос
    else {
      tone = 'educational';
      message = `Благодарю за ваш вопрос. Давайте разберем это вместе. На основе вашего опыта ${context.soberDays} дней трезвости и текущего состояния, я могу предложить несколько подходов.`;
      suggestions = [
        'Изучить релевантные образовательные материалы',
        'Попробовать новую технику самопомощи',
        'Проанализировать паттерны вашего восстановления'
      ];
    }
    
    // Учитываем предыдущие разговоры
    if (memory.conversations.length > 5) {
      const recentTopics = memory.conversations.slice(-5).flatMap(c => c.topics);
      const repeatingTopic = topics.find(t => recentTopics.includes(t));
      
      if (repeatingTopic) {
        message += `\n\nЯ заметил, что тема "${repeatingTopic}" возникает неоднократно. Возможно, нам стоит глубже исследовать это?`;
      }
    }
    
    return { message, tone, suggestions, followUp };
  }
  
  // Получение инсайтов о прогрессе пользователя
  getUserInsights(userId: string): {
    conversationCount: number;
    averageMood: number;
    moodTrend: string;
    commonTopics: string[];
    progressSummary: string;
  } {
    const memory = this.getUserMemory(userId);
    
    const commonTopics = memory.conversations
      .flatMap(c => c.topics)
      .reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const topTopics = Object.entries(commonTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
    
    let progressSummary = '';
    if (memory.emotionalPattern.moodTrend === 'improving') {
      progressSummary = 'Ваше эмоциональное состояние улучшается. Продолжайте текущую стратегию!';
    } else if (memory.emotionalPattern.moodTrend === 'declining') {
      progressSummary = 'Эмоциональное состояние требует внимания. Рекомендую усилить практики самопомощи.';
    } else {
      progressSummary = 'Эмоциональное состояние стабильно. Поддерживайте текущий баланс.';
    }
    
    return {
      conversationCount: memory.conversations.length,
      averageMood: memory.emotionalPattern.averageMood,
      moodTrend: memory.emotionalPattern.moodTrend,
      commonTopics: topTopics,
      progressSummary
    };
  }
}

export const enhancedAICoach = new EnhancedAICoach();
