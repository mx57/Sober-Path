// Продвинутый ИИ чат-помощник для поддержки восстановления

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  messageType: 'text' | 'suggestion' | 'exercise' | 'emergency' | 'celebration';
  metadata?: MessageMetadata;
  attachments?: ChatAttachment[];
}

export interface MessageMetadata {
  emotion?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  intent?: string;
  context?: ConversationContext;
  suggestions?: ActionSuggestion[];
}

export interface ConversationContext {
  userMood: number;
  cravingLevel: number;
  stressLevel: number;
  timeOfDay: number;
  location?: string;
  recentEvents?: string[];
  triggersDetected?: string[];
}

export interface ActionSuggestion {
  id: string;
  type: 'technique' | 'exercise' | 'contact' | 'distraction' | 'emergency';
  title: string;
  description: string;
  action: string;
}

export interface ChatAttachment {
  type: 'image' | 'audio' | 'video' | 'exercise' | 'article';
  url: string;
  title: string;
  description?: string;
}

export interface AIPersonality {
  name: string;
  tone: 'supportive' | 'professional' | 'friendly' | 'motivational' | 'calm';
  expertise: string[];
  responseStyle: 'brief' | 'detailed' | 'conversational';
  empathyLevel: number; // 1-10
  directness: number; // 1-10
}

export class AdvancedAIChat {
  private conversations: Map<string, ChatMessage[]> = new Map();
  private userProfiles: Map<string, UserChatProfile> = new Map();
  private currentPersonality: AIPersonality;
  private emotionDetector: EmotionDetector;
  private responseGenerator: ResponseGenerator;
  private contextAnalyzer: ContextAnalyzer;

  constructor() {
    this.currentPersonality = this.getDefaultPersonality();
    this.emotionDetector = new EmotionDetector();
    this.responseGenerator = new ResponseGenerator();
    this.contextAnalyzer = new ContextAnalyzer();
  }

  // Отправка сообщения пользователем
  async sendMessage(userId: string, content: string, context?: ConversationContext): Promise<ChatMessage[]> {
    // Создаем сообщение пользователя
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      senderId: userId,
      senderType: 'user',
      content,
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        context: context || await this.getCurrentContext(userId)
      }
    };

    // Добавляем в историю
    this.addMessageToHistory(userId, userMessage);

    // Анализируем сообщение
    const analysis = await this.analyzeMessage(userMessage);
    
    // Генерируем ответ ИИ
    const aiResponses = await this.generateAIResponse(userId, userMessage, analysis);
    
    // Добавляем ответы в историю
    aiResponses.forEach(response => this.addMessageToHistory(userId, response));

    return aiResponses;
  }

  // Анализ сообщения пользователя
  private async analyzeMessage(message: ChatMessage): Promise<MessageAnalysis> {
    const emotionAnalysis = this.emotionDetector.analyze(message.content);
    const intentAnalysis = await this.detectIntent(message.content);
    const urgencyLevel = this.assessUrgency(message.content, emotionAnalysis);
    const triggersDetected = this.detectTriggers(message.content);

    return {
      emotion: emotionAnalysis.primaryEmotion,
      emotionIntensity: emotionAnalysis.intensity,
      intent: intentAnalysis.intent,
      confidence: intentAnalysis.confidence,
      urgency: urgencyLevel,
      triggers: triggersDetected,
      themes: this.extractThemes(message.content),
      needsSupport: this.assessSupportNeed(message.content, emotionAnalysis)
    };
  }

  // Обнаружение триггеров
  private detectTriggers(content: string): string[] {
    const triggerKeywords = {
      alcohol: ['выпить', 'алкоголь', 'водка', 'пиво', 'вино', 'бухать'],
      drugs: ['наркотики', 'покурить', 'употребить', 'дозу'],
      stress: ['стресс', 'напряжение', 'давление', 'проблемы'],
      social: ['друзья пьют', 'вечеринка', 'бар', 'клуб'],
      emotional: ['депрессия', 'одиночество', 'скука', 'злость'],
      work: ['работа', 'начальник', 'коллеги', 'увольнение'],
      family: ['семья', 'родители', 'развод', 'конфликт']
    };

    const detectedTriggers: string[] = [];
    const lowerContent = content.toLowerCase();

    Object.entries(triggerKeywords).forEach(([trigger, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        detectedTriggers.push(trigger);
      }
    });

    return detectedTriggers;
  }

  // Извлечение тем из сообщения
  private extractThemes(content: string): string[] {
    const themes: string[] = [];
    const lowerContent = content.toLowerCase();

    const themeKeywords = {
      recovery: ['выздоровление', 'трезвость', 'лечение'],
      relationships: ['отношения', 'семья', 'друзья', 'партнер'],
      work: ['работа', 'карьера', 'коллеги'],
      health: ['здоровье', 'самочувствие', 'физическое'],
      emotions: ['чувства', 'эмоции', 'настроение'],
      goals: ['цели', 'планы', 'будущее', 'мечты'],
      spirituality: ['духовность', 'вера', 'смысл']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        themes.push(theme);
      }
    });

    return themes;
  }

  // Оценка потребности в поддержке
  private assessSupportNeed(content: string, emotionAnalysis: any): boolean {
    const supportIndicators = [
      'помогите', 'не знаю что делать', 'трудно', 'тяжело',
      'не справляюсь', 'одинок', 'никто не понимает',
      'хочется сдаться', 'нет сил'
    ];

    const lowerContent = content.toLowerCase();
    const hasIndicators = supportIndicators.some(indicator => 
      lowerContent.includes(indicator)
    );

    const highEmotionIntensity = emotionAnalysis.intensity > 0.7;
    const negativeEmotion = ['sad', 'angry', 'anxious', 'frustrated'].includes(emotionAnalysis.primaryEmotion);

    return hasIndicators || (highEmotionIntensity && negativeEmotion);
  }

  // Генерация ответа ИИ
  private async generateAIResponse(
    userId: string, 
    userMessage: ChatMessage, 
    analysis: MessageAnalysis
  ): Promise<ChatMessage[]> {
    const responses: ChatMessage[] = [];
    const userProfile = this.getUserProfile(userId);
    const conversation = this.conversations.get(userId) || [];

    // Определяем тип ответа на основе анализа
    if (analysis.urgency === 'critical') {
      responses.push(await this.generateEmergencyResponse(userId, analysis));
    } else if (analysis.urgency === 'high') {
      responses.push(await this.generateUrgentSupportResponse(userId, analysis));
    } else {
      responses.push(await this.generateRegularResponse(userId, userMessage, analysis));
    }

    // Добавляем дополнительные ответы при необходимости
    if (analysis.needsSupport) {
      responses.push(await this.generateSupportiveResponse(userId, analysis));
    }

    if (analysis.triggers.length > 0) {
      responses.push(await this.generateTriggerManagementResponse(userId, analysis.triggers));
    }

    // Предлагаем действия
    const suggestions = await this.generateActionSuggestions(userId, analysis);
    if (suggestions.length > 0) {
      const suggestionMessage = await this.createSuggestionMessage(userId, suggestions);
      responses.push(suggestionMessage);
    }

    return responses;
  }

  // Генерация экстренного ответа
  private async generateEmergencyResponse(userId: string, analysis: MessageAnalysis): Promise<ChatMessage> {
    const emergencyResponses = [
      "Я понимаю, что сейчас очень тяжело. Вы не одни в этом. Давайте вместе найдем способ справиться с этим моментом.",
      "Спасибо, что поделились со мной. Это требует мужества. Сейчас важно сосредоточиться на том, чтобы пройти через этот сложный момент.",
      "Я здесь, чтобы поддержать вас. То, что вы чувствуете сейчас, пройдет. Давайте найдем то, что поможет вам прямо сейчас."
    ];

    const response = emergencyResponses[Math.floor(Math.random() * emergencyResponses.length)];

    return {
      id: `msg_${Date.now()}_ai_emergency`,
      senderId: 'ai_coach',
      senderType: 'ai',
      content: response,
      timestamp: new Date(),
      messageType: 'emergency',
      metadata: {
        urgency: 'critical',
        suggestions: [
          {
            id: 'emergency_grounding',
            type: 'technique',
            title: 'Техника заземления 5-4-3-2-1',
            description: 'Быстрая техника для снижения острого стресса',
            action: 'start_grounding_technique'
          },
          {
            id: 'emergency_contact',
            type: 'contact',
            title: 'Связаться с поддержкой',
            description: 'Обратиться за немедленной помощью',
            action: 'open_emergency_contacts'
          },
          {
            id: 'crisis_breathing',
            type: 'technique',
            title: 'Кризисное дыхание',
            description: 'Дыхательная техника для экстренных ситуаций',
            action: 'start_crisis_breathing'
          }
        ]
      }
    };
  }

  // Генерация обычного ответа
  private async generateRegularResponse(
    userId: string, 
    userMessage: ChatMessage, 
    analysis: MessageAnalysis
  ): Promise<ChatMessage> {
    const userProfile = this.getUserProfile(userId);
    const conversationHistory = this.conversations.get(userId)?.slice(-5) || [];
    
    // Генерируем ответ на основе намерения пользователя
    let responseContent = '';
    
    switch (analysis.intent) {
      case 'seeking_support':
        responseContent = await this.generateSupportResponse(analysis);
        break;
      case 'sharing_progress':
        responseContent = await this.generateProgressResponse(userMessage.content);
        break;
      case 'asking_advice':
        responseContent = await this.generateAdviceResponse(userMessage.content, userProfile);
        break;
      case 'expressing_struggle':
        responseContent = await this.generateStruggleResponse(analysis);
        break;
      case 'casual_chat':
        responseContent = await this.generateCasualResponse(userMessage.content);
        break;
      default:
        responseContent = await this.generateDefaultResponse(userMessage.content, analysis);
    }

    // Персонализируем ответ
    responseContent = this.personalizeResponse(responseContent, userProfile);

    return {
      id: `msg_${Date.now()}_ai`,
      senderId: 'ai_coach',
      senderType: 'ai',
      content: responseContent,
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        emotion: analysis.emotion,
        intent: analysis.intent
      }
    };
  }

  // Различные типы ответов
  private async generateSupportResponse(analysis: MessageAnalysis): Promise<string> {
    const supportResponses = {
      'sad': [
        "Понимаю, что сейчас грустно. Эти чувства естественны на пути выздоровления. Что обычно помогает вам справляться с грустью?",
        "Грусть - это часть исцеления. Позвольте себе чувствовать это, но помните: это временно. Вы уже показали такую силу, дойдя до этой точки.",
        "Я вижу, что вам тяжело. Хотите поговорить о том, что вызывает эти чувства? Иногда проговорить помогает."
      ],
      'angry': [
        "Злость может быть признаком того, что что-то важное для вас нарушено. Это энергия, которую можно направить конструктивно. Что вас больше всего расстраивает сейчас?",
        "Понимаю вашу злость. Эта эмоция показывает, что вам не все равно. Давайте найдем здоровый способ выразить эти чувства.",
        "Злость - это нормально. Важно то, как мы с ней обращаемся. Что обычно помогает вам успокоиться?"
      ],
      'anxious': [
        "Тревога может быть сигналом о том, что мозг пытается защитить вас. Давайте вместе разберемся, что можно сделать прямо сейчас для облегчения.",
        "Понимаю, что тревога мешает. Помните: вы уже справлялись с трудностями раньше. Что помогало вам в прошлый раз?",
        "Тревожные мысли не равны реальности. Давайте сфокусируемся на том, что вы можете контролировать прямо сейчас."
      ]
    };

    const emotion = analysis.emotion || 'neutral';
    const responses = supportResponses[emotion as keyof typeof supportResponses] || [
      "Спасибо, что поделились со мной своими чувствами. Это важный шаг. Как я могу лучше поддержать вас сейчас?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async generateProgressResponse(content: string): Promise<string> {
    const positiveKeywords = ['лучше', 'хорошо', 'успех', 'достижение', 'прогресс', 'получилось'];
    const hasPositive = positiveKeywords.some(keyword => content.toLowerCase().includes(keyword));

    if (hasPositive) {
      const celebrationResponses = [
        "🎉 Это замечательно! Каждый шаг вперед - это победа. Я горжусь вашими усилиями!",
        "Отличная работа! Прогресс не всегда линеен, но вы движетесь в правильном направлении. Что помогло вам достичь этого?",
        "Здорово слышать о вашем прогрессе! Эти моменты важно отмечать и помнить. Как вы себя чувствуете?"
      ];
      return celebrationResponses[Math.floor(Math.random() * celebrationResponses.length)];
    } else {
      const encouragementResponses = [
        "Выздоровление - это путь с подъемами и спусками. То, что вы продолжаете пытаться, уже показывает вашу силу.",
        "Каждый день, когда вы не сдаетесь, - это прогресс, даже если он не всегда заметен. Что поддерживает вас в движении?",
        "Помните: неудачи не определяют вас. Важно то, что вы продолжаете. Какую поддержку вы ощущаете больше всего?"
      ];
      return encouragementResponses[Math.floor(Math.random() * encouragementResponses.length)];
    }
  }

  private async generateCasualResponse(content: string): Promise<string> {
    const casualResponses = [
      "Как хорошо, что вы решили поговорить! Что у вас на душе?",
      "Рад нашему общению! Как прошел день?",
      "Всегда готов выслушать и поддержать. О чем думаете?",
      "Спасибо, что поделились! Расскажите больше.",
      "Интересно! А как вы к этому относитесь?"
    ];

    return casualResponses[Math.floor(Math.random() * casualResponses.length)];
  }

  private async generateDefaultResponse(content: string, analysis: MessageAnalysis): Promise<string> {
    const defaultResponses = [
      "Понимаю, что вы хотите сказать. Расскажите больше об этом.",
      "Это важная тема. Как вы себя чувствуете по этому поводу?",
      "Спасибо, что поделились. Что для вас самое важное в этой ситуации?",
      "Я слышу вас. Как бы вы хотели, чтобы все сложилось?",
      "Это звучит значимо для вас. Какая поддержка вам нужна?"
    ];

    let response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];

    // Адаптируем ответ на основе анализа
    if (analysis.triggers.length > 0) {
      response += " Я заметил, что вы упомянули что-то, что может быть триггером. Хотите поговорить об этом?";
    }

    if (analysis.emotionIntensity > 0.7) {
      response += " Чувствую, что эмоции сейчас довольно сильные. Важно их признать.";
    }

    return response;
  }

  // Генерация предложений действий
  private async generateActionSuggestions(userId: string, analysis: MessageAnalysis): Promise<ActionSuggestion[]> {
    const suggestions: ActionSuggestion[] = [];

    // Предложения на основе эмоций
    if (analysis.emotion === 'anxious' && analysis.emotionIntensity > 0.6) {
      suggestions.push({
        id: 'anxiety_breathing',
        type: 'technique',
        title: 'Дыхательная техника 4-7-8',
        description: 'Быстрое успокоение при тревоге',
        action: 'start_breathing_exercise'
      });
    }

    if (analysis.emotion === 'sad' && analysis.emotionIntensity > 0.5) {
      suggestions.push({
        id: 'mood_lifting',
        type: 'exercise',
        title: 'Техника благодарности',
        description: 'Улучшение настроения через благодарность',
        action: 'start_gratitude_exercise'
      });
    }

    // Предложения на основе триггеров
    if (analysis.triggers.includes('stress')) {
      suggestions.push({
        id: 'stress_management',
        type: 'technique',
        title: 'Техника прогрессивной релаксации',
        description: 'Снятие физического напряжения',
        action: 'start_relaxation'
      });
    }

    if (analysis.triggers.includes('alcohol') || analysis.triggers.includes('drugs')) {
      suggestions.push({
        id: 'craving_management',
        type: 'technique',
        title: 'SURF техника',
        description: 'Проживание тяги без действия',
        action: 'start_surf_technique'
      });

      suggestions.push({
        id: 'distraction_game',
        type: 'distraction',
        title: 'Отвлекающая игра',
        description: 'Переключение внимания через игру',
        action: 'open_mini_games'
      });
    }

    // Предложения на основе намерений
    if (analysis.intent === 'seeking_support' && analysis.needsSupport) {
      suggestions.push({
        id: 'connect_support',
        type: 'contact',
        title: 'Связаться с поддержкой',
        description: 'Получить помощь от консультанта',
        action: 'open_support_contacts'
      });
    }

    if (analysis.urgency === 'high' || analysis.urgency === 'critical') {
      suggestions.push({
        id: 'emergency_help',
        type: 'emergency',
        title: 'Экстренная помощь',
        description: 'Немедленная профессиональная поддержка',
        action: 'call_emergency_line'
      });
    }

    // Общие предложения для поддержания мотивации
    if (suggestions.length === 0) {
      suggestions.push(
        {
          id: 'daily_check',
          type: 'technique',
          title: 'Проверка настроения',
          description: 'Отследить текущее состояние',
          action: 'open_mood_tracker'
        },
        {
          id: 'motivational_content',
          type: 'technique',
          title: 'Вдохновляющий контент',
          description: 'Мотивационные цитаты и истории',
          action: 'show_motivation'
        }
      );
    }

    return suggestions.slice(0, 3); // Максимум 3 предложения
  }

  // Создание сообщения с предложениями
  private async createSuggestionMessage(userId: string, suggestions: ActionSuggestion[]): Promise<ChatMessage> {
    return {
      id: `suggestions_${Date.now()}`,
      senderId: 'ai_coach',
      senderType: 'ai',
      content: 'Вот что может помочь сейчас:',
      timestamp: new Date(),
      messageType: 'suggestion',
      metadata: {
        suggestions: suggestions
      }
    };
  }

  // Генерация срочного ответа поддержки
  private async generateUrgentSupportResponse(userId: string, analysis: MessageAnalysis): Promise<ChatMessage> {
    const urgentResponses = [
      "Понимаю, что сейчас очень сложно. Важно помнить, что эти чувства временны, и вы не одни.",
      "Сейчас самое главное - ваша безопасность и благополучие. Давайте найдем способ справиться с этим моментом.",
      "То, что вы обратились за помощью, показывает вашу силу. Давайте вместе найдем решение.",
      "Я здесь, чтобы поддержать вас. Этот момент пройдет, и мы найдем способы сделать его легче."
    ];

    const response = urgentResponses[Math.floor(Math.random() * urgentResponses.length)];

    return {
      id: `urgent_support_${Date.now()}`,
      senderId: 'ai_coach',
      senderType: 'ai',
      content: response,
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        urgency: 'high',
        suggestions: [
          {
            id: 'immediate_grounding',
            type: 'technique',
            title: 'Техника заземления',
            description: 'Быстрая стабилизация состояния',
            action: 'start_grounding'
          },
          {
            id: 'crisis_support',
            type: 'contact',
            title: 'Кризисная поддержка',
            description: 'Связаться с консультантом',
            action: 'call_crisis_line'
          }
        ]
      }
    };
  }

  // Генерация поддерживающего ответа
  private async generateSupportiveResponse(userId: string, analysis: MessageAnalysis): Promise<ChatMessage> {
    const supportiveResponses = [
      "Ваши чувства понятны и нормальны. Путь к выздоровлению не всегда прямой, но каждый шаг имеет значение.",
      "Спасибо за доверие. Рассказывать о своих переживаниях требует мужества.",
      "Я вижу, что вы прикладываете усилия. Это не всегда легко заметить, но прогресс есть.",
      "Помните: вы заслуживаете поддержки и понимания. Ваши усилия не напрасны.",
      "Каждый день, когда вы не сдаетесь, - это победа. Я верю в вашу силу."
    ];

    const response = supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];

    return {
      id: `supportive_${Date.now()}`,
      senderId: 'ai_coach',
      senderType: 'ai',
      content: response,
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        emotion: analysis.emotion,
        supportType: 'emotional'
      }
    };
  }

  // Генерация ответа для управления триггерами
  private async generateTriggerManagementResponse(userId: string, triggers: string[]): Promise<ChatMessage> {
    const triggerResponses: { [key: string]: string } = {
      alcohol: "Заметил упоминание алкоголя. Триггеры - нормальная часть выздоровления. У вас есть план действий для таких моментов?",
      drugs: "Понимаю, что могли столкнуться с триггером. Важно иметь стратегии для таких ситуаций.",
      stress: "Стресс может усложнять ситуацию. Давайте найдем способы его снизить.",
      social: "Социальные ситуации бывают сложными. Как обычно справляетесь с таким давлением?",
      emotional: "Сильные эмоции могут быть триггером. Важно их признать и найти здоровые способы выражения.",
      work: "Рабочий стресс влияет на многих в восстановлении. Есть ли способы создать более здоровую рабочую среду?",
      family: "Семейная динамика может быть сложной. Границы и общение - ключевые навыки."
    };

    const primaryTrigger = triggers[0] || 'general';
    const response = triggerResponses[primaryTrigger] || 
      "Вижу, что столкнулись с потенциальными триггерами. Это нормально, и важно иметь план действий.";

    const triggerSuggestions: ActionSuggestion[] = [
      {
        id: 'trigger_plan',
        type: 'technique',
        title: 'План действий при триггерах',
        description: 'Пошаговая стратегия преодоления',
        action: 'create_trigger_plan'
      },
      {
        id: 'mindful_pause',
        type: 'technique',
        title: 'Осознанная пауза',
        description: 'Остановиться и оценить ситуацию',
        action: 'start_mindful_pause'
      }
    ];

    return {
      id: `trigger_management_${Date.now()}`,
      senderId: 'ai_coach',
      senderType: 'ai',
      content: response,
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        triggers: triggers,
        suggestions: triggerSuggestions
      }
    };
  }

  private async generateAdviceResponse(content: string, userProfile: UserChatProfile): Promise<string> {
    // Анализируем, о чем спрашивает пользователь
    const topics = {
      'работа': 'Работа может быть источником стресса в выздоровлении. Важно найти баланс и четкие границы.',
      'отношения': 'Отношения часто меняются в процессе выздоровления. Честное общение и границы - ключ к здоровым отношениям.',
      'семья': 'Семейные отношения требуют времени и терпения для восстановления. Начните с малых шагов к доверию.',
      'триггеры': 'Триггеры - нормальная часть выздоровления. Важно их распознавать и иметь план действий.',
      'мотивация': 'Мотивация приходит и уходит. Важнее создать систему поддержки и рутины, которые работают независимо от настроения.'
    };

    const topic = Object.keys(topics).find(key => content.toLowerCase().includes(key));
    
    if (topic) {
      return `${topics[topic as keyof typeof topics]} Что конкретно вас больше всего беспокоит в этой области?`;
    }

    return "Это важный вопрос. Чтобы дать вам наилучший совет, расскажите больше о ситуации. Какие варианты вы уже рассматривали?";
  }

  // Обнаружение намерений
  private async detectIntent(content: string): Promise<{ intent: string; confidence: number }> {
    const intentPatterns = {
      'seeking_support': ['помогите', 'трудно', 'не могу', 'плохо', 'грустно', 'тяжело'],
      'sharing_progress': ['удалось', 'получилось', 'лучше', 'прогресс', 'достижение'],
      'asking_advice': ['что делать', 'как быть', 'посоветуйте', 'как справиться', 'что думаете'],
      'expressing_struggle': ['хочется', 'тяга', 'срыв', 'не выдержу', 'соблазн'],
      'casual_chat': ['привет', 'как дела', 'что нового', 'поговорим']
    };

    let bestMatch = 'casual_chat';
    let highestScore = 0;

    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      const score = patterns.filter(pattern => 
        content.toLowerCase().includes(pattern)
      ).length;
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = intent;
      }
    });

    return {
      intent: bestMatch,
      confidence: Math.min(highestScore / 3, 1) // Нормализуем до 0-1
    };
  }

  // Оценка срочности
  private assessUrgency(content: string, emotionAnalysis: any): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['суицид', 'покончить', 'не хочу жить', 'конец', 'убить себя'];
    const highKeywords = ['срыв', 'не выдержу', 'хочется выпить', 'купил', 'сорвался'];
    const mediumKeywords = ['тяга', 'трудно', 'плохо', 'стресс', 'тревога'];

    if (criticalKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
      return 'critical';
    }
    
    if (highKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
      return 'high';
    }
    
    if (mediumKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  // Получение профиля пользователя
  private getUserProfile(userId: string): UserChatProfile {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        name: 'Друг',
        preferredTone: 'supportive',
        communicationStyle: 'conversational',
        triggerWords: [],
        supportiveTopics: [],
        conversationHistory: [],
        personalizedResponses: new Map(),
        chatStats: {
          totalMessages: 0,
          averageResponseTime: 0,
          mostDiscussedTopics: [],
          emotionalTrends: [],
          supportEffectiveness: 0.8
        }
      };
      this.userProfiles.set(userId, profile);
    }
    
    return profile;
  }

  // Персонализация ответа
  private personalizeResponse(response: string, profile: UserChatProfile): string {
    // Заменяем общие обращения на имя пользователя
    response = response.replace(/\b(друг|пользователь)\b/gi, profile.name);
    
    // Адаптируем тон
    if (profile.preferredTone === 'professional') {
      response = response.replace(/!+/g, '.'); // Убираем излишний энтузиазм
    } else if (profile.preferredTone === 'friendly') {
      if (!response.includes('!') && Math.random() > 0.5) {
        response += ' 😊'; // Добавляем эмодзи
      }
    }
    
    return response;
  }

  // Добавление сообщения в историю
  private addMessageToHistory(userId: string, message: ChatMessage): void {
    const conversation = this.conversations.get(userId) || [];
    conversation.push(message);
    
    // Ограничиваем историю последними 100 сообщениями
    if (conversation.length > 100) {
      conversation.splice(0, conversation.length - 100);
    }
    
    this.conversations.set(userId, conversation);
  }

  private getDefaultPersonality(): AIPersonality {
    return {
      name: 'Alex',
      tone: 'supportive',
      expertise: ['addiction_recovery', 'emotional_support', 'coping_strategies'],
      responseStyle: 'conversational',
      empathyLevel: 9,
      directness: 6
    };
  }

  private async getCurrentContext(userId: string): Promise<ConversationContext> {
    // В реальном приложении здесь был бы запрос к службе контекста
    return {
      userMood: 3,
      cravingLevel: 2,
      stressLevel: 4,
      timeOfDay: new Date().getHours()
    };
  }
}

// Вспомогательные классы
class EmotionDetector {
  analyze(text: string): { primaryEmotion: string; intensity: number } {
    const emotionKeywords = {
      'sad': ['грустно', 'печально', 'депрессия', 'уныло', 'тоскливо'],
      'angry': ['злой', 'бесит', 'раздражает', 'ярость', 'злость'],
      'anxious': ['тревога', 'беспокойство', 'страх', 'нервничаю', 'переживаю'],
      'happy': ['хорошо', 'радость', 'счастлив', 'отлично', 'весело'],
      'frustrated': ['достал', 'надоело', 'бесит', 'фрустрация'],
      'hopeful': ['надеюсь', 'верю', 'получится', 'оптимизм']
    };

    let dominantEmotion = 'neutral';
    let maxScore = 0;

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const score = keywords.filter(keyword => 
        text.toLowerCase().includes(keyword)
      ).length;
      
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    });

    return {
      primaryEmotion: dominantEmotion,
      intensity: Math.min(maxScore / 2, 1)
    };
  }
}

class ResponseGenerator {
  // Методы генерации ответов
  generateResponse(context: any): string {
    return "Сгенерированный ответ на основе контекста";
  }
}

class ContextAnalyzer {
  // Методы анализа контекста
  analyzeContext(message: any): any {
    return {
      sentiment: 'neutral',
      topics: [],
      urgency: 'low'
    };
  }
}

// Интерфейсы
interface MessageAnalysis {
  emotion: string;
  emotionIntensity: number;
  intent: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  triggers: string[];
  themes: string[];
  needsSupport: boolean;
}

interface UserChatProfile {
  userId: string;
  name: string;
  preferredTone: string;
  communicationStyle: string;
  triggerWords: string[];
  supportiveTopics: string[];
  conversationHistory: string[];
  personalizedResponses: Map<string, string>;
  chatStats: ChatStats;
}

interface ChatStats {
  totalMessages: number;
  averageResponseTime: number;
  mostDiscussedTopics: string[];
  emotionalTrends: { date: Date; emotion: string; intensity: number }[];
  supportEffectiveness: number;
}

export default AdvancedAIChat;