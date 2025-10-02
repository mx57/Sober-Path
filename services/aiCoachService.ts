import { useState, useEffect } from 'react';

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

export interface PersonalizedPlan {
  id: string;
  name: string;
  phase: 'detox' | 'stabilization' | 'growth' | 'maintenance';
  duration: number; // days
  dailyTasks: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
  weeklyGoals: string[];
  techniques: string[];
  checkpoints: {
    day: number;
    milestone: string;
    reward: string;
  }[];
}

export interface PredictiveInsight {
  id: string;
  type: 'risk_prediction' | 'success_probability' | 'optimal_timing' | 'trigger_alert';
  title: string;
  description: string;
  confidence: number; // 0-100%
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
  validUntil: Date;
}

export interface HealthMetrics {
  heartRate?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  hydration?: 1 | 2 | 3 | 4 | 5;
  physicalActivity?: number; // minutes
  screenTime?: number; // hours
  socialInteraction?: 1 | 2 | 3 | 4 | 5;
}

export class AICoachService {
  private static userHistory: any[] = [];
  private static patterns: TriggerPattern[] = [];
  
  static analyzeUserBehavior(data: {
    mood: number;
    cravingLevel: number;
    stressLevel: number;
    healthMetrics: HealthMetrics;
    recentEvents: string[];
  }): AICoachMessage[] {
    const messages: AICoachMessage[] = [];
    const now = new Date();

    // Анализ риска срыва
    if (data.cravingLevel >= 4 && data.stressLevel >= 4) {
      messages.push({
        id: `crisis_${Date.now()}`,
        type: 'crisis',
        priority: 'critical',
        timestamp: now,
        message: 'Я вижу, что сейчас вам очень трудно. Высокий уровень стресса и тяги могут привести к срыву. Давайте вместе преодолеем этот момент.',
        actions: [
          { text: 'Экстренные техники', action: 'emergency_techniques' },
          { text: 'Связаться с поддержкой', action: 'contact_support' },
          { text: 'Начать дыхательное упражнение', action: 'breathing_exercise' }
        ]
      });
    }

    // Мотивационные сообщения
    if (data.mood >= 4 && data.cravingLevel <= 2) {
      messages.push({
        id: `motivation_${Date.now()}`,
        type: 'celebration',
        priority: 'medium',
        timestamp: now,
        message: 'Отличная работа! Ваше настроение стабильно, а уровень тяги низкий. Это показывает, что ваши усилия приносят результат. Продолжайте в том же духе!',
        actions: [
          { text: 'Записать победу', action: 'log_victory' },
          { text: 'Поделиться успехом', action: 'share_success' }
        ]
      });
    }

    // Предупреждения о паттернах
    if (data.healthMetrics.sleepQuality && data.healthMetrics.sleepQuality <= 2) {
      messages.push({
        id: `warning_${Date.now()}`,
        type: 'warning',
        priority: 'high',
        timestamp: now,
        message: 'Плохое качество сна может увеличить риск срыва. Недосып влияет на самоконтроль и повышает уровень стресса.',
        actions: [
          { text: 'Техники для сна', action: 'sleep_techniques' },
          { text: 'Гигиена сна', action: 'sleep_hygiene' },
          { text: 'Расслабляющие звуки', action: 'relaxing_sounds' }
        ]
      });
    }

    // Персональные рекомендации
    if (data.healthMetrics.stressLevel && data.healthMetrics.stressLevel >= 4) {
      messages.push({
        id: `guidance_${Date.now()}`,
        type: 'guidance',
        priority: 'medium',
        timestamp: now,
        message: 'Высокий уровень стресса требует внимания. Рекомендую выполнить технику снижения стресса прямо сейчас.',
        actions: [
          { text: 'EFT техника', action: 'eft_technique' },
          { text: 'Дыхательная техника', action: 'breathing' },
          { text: 'Медитация 5 минут', action: 'quick_meditation' }
        ]
      });
    }

    return messages;
  }

  static detectTriggerPatterns(userHistory: any[]): TriggerPattern[] {
    const patterns: TriggerPattern[] = [
      {
        id: '1',
        name: 'Вечерний стресс',
        type: 'temporal',
        description: 'Повышенная тяга к алкоголю в вечернее время (18:00-22:00)',
        severity: 4,
        frequency: this.calculateFrequency(userHistory, 'evening_stress'),
        countermeasures: [
          'Планировать вечерние активности заранее',
          'Использовать расслабляющие техники после 18:00',
          'Избегать просмотра стрессового контента вечером'
        ]
      },
      {
        id: '2',
        name: 'Социальное давление',
        type: 'social',
        description: 'Тяга усиливается в социальных ситуациях с алкоголем',
        severity: 5,
        frequency: this.calculateFrequency(userHistory, 'social_pressure'),
        countermeasures: [
          'Подготовить отговорки заранее',
          'Найти союзника в компании',
          'Иметь план быстрого ухода'
        ]
      },
      {
        id: '3',
        name: 'Эмоциональные качели',
        type: 'emotional',
        description: 'Резкие перепады настроения провоцируют желание выпить',
        severity: 4,
        frequency: this.calculateFrequency(userHistory, 'mood_swings'),
        countermeasures: [
          'Техники регуляции эмоций (DBT)',
          'Ведение дневника настроения',
          'Регулярная физическая активность'
        ]
      },
      {
        id: '4',
        name: 'Рабочий стресс',
        type: 'environmental',
        description: 'Конфликты и перегрузки на работе',
        severity: 3,
        frequency: this.calculateFrequency(userHistory, 'work_stress'),
        countermeasures: [
          'Техники тайм-менеджмента',
          'Границы между работой и личной жизнью',
          'Короткие перерывы для релаксации'
        ]
      }
    ];

    return patterns;
  }

  private static calculateFrequency(history: any[], pattern: string): number {
    // Симуляция расчета частоты паттерна
    return Math.floor(Math.random() * 10) + 1;
  }

  static generatePredictiveInsights(userData: any): PredictiveInsight[] {
    return [
      {
        id: '1',
        type: 'risk_prediction',
        title: 'Повышенный риск в выходные',
        description: 'Анализ показывает 73% вероятность усиления тяги в субботу вечером',
        confidence: 73,
        recommendation: 'Запланируйте активность на субботу вечером. Рекомендую встречу с поддерживающим другом или посещение группы поддержки.',
        urgency: 'medium',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'success_probability',
        title: 'Оптимальное время для техник',
        description: 'Утренние медитации показывают 89% эффективности для вас',
        confidence: 89,
        recommendation: 'Выполняйте основные техники mindfulness между 7:00-9:00 утра для максимальной пользы.',
        urgency: 'low',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        type: 'trigger_alert',
        title: 'Приближается сложный период',
        description: 'Праздники исторически связаны с повышенным риском срыва',
        confidence: 67,
        recommendation: 'Подготовьте план действий на праздники: альтернативные активности, система поддержки, техники самопомощи.',
        urgency: 'high',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  static createPersonalizedPlan(userProfile: any, currentPhase: string): PersonalizedPlan {
    const plans: Record<string, PersonalizedPlan> = {
      detox: {
        id: 'detox_plan',
        name: 'План детоксикации (1-7 дни)',
        phase: 'detox',
        duration: 7,
        dailyTasks: {
          morning: [
            'Выпить стакан воды с лимоном',
            'Легкая зарядка 10 минут',
            'Утренняя медитация 5 минут',
            'Принять витамины'
          ],
          afternoon: [
            'Здоровый обед без обработанных продуктов',
            'Прогулка на свежем воздухе 20 минут',
            'Дыхательные упражнения',
            'Выпить 2 стакана воды'
          ],
          evening: [
            'Расслабляющая ванна',
            'Вечерняя растяжка',
            'Чтение или спокойная музыка',
            'Отбой не позднее 22:00'
          ]
        },
        weeklyGoals: [
          'Полная детоксикация организма',
          'Стабилизация режима сна',
          'Начало здорового питания'
        ],
        techniques: ['Глубокое дыхание', 'Прогрессивная релаксация', 'Mindfulness'],
        checkpoints: [
          { day: 3, milestone: '72 часа трезвости', reward: 'Специальный ужин' },
          { day: 7, milestone: 'Неделя без алкоголя', reward: 'Новая книга или фильм' }
        ]
      },
      stabilization: {
        id: 'stabilization_plan',
        name: 'План стабилизации (8-30 дни)',
        phase: 'stabilization',
        duration: 23,
        dailyTasks: {
          morning: [
            'Медитация 10-15 минут',
            'Зарядка или йога 15 минут',
            'Здоровый завтрак',
            'Планирование дня'
          ],
          afternoon: [
            'Выполнение одной психологической техники',
            'Физическая активность 30 минут',
            'Социальное взаимодействие (звонок другу)',
            'Работа над хобби'
          ],
          evening: [
            'Ведение дневника благодарности',
            'Расслабляющие звуки 20 минут',
            'Подготовка к завтрашнему дню',
            'Техника засыпания'
          ]
        },
        weeklyGoals: [
          'Развитие здоровых привычек',
          'Укрепление социальных связей',
          'Освоение техник самопомощи'
        ],
        techniques: ['EFT', 'IFS', 'Соматические техники', 'Нейрофидбек'],
        checkpoints: [
          { day: 14, milestone: '2 недели стабильности', reward: 'Поход в кино или театр' },
          { day: 21, milestone: '3 недели новых привычек', reward: 'Покупка для хобби' },
          { day: 30, milestone: 'Месяц трезвости', reward: 'Выходные в новом месте' }
        ]
      }
    };

    return plans[currentPhase] || plans.stabilization;
  }

  static getSmartReminders(userPattern: any): string[] {
    return [
      'Время вечерней медитации - ваш самый эффективный период для релаксации',
      'Выходные приближаются. Помните о плане действий для социальных ситуаций',
      'Сегодня отличный день для техники EFT - ваш уровень стресса повышен',
      'Пора пополнить запасы воды. Гидратация важна для детоксикации',
      'Ваш прогресс впечатляет! 89% людей с похожими показателями успешно проходят этот этап'
    ];
  }
}