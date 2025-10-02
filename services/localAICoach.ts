// Улучшенный AI-коуч с локальной языковой моделью

interface AIResponse {
  message: string;
  suggestions: string[];
  resources: string[];
  mood: 'supportive' | 'motivational' | 'analytical' | 'calming';
  confidence: number; // 0-1
}

interface ConversationContext {
  userMood: number; // 1-5
  soberDays: number;
  recentChallenges: string[];
  preferredTechniques: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  urgency: 'low' | 'medium' | 'high' | 'crisis';
}

// Базовые шаблоны ответов для разных ситуаций
const responseTemplates = {
  crisis: {
    supportive: [
      "Я понимаю, что сейчас очень тяжело. Помните: это чувство временно. Давайте вместе найдем способ пройти через это.",
      "Ваша боль реальна, и ваши усилия ценны. Каждая секунда, когда вы выбираете трезвость, - это акт смелости.",
      "Сейчас самое важное - ваша безопасность. Дышите медленно и глубоко. Я здесь, чтобы поддержать вас."
    ],
    techniques: [
      "Техника 5-4-3-2-1: назовите 5 вещей, которые видите, 4 - которые слышите, 3 - которые чувствуете, 2 - которые нюхаете, 1 - которую пробуете.",
      "Квадратное дыхание: вдох 4 счета, задержка 4, выдох 4, задержка 4. Повторите 5 раз.",
      "Холодная вода: умойтесь холодной водой или приложите лед к запястьям для быстрого успокоения."
    ]
  },
  
  high_urgency: {
    motivational: [
      "Это сложный момент, но вы уже много раз доказывали свою силу. Какая техника помогала вам раньше?",
      "Тяга как волна - она поднимается, но обязательно спадет. Давайте 'серфим' по ней вместе.",
      "Вспомните, почему вы начали этот путь. Та причина все еще важна для вас?"
    ],
    techniques: [
      "Серфинг по тяге: представьте тягу как волну, наблюдайте за ней без сопротивления",
      "Якорение силы: вспомните момент, когда чувствовали себя очень сильным, и 'заякорите' это ощущение",
      "Временная линия: представьте себя через час, день, неделю - как будете себя чувствовать, выбрав трезвость?"
    ]
  },
  
  medium_urgency: {
    analytical: [
      "Давайте разберем ситуацию. Что именно запустило эти мысли об алкоголе?",
      "Замечательно, что вы обратились за поддержкой. Это показывает вашу осознанность и силу.",
      "Какие изменения вы заметили в себе за время трезвости? Давайте сфокусируемся на позитивном."
    ],
    techniques: [
      "Дневник мыслей CBT: запишите ситуацию, мысли, эмоции и найдите альтернативные мысли",
      "Техника СТОП: остановитесь, вдохните, оцените ситуацию, выберите осознанное действие",
      "Рефрейминг: как можно по-другому взглянуть на эту ситуацию?"
    ]
  },
  
  low_urgency: {
    calming: [
      "Как дела сегодня? Расскажите, что на душе.",
      "Каждый день трезвости - это инвестиция в ваше будущее. Как вы сегодня заботитесь о себе?",
      "Какие позитивные изменения вы замечаете в своей жизни?"
    ],
    techniques: [
      "Медитация благодарности: подумайте о трех вещах, за которые благодарны сегодня",
      "Визуализация цели: представьте свою жизнь через год трезвости",
      "Сканирование тела: пройдитесь вниманием по телу от головы до пят"
    ]
  }
};

// Персонализированные ответы на основе профиля пользователя
const personalizedResponses = {
  earlyRecovery: { // 0-30 дней
    morning: "Доброе утро! Каждое утро в трезвости - это новая победа. Как планируете провести этот день?",
    afternoon: "День набирает обороты. Помните: вы сильнее любых временных трудностей.",
    evening: "Вечер - часто сложное время. Чем займетесь сегодня вместо старых привычек?",
    night: "Ночь может принести беспокойные мысли. Попробуйте технику расслабления или медитацию на сон."
  },
  
  buildingStrength: { // 31-90 дней
    morning: "Прекрасное утро для укрепления здоровых привычек! Какую позитивную активность добавите в день?",
    afternoon: "Середина дня - время для перезарядки. Что дает вам энергию и радость?",
    evening: "Вечер для рефлексии. Что нового вы узнали о себе за это время трезвости?",
    night: "Качественный сон - основа восстановления. Готовы ко сну или нужна помощь с расслаблением?"
  },
  
  establishedSobriety: { // 90+ дней
    morning: "С добрым утром! Вы - вдохновение для многих. Какими планами поделитесь?",
    afternoon: "Полдень - время для больших дел. Как используете свою обретенную ясность ума?",
    evening: "Вечер для наслаждения плодами своего труда. Чем гордитесь сегодня?",
    night: "Спокойной ночи! Завтра новый день возможностей в вашей трезвой жизни."
  }
};

// Ключевые слова для определения настроения и контекста
const keywordAnalysis = {
  crisis: ['хочу выпить', 'не могу', 'сорвусь', 'невыносимо', 'помогите', 'плохо', 'ужасно'],
  anxiety: ['тревога', 'беспокойство', 'страх', 'паника', 'нервничаю', 'волнуюсь'],
  sadness: ['грустно', 'печально', 'депрессия', 'одиноко', 'пусто', 'тоска'],
  anger: ['злость', 'бешенство', 'раздражение', 'ненависть', 'ярость', 'бесит'],
  progress: ['лучше', 'хорошо', 'прогресс', 'получается', 'гордость', 'счастлив'],
  gratitude: ['спасибо', 'благодарен', 'ценю', 'помогает', 'поддержка']
};

class LocalAICoach {
  private conversationHistory: Array<{
    user: string;
    ai: string;
    timestamp: Date;
    context: Partial<ConversationContext>;
  }> = [];

  // Простая модель анализа настроения на основе ключевых слов
  private analyzeMood(message: string): { mood: string; confidence: number } {
    const lowercaseMessage = message.toLowerCase();
    let moodScore = {
      crisis: 0,
      anxiety: 0,
      sadness: 0,
      anger: 0,
      progress: 0,
      gratitude: 0
    };

    // Подсчет совпадений ключевых слов
    Object.entries(keywordAnalysis).forEach(([mood, keywords]) => {
      keywords.forEach(keyword => {
        if (lowercaseMessage.includes(keyword)) {
          moodScore[mood as keyof typeof moodScore] += 1;
        }
      });
    });

    // Определение доминирующего настроения
    const maxMood = Object.entries(moodScore).reduce((a, b) => 
      moodScore[a[0] as keyof typeof moodScore] > moodScore[b[0] as keyof typeof moodScore] ? a : b
    );

    const confidence = Math.min(maxMood[1] / 3, 1); // Нормализация до 0-1

    return {
      mood: maxMood[0],
      confidence
    };
  }

  // Определение приоритета ответа
  private determineUrgency(mood: string, keywords: string[]): ConversationContext['urgency'] {
    if (mood === 'crisis') return 'crisis';
    if (mood === 'anxiety' && keywords.some(k => ['паника', 'невыносимо', 'помогите'].includes(k))) {
      return 'high';
    }
    if (['anxiety', 'anger', 'sadness'].includes(mood)) return 'medium';
    return 'low';
  }

  // Генерация ответа на основе контекста
  private generateResponse(context: ConversationContext, userMessage: string): AIResponse {
    const moodAnalysis = this.analyzeMood(userMessage);
    const urgency = this.determineUrgency(moodAnalysis.mood, userMessage.toLowerCase().split(' '));
    
    let responseCategory: keyof typeof responseTemplates;
    let moodType: keyof (typeof responseTemplates)['crisis'];

    // Выбор категории ответа
    if (urgency === 'crisis') {
      responseCategory = 'crisis';
      moodType = 'supportive';
    } else if (urgency === 'high') {
      responseCategory = 'high_urgency';
      moodType = 'motivational';
    } else if (urgency === 'medium') {
      responseCategory = 'medium_urgency';
      moodType = 'analytical';
    } else {
      responseCategory = 'low_urgency';
      moodType = 'calming';
    }

    // Выбор персонализированного ответа на основе периода трезвости
    let personalizedGreeting = '';
    if (context.soberDays <= 30) {
      personalizedGreeting = personalizedResponses.earlyRecovery[context.timeOfDay];
    } else if (context.soberDays <= 90) {
      personalizedGreeting = personalizedResponses.buildingStrength[context.timeOfDay];
    } else {
      personalizedGreeting = personalizedResponses.establishedSobriety[context.timeOfDay];
    }

    // Получение случайного ответа из категории
    const responses = responseTemplates[responseCategory][moodType];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Получение техник
    const techniques = responseTemplates[responseCategory].techniques || [];
    
    // Формирование итогового ответа
    let finalMessage = '';
    
    if (urgency === 'low_urgency') {
      finalMessage = personalizedGreeting;
    } else {
      finalMessage = randomResponse;
    }

    // Добавление персонализации на основе дней трезвости
    if (context.soberDays > 0 && urgency !== 'crisis') {
      if (context.soberDays === 1) {
        finalMessage += '\n\nПоздравляю с первым днем трезвости! Это огромный шаг.';
      } else if (context.soberDays === 7) {
        finalMessage += '\n\n🎉 Неделя трезвости! Это серьезное достижение.';
      } else if (context.soberDays === 30) {
        finalMessage += '\n\n🏆 Месяц трезвости - вы невероятны! Ваше тело благодарит вас.';
      } else if (context.soberDays % 30 === 0) {
        finalMessage += `\n\n✨ ${Math.floor(context.soberDays / 30)} месяцев трезвости! Вы вдохновляете других.`;
      }
    }

    return {
      message: finalMessage,
      suggestions: this.generateSuggestions(context, moodAnalysis.mood),
      resources: this.getRelevantResources(urgency, moodAnalysis.mood),
      mood: moodType,
      confidence: moodAnalysis.confidence
    };
  }

  // Генерация предложений действий
  private generateSuggestions(context: ConversationContext, detectedMood: string): string[] {
    const baseSuggestions = {
      crisis: [
        'Позвоните другу или родственнику',
        'Сходите на прогулку или сделайте физические упражнения',
        'Попробуйте дыхательную технику',
        'Примите холодный душ для перезагрузки'
      ],
      anxiety: [
        'Попробуйте медитацию или дыхательные упражнения',
        'Выйдите на свежий воздух',
        'Послушайте успокаивающую музыку',
        'Сделайте что-то творческое'
      ],
      sadness: [
        'Поговорите с кем-то, кому доверяете',
        'Запишите свои чувства в дневник',
        'Сделайте что-то доброе для себя',
        'Посмотрите мотивирующий фильм или видео'
      ],
      default: [
        'Отметьте свой прогресс в дневнике',
        'Попробуйте новое НЛП упражнение',
        'Послушайте терапевтические звуки',
        'Поделитесь успехом с сообществом'
      ]
    };

    const suggestions = baseSuggestions[detectedMood as keyof typeof baseSuggestions] || baseSuggestions.default;
    
    // Персонализация на основе времени дня
    if (context.timeOfDay === 'morning') {
      suggestions.push('Начните день с позитивной аффирмации');
    } else if (context.timeOfDay === 'evening') {
      suggestions.push('Подготовьтесь ко сну с расслабляющей процедурой');
    }

    return suggestions.slice(0, 3); // Возвращаем только 3 предложения
  }

  // Получение релевантных ресурсов
  private getRelevantResources(urgency: ConversationContext['urgency'], mood: string): string[] {
    const resources = {
      crisis: [
        'Экстренная помощь в приложении',
        'Горячая линия поддержки',
        'Техники кризисного вмешательства',
        'Дыхательные упражнения для паники'
      ],
      high: [
        'НЛП техники для преодоления тяги',
        'Аудио-сессии для успокоения',
        'Сообщество поддержки',
        'Мотивационные истории'
      ],
      medium: [
        'Психологические техники CBT',
        'Упражнения осознанности',
        'Анализ триггеров',
        'Планирование дня'
      ],
      low: [
        'Образовательные материалы',
        'Истории успеха',
        'Здоровые привычки',
        'Долгосрочное планирование'
      ]
    };

    return resources[urgency] || resources.low;
  }

  // Обновление контекста на основе пользовательского ввода
  private updateContext(currentContext: ConversationContext, userMessage: string): ConversationContext {
    const moodAnalysis = this.analyzeMood(userMessage);
    
    // Обновляем настроение пользователя (простая эвристика)
    let newMoodScore = currentContext.userMood;
    
    if (moodAnalysis.mood === 'progress' || moodAnalysis.mood === 'gratitude') {
      newMoodScore = Math.min(5, currentContext.userMood + 1);
    } else if (moodAnalysis.mood === 'crisis' || moodAnalysis.mood === 'sadness') {
      newMoodScore = Math.max(1, currentContext.userMood - 1);
    }

    return {
      ...currentContext,
      userMood: newMoodScore,
      urgency: this.determineUrgency(moodAnalysis.mood, userMessage.toLowerCase().split(' '))
    };
  }

  // Основной метод для получения ответа
  public async getResponse(userMessage: string, context: ConversationContext): Promise<AIResponse> {
    // Обновляем контекст
    const updatedContext = this.updateContext(context, userMessage);
    
    // Генерируем ответ
    const response = this.generateResponse(updatedContext, userMessage);
    
    // Сохраняем в истории
    this.conversationHistory.push({
      user: userMessage,
      ai: response.message,
      timestamp: new Date(),
      context: updatedContext
    });

    // Ограничиваем размер истории
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-25);
    }

    return response;
  }

  // Получение быстрой поддержки для кризисных ситуаций
  public async getQuickSupport(urgencyLevel: 'high' | 'crisis' = 'high'): Promise<AIResponse> {
    const crisisResponse = urgencyLevel === 'crisis' 
      ? responseTemplates.crisis.supportive[0]
      : responseTemplates.high_urgency.motivational[0];
    
    return {
      message: crisisResponse,
      suggestions: [
        'Дышите медленно и глубоко',
        'Назовите 5 вещей, которые видите',
        'Выпейте стакан холодной воды',
        'Обратитесь за поддержкой'
      ],
      resources: [
        'Экстренные техники',
        'Дыхательные упражнения',
        'Горячая линия помощи',
        'Кризисное вмешательство'
      ],
      mood: 'supportive',
      confidence: 1.0
    };
  }

  // Получение мотивационного сообщения
  public async getMotivationalMessage(soberDays: number): Promise<string> {
    if (soberDays === 0) {
      return "Сегодня первый день вашей новой жизни. Каждый момент трезвости - это акт любви к себе.";
    } else if (soberDays <= 7) {
      return `${soberDays} дней силы и мужества! Ваш мозг уже начинает восстанавливаться.`;
    } else if (soberDays <= 30) {
      return `${soberDays} дней трезвости! Ваше тело благодарит вас за каждый трезвый день.`;
    } else if (soberDays <= 90) {
      return `${soberDays} дней - это серьезное достижение! Вы создаете новые нейронные пути успеха.`;
    } else {
      return `${soberDays} дней трезвости! Вы - живое доказательство того, что изменения возможны.`;
    }
  }

  // Анализ паттернов в истории разговоров
  public getInsights(): { patterns: string[]; recommendations: string[] } {
    if (this.conversationHistory.length < 5) {
      return {
        patterns: ['Недостаточно данных для анализа'],
        recommendations: ['Продолжайте общение для получения персонализированных рекомендаций']
      };
    }

    const recentConversations = this.conversationHistory.slice(-10);
    
    // Анализ частых тем
    const topics: Record<string, number> = {};
    recentConversations.forEach(conv => {
      const mood = this.analyzeMood(conv.user).mood;
      topics[mood] = (topics[mood] || 0) + 1;
    });

    const mostFrequentTopic = Object.entries(topics).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    const patterns = [
      `Чаще всего обращаетесь с темой: ${mostFrequentTopic}`,
      `Общее количество обращений: ${this.conversationHistory.length}`,
      `Средняя активность: ${(this.conversationHistory.length / 7).toFixed(1)} обращений в неделю`
    ];

    const recommendations = [
      mostFrequentTopic === 'anxiety' ? 'Рекомендуем больше практик осознанности' : 'Продолжайте текущую стратегию',
      'Регулярное общение с AI-коучем помогает отслеживать прогресс',
      'Рассмотрите возможность ведения дневника эмоций'
    ];

    return { patterns, recommendations };
  }

  // Очистка истории
  public clearHistory(): void {
    this.conversationHistory = [];
  }

  // Экспорт истории для анализа
  public exportHistory(): string {
    return JSON.stringify(this.conversationHistory, null, 2);
  }
}

export { LocalAICoach, type AIResponse, type ConversationContext };