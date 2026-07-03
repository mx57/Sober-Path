// Система умных уведомлений с персонализацией
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface SmartNotification {
  id: string;
  type: 'motivation' | 'reminder' | 'intervention' | 'achievement' | 'wellness';
  title: string;
  body: string;
  data?: any;
  scheduledFor?: Date;
  priority: 'low' | 'normal' | 'high' | 'critical';
  category?: string;
}

export interface NotificationPreferences {
  motivationalQuotes: boolean;
  dailyCheckIns: boolean;
  achievementCelebrations: boolean;
  riskInterventions: boolean;
  wellnessTips: boolean;
  quietHours: { start: string; end: string };
  frequency: 'minimal' | 'normal' | 'frequent';
}

class SmartNotificationService {
  private preferences: NotificationPreferences = {
    motivationalQuotes: true,
    dailyCheckIns: true,
    achievementCelebrations: true,
    riskInterventions: true,
    wellnessTips: true,
    quietHours: { start: '22:00', end: '08:00' },
    frequency: 'normal'
  };

  async initialize() {
    // Настройка категорий уведомлений
    await Notifications.setNotificationCategoryAsync('motivation', [
      {
        identifier: 'read',
        buttonTitle: '📖 Читать',
        options: { isDestructive: false, isAuthenticationRequired: false }
      },
      {
        identifier: 'share',
        buttonTitle: '📤 Поделиться',
        options: { isDestructive: false, isAuthenticationRequired: false }
      }
    ]);

    await Notifications.setNotificationCategoryAsync('intervention', [
      {
        identifier: 'get_help',
        buttonTitle: '🆘 Получить помощь',
        options: { isDestructive: false, isAuthenticationRequired: false }
      },
      {
        identifier: 'im_ok',
        buttonTitle: '✅ Я в порядке',
        options: { isDestructive: false, isAuthenticationRequired: false }
      }
    ]);

    await Notifications.setNotificationCategoryAsync('achievement', [
      {
        identifier: 'celebrate',
        buttonTitle: '🎉 Отпраздновать',
        options: { isDestructive: false, isAuthenticationRequired: false }
      },
      {
        identifier: 'share_achievement',
        buttonTitle: '📱 Поделиться',
        options: { isDestructive: false, isAuthenticationRequired: false }
      }
    ]);

    // Настройка обработчика уведомлений
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  // Персонализированные мотивационные уведомления
  async scheduleMotivationalNotifications(userProfile: any, streakDays: number) {
    if (!this.preferences.motivationalQuotes) return;

    const motivationalMessages = this.getMotivationalMessages(streakDays);
    const optimalTimes = this.calculateOptimalNotificationTimes(userProfile);

    for (let i = 0; i < 3; i++) {
      const message = motivationalMessages[i % motivationalMessages.length];
      const scheduledTime = optimalTimes[i];

      await this.scheduleSmartNotification({
        id: `motivation-${Date.now()}-${i}`,
        type: 'motivation',
        title: message.title,
        body: message.body,
        scheduledFor: scheduledTime,
        priority: 'normal',
        category: 'motivation',
        data: { streakDays, messageType: 'motivation' }
      });
    }
  }

  // Умные интервенционные уведомления на основе анализа риска
  async scheduleRiskInterventions(riskAssessment: any) {
    if (!this.preferences.riskInterventions) return;

    const interventionMessages = this.getRiskInterventionMessages(riskAssessment.riskLevel);
    
    // Немедленное уведомление для высокого риска
    if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'critical') {
      await this.scheduleSmartNotification({
        id: `intervention-immediate-${Date.now()}`,
        type: 'intervention',
        title: interventionMessages.immediate.title,
        body: interventionMessages.immediate.body,
        scheduledFor: new Date(Date.now() + 1000), // через 1 секунду
        priority: 'critical',
        category: 'intervention',
        data: { riskLevel: riskAssessment.riskLevel, immediate: true }
      });
    }

    // Превентивные уведомления
    const preventiveTimes = this.calculatePreventiveNotificationTimes(riskAssessment);
    for (const time of preventiveTimes) {
      await this.scheduleSmartNotification({
        id: `intervention-preventive-${time.getTime()}`,
        type: 'intervention',
        title: interventionMessages.preventive.title,
        body: interventionMessages.preventive.body,
        scheduledFor: time,
        priority: 'high',
        category: 'intervention',
        data: { riskLevel: riskAssessment.riskLevel, preventive: true }
      });
    }
  }

  // Празднование достижений с анимированными уведомлениями
  async scheduleAchievementCelebration(achievement: any) {
    if (!this.preferences.achievementCelebrations) return;

    const celebrationMessage = this.getAchievementMessage(achievement);

    await this.scheduleSmartNotification({
      id: `achievement-${achievement.id}-${Date.now()}`,
      type: 'achievement',
      title: celebrationMessage.title,
      body: celebrationMessage.body,
      scheduledFor: new Date(Date.now() + 2000), // через 2 секунды
      priority: 'high',
      category: 'achievement',
      data: { 
        achievement,
        animation: 'celebration',
        confetti: true
      }
    });

    // Дополнительные поздравления через час
    await this.scheduleSmartNotification({
      id: `achievement-followup-${achievement.id}-${Date.now()}`,
      type: 'achievement',
      title: '🌟 Продолжаем праздновать!',
      body: `Ваше достижение "${achievement.name}" - это серьезный повод для гордости. Расскажите близким!`,
      scheduledFor: new Date(Date.now() + 3600000), // через час
      priority: 'normal',
      category: 'achievement'
    });
  }

  // Уведомления о благополучии с AI-инсайтами
  async scheduleWellnessNotifications(healthData: any, insights: any[]) {
    if (!this.preferences.wellnessTips) return;

    const wellnessMessages = this.getWellnessMessages(healthData, insights);
    const wellnessTimes = this.calculateWellnessNotificationTimes();

    for (let i = 0; i < wellnessMessages.length; i++) {
      const message = wellnessMessages[i];
      const scheduledTime = wellnessTimes[i % wellnessTimes.length];

      await this.scheduleSmartNotification({
        id: `wellness-${Date.now()}-${i}`,
        type: 'wellness',
        title: message.title,
        body: message.body,
        scheduledFor: scheduledTime,
        priority: 'low',
        data: { 
          healthData,
          insight: message.insight,
          actionable: message.actionable
        }
      });
    }
  }

  // Интеллектуальное планирование ежедневных check-in'ов
  async scheduleDailyCheckIns(userProfile: any) {
    if (!this.preferences.dailyCheckIns) return;

    const checkInTimes = this.calculateOptimalCheckInTimes(userProfile);
    const checkInMessages = this.getDailyCheckInMessages();

    for (let i = 0; i < 7; i++) { // планируем на неделю вперед
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const message = checkInMessages[i % checkInMessages.length];
      const timeSlot = checkInTimes[i % checkInTimes.length];
      
      date.setHours(timeSlot.hours, timeSlot.minutes, 0, 0);

      await this.scheduleSmartNotification({
        id: `daily-checkin-${date.toDateString()}`,
        type: 'reminder',
        title: message.title,
        body: message.body,
        scheduledFor: date,
        priority: 'normal',
        data: { 
          type: 'daily_checkin',
          day: i,
          suggestedActivities: message.activities
        }
      });
    }
  }

  private async scheduleSmartNotification(notification: SmartNotification) {
    // Проверка тихих часов
    if (notification.scheduledFor && this.isInQuietHours(notification.scheduledFor)) {
      // Перенести на утро, если не критическое уведомление
      if (notification.priority !== 'critical') {
        notification.scheduledFor = this.moveToMorning(notification.scheduledFor);
      }
    }

    const trigger: Notifications.NotificationTriggerInput = notification.scheduledFor
      ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notification.scheduledFor }
      : null;

    await Notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        categoryIdentifier: notification.category,
        priority: this.mapPriorityToSystem(notification.priority),
        sound: notification.priority === 'critical' ? 'default' : true,
        badge: notification.priority === 'critical' ? 1 : undefined
      },
      trigger
    });
  }

  private getMotivationalMessages(streakDays: number): any[] {
    const baseMessages = [
      {
        title: '💪 Сила внутри вас',
        body: 'Каждый день без алкоголя делает вас сильнее. Вы справляетесь!'
      },
      {
        title: '🌅 Новый день - новые возможности',
        body: 'Сегодня отличный день, чтобы продолжить свой путь к здоровой жизни.'
      },
      {
        title: '🎯 Фокус на цели',
        body: 'Помните, ради чего вы начали этот путь. Каждый день приближает к цели!'
      }
    ];

    if (streakDays >= 7) {
      baseMessages.push({
        title: '🔥 Неделя силы!',
        body: `${streakDays} дней подряд! Вы доказываете себе, что можете все.`
      });
    }

    if (streakDays >= 30) {
      baseMessages.push({
        title: '👑 Месяц побед!',
        body: `${streakDays} дней - это настоящее достижение! Вы изменили свою жизнь.`
      });
    }

    return baseMessages;
  }

  private getRiskInterventionMessages(riskLevel: string): any {
    const messages = {
      low: {
        preventive: {
          title: '🌱 Поддержка рядом',
          body: 'Помните: у вас есть сила справиться с любыми трудностями.'
        }
      },
      medium: {
        immediate: {
          title: '⚠️ Будьте внимательны',
          body: 'Сейчас важно быть осторожным. Используйте техники преодоления.'
        },
        preventive: {
          title: '🛡️ Защитите свой прогресс',
          body: 'Время применить стратегии, которые помогают справляться с трудностями.'
        }
      },
      high: {
        immediate: {
          title: '🚨 Внимание: высокий риск',
          body: 'Сейчас критически важно обратиться за поддержкой. Вы не одиноки!'
        },
        preventive: {
          title: '🆘 Экстренная поддержка',
          body: 'Активируйте план экстренных действий. Позвоните другу или наставнику.'
        }
      },
      critical: {
        immediate: {
          title: '🔴 СРОЧНО: Нужна помощь',
          body: 'Немедленно обратитесь за профессиональной помощью. Горячая линия: 8-800-200-02-00'
        },
        preventive: {
          title: '🆘 Кризисное вмешательство',
          body: 'Активирован режим экстренной поддержки. Помощь уже в пути.'
        }
      }
    };

    return messages[riskLevel as keyof typeof messages] || messages.medium;
  }

  private getAchievementMessage(achievement: any): any {
    const celebrationEmojis = ['🎉', '🏆', '⭐', '🎊', '💎', '👑'];
    const randomEmoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];

    return {
      title: `${randomEmoji} Поздравляем с достижением!`,
      body: `Вы достигли: "${achievement.name}"! Это заслуживает настоящего празднования.`
    };
  }

  private getWellnessMessages(healthData: any, insights: any[]): any[] {
    const messages = [];

    if (healthData.sleepQuality < 3) {
      messages.push({
        title: '😴 Сон и восстановление',
        body: 'Качественный сон - основа здорового восстановления. Попробуйте техники релаксации.',
        insight: 'sleep_improvement',
        actionable: true
      });
    }

    if (healthData.stressLevel > 3) {
      messages.push({
        title: '🧘 Управление стрессом',
        body: 'Высокий стресс может осложнить путь к трезвости. Уделите время дыхательным практикам.',
        insight: 'stress_management',
        actionable: true
      });
    }

    // Добавляем инсайты от ИИ
    for (const insight of insights.slice(0, 2)) {
      if (insight.type === 'recommendation') {
        messages.push({
          title: '🤖 ИИ-совет',
          body: insight.description,
          insight: insight.id,
          actionable: insight.actionableAdvice.length > 0
        });
      }
    }

    return messages;
  }

  private getDailyCheckInMessages(): any[] {
    return [
      {
        title: '🌅 Доброе утро!',
        body: 'Как дела? Отметьте свое настроение и получите персональные рекомендации.',
        activities: ['meditation', 'exercise', 'journaling']
      },
      {
        title: '☀️ Середина дня',
        body: 'Время проверить себя. Как проходит день? Поделитесь своими ощущениями.',
        activities: ['walk', 'breathing', 'social_connection']
      },
      {
        title: '🌙 Вечерняя рефлексия',
        body: 'Подведем итоги дня. Что прошло хорошо? О чем стоит подумать?',
        activities: ['reflection', 'gratitude', 'planning']
      }
    ];
  }

  private calculateOptimalNotificationTimes(userProfile: any): Date[] {
    const times = [];
    const now = new Date();

    // Утренняя мотивация (8:00)
    const morning = new Date(now);
    morning.setDate(morning.getDate() + 1);
    morning.setHours(8, 0, 0, 0);
    times.push(morning);

    // Дневная поддержка (14:00)
    const afternoon = new Date(morning);
    afternoon.setHours(14, 0, 0, 0);
    times.push(afternoon);

    // Вечерняя мотивация (19:00)
    const evening = new Date(morning);
    evening.setHours(19, 0, 0, 0);
    times.push(evening);

    return times;
  }

  private calculatePreventiveNotificationTimes(riskAssessment: any): Date[] {
    const times = [];
    const now = new Date();

    // Интервалы зависят от уровня риска
    const intervals = {
      low: [6, 12], // каждые 6-12 часов
      medium: [3, 6], // каждые 3-6 часов  
      high: [1, 2],   // каждые 1-2 часа
      critical: [0.5] // каждые 30 минут
    };

    const riskIntervals = intervals[riskAssessment.riskLevel as keyof typeof intervals] || intervals.medium;

    for (let i = 0; i < 24; i += riskIntervals[0]) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      if (!this.isInQuietHours(time)) {
        times.push(time);
      }
    }

    return times;
  }

  private calculateWellnessNotificationTimes(): Date[] {
    const times = [];
    const now = new Date();

    // Утренние советы по здоровью (9:00)
    const morning = new Date(now);
    morning.setDate(morning.getDate() + 1);
    morning.setHours(9, 0, 0, 0);
    times.push(morning);

    // Послеобеденные напоминания (16:00)
    const afternoon = new Date(morning);
    afternoon.setHours(16, 0, 0, 0);
    times.push(afternoon);

    return times;
  }

  private calculateOptimalCheckInTimes(userProfile: any): any[] {
    return [
      { hours: 8, minutes: 30 }, // утро
      { hours: 14, minutes: 0 }, // день
      { hours: 20, minutes: 30 }  // вечер
    ];
  }

  private isInQuietHours(date: Date): boolean {
    const hours = date.getHours();
    const startQuiet = parseInt(this.preferences.quietHours.start.split(':')[0]);
    const endQuiet = parseInt(this.preferences.quietHours.end.split(':')[0]);

    if (startQuiet > endQuiet) {
      // Тихие часы переходят через полночь
      return hours >= startQuiet || hours < endQuiet;
    } else {
      return hours >= startQuiet && hours < endQuiet;
    }
  }

  private moveToMorning(date: Date): Date {
    const morning = new Date(date);
    morning.setDate(morning.getDate() + 1);
    morning.setHours(8, 0, 0, 0);
    return morning;
  }

  private mapPriorityToSystem(priority: string): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'critical': return Notifications.AndroidNotificationPriority.MAX;
      case 'high': return Notifications.AndroidNotificationPriority.HIGH;
      case 'normal': return Notifications.AndroidNotificationPriority.DEFAULT;
      case 'low': return Notifications.AndroidNotificationPriority.LOW;
      default: return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  // Управление настройками уведомлений
  updatePreferences(newPreferences: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...newPreferences };
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Отмена всех запланированных уведомлений
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Отмена уведомлений по типу
  async cancelNotificationsByType(type: string) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled
      .filter(notification => notification.identifier.includes(type))
      .map(notification => notification.identifier);
    
    for (const id of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }
}

export const smartNotificationService = new SmartNotificationService();