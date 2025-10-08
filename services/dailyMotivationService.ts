// Система ежедневных напоминаний и мотивационных сообщений

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface DailyReminder {
  id: string;
  type: 'motivation' | 'technique' | 'check_in' | 'milestone' | 'wellness' | 'social';
  title: string;
  body: string;
  scheduledTime: string; // HH:MM format
  frequency: 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[]; // 0-6, где 0 = воскресенье
  enabled: boolean;
  personalized: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
  actionButtons?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  title: string;
  action: string;
  icon?: string;
}

export interface MotivationalContent {
  id: string;
  type: 'quote' | 'affirmation' | 'reminder' | 'achievement' | 'tip' | 'story';
  content: string;
  author?: string;
  category: string;
  mood: 'uplifting' | 'calming' | 'energizing' | 'reflective' | 'encouraging';
  difficultyLevel: 'easy' | 'challenging' | 'inspiring';
  personalityMatch: string[]; // типы личности, которым подходит
}

export interface UserMotivationProfile {
  userId: string;
  preferredTimes: string[];
  motivationStyle: 'gentle' | 'direct' | 'inspirational' | 'practical';
  responseToReminders: 'high' | 'medium' | 'low';
  effectiveCategories: string[];
  skipDays: string[]; // дни недели для пропуска
  personalizedQuotes: string[];
  milestonePreferences: MilestonePreference[];
}

export interface MilestonePreference {
  type: string;
  frequency: number;
  celebrationStyle: 'quiet' | 'enthusiastic' | 'social';
}

export class DailyMotivationSystem {
  private reminders: Map<string, DailyReminder[]> = new Map();
  private motivationalLibrary: MotivationalContent[];
  private userProfiles: Map<string, UserMotivationProfile> = new Map();
  
  constructor() {
    this.motivationalLibrary = this.initializeMotivationalContent();
    this.setupNotificationHandlers();
  }

  // Инициализация системы уведомлений
  async initializeNotifications(): Promise<void> {
    // Запрашиваем разрешения
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
      return;
    }

    // Настраиваем категории уведомлений
    await this.setupNotificationCategories();
    
    // Настраиваем обработчики
    this.setupNotificationHandlers();
  }

  // Создание персонализированных напоминаний для пользователя
  async createPersonalizedReminders(userId: string, preferences?: any): Promise<void> {
    const userProfile = this.getUserProfile(userId);
    const baseReminders = this.getBaseReminderTemplates();
    
    const personalizedReminders = baseReminders.map(reminder => 
      this.personalizeReminder(reminder, userProfile, preferences)
    );

    // Добавляем специальные напоминания на основе прогресса
    const progressReminders = await this.generateProgressBasedReminders(userId);
    personalizedReminders.push(...progressReminders);

    // Сохраняем напоминания
    this.reminders.set(userId, personalizedReminders);
    
    // Планируем уведомления
    await this.scheduleAllReminders(userId, personalizedReminders);
  }

  // Базовые шаблоны напоминаний
  private getBaseReminderTemplates(): DailyReminder[] {
    return [
      {
        id: 'morning_motivation',
        type: 'motivation',
        title: '🌅 Доброе утро!',
        body: 'Новый день - новые возможности для роста и исцеления',
        scheduledTime: '08:00',
        frequency: 'daily',
        enabled: true,
        personalized: true,
        category: 'morning',
        priority: 'medium',
        actionButtons: [
          { id: 'set_intention', title: 'Поставить цель дня', action: 'open_goal_setting' },
          { id: 'morning_meditation', title: 'Утренняя медитация', action: 'start_meditation' }
        ]
      },
      {
        id: 'midday_checkin',
        type: 'check_in',
        title: '☀️ Как дела?',
        body: 'Время проверить, как вы себя чувствуете',
        scheduledTime: '13:00',
        frequency: 'daily',
        enabled: true,
        personalized: true,
        category: 'wellness',
        priority: 'low',
        actionButtons: [
          { id: 'mood_check', title: 'Отметить настроение', action: 'open_mood_tracker' },
          { id: 'quick_technique', title: 'Быстрая техника', action: 'suggest_technique' }
        ]
      },
      {
        id: 'evening_reflection',
        type: 'wellness',
        title: '🌙 Время размышлений',
        body: 'Что хорошего произошло сегодня?',
        scheduledTime: '21:00',
        frequency: 'daily',
        enabled: true,
        personalized: true,
        category: 'evening',
        priority: 'medium',
        actionButtons: [
          { id: 'gratitude_log', title: 'Записать благодарность', action: 'open_gratitude' },
          { id: 'day_reflection', title: 'Отразить день', action: 'open_reflection' }
        ]
      },
      {
        id: 'weekly_milestone',
        type: 'milestone',
        title: '🎉 Еженедельный прогресс',
        body: 'Время отметить ваши достижения за неделю!',
        scheduledTime: '19:00',
        frequency: 'weekly',
        enabled: true,
        personalized: true,
        category: 'achievement',
        priority: 'high'
      },
      {
        id: 'technique_reminder',
        type: 'technique',
        title: '🧘 Время для практики',
        body: 'Несколько минут практики могут изменить весь день',
        scheduledTime: '16:00',
        frequency: 'daily',
        enabled: true,
        personalized: true,
        category: 'practice',
        priority: 'medium'
      },
      {
        id: 'social_connection',
        type: 'social',
        title: '👥 Связь с близкими',
        body: 'Поддержка других людей важна для выздоровления',
        scheduledTime: '18:30',
        frequency: 'weekdays',
        enabled: false, // По умолчанию выключено
        personalized: true,
        category: 'social',
        priority: 'low'
      }
    ];
  }

  // Персонализация напоминания
  private personalizeReminder(
    reminder: DailyReminder, 
    profile: UserMotivationProfile,
    preferences?: any
  ): DailyReminder {
    const personalized = { ...reminder };
    
    // Адаптируем время на основе предпочтений пользователя
    if (profile.preferredTimes.length > 0) {
      const preferredTime = profile.preferredTimes.find(time => 
        Math.abs(this.timeToMinutes(time) - this.timeToMinutes(reminder.scheduledTime)) < 120
      );
      if (preferredTime) {
        personalized.scheduledTime = preferredTime;
      }
    }

    // Адаптируем стиль мотивации
    personalized.body = this.adaptMessageStyle(reminder.body, profile.motivationStyle);
    
    // Включаем/выключаем на основе эффективности
    if (profile.responseToReminders === 'low' && reminder.priority === 'low') {
      personalized.enabled = false;
    }

    return personalized;
  }

  // Генерация напоминаний на основе прогресса
  private async generateProgressBasedReminders(userId: string): Promise<DailyReminder[]> {
    const progressReminders: DailyReminder[] = [];
    
    // Здесь можно добавить логику для создания напоминаний на основе:
    // - Серии трезвых дней
    // - Пройденных техник
    // - Достигнутых целей
    // - Предстоящих сложных дат

    // Пример: напоминание о серии
    progressReminders.push({
      id: `streak_reminder_${userId}`,
      type: 'milestone',
      title: '🔥 Ваша серия растет!',
      body: 'Каждый день трезвости - это победа. Продолжайте!',
      scheduledTime: '20:00',
      frequency: 'weekly',
      enabled: true,
      personalized: true,
      category: 'achievement',
      priority: 'high'
    });

    return progressReminders;
  }

  // Планирование уведомлений
  private async scheduleAllReminders(userId: string, reminders: DailyReminder[]): Promise<void> {
    // Отменяем существующие уведомления для пользователя
    await this.cancelUserNotifications(userId);
    
    for (const reminder of reminders) {
      if (reminder.enabled) {
        await this.scheduleReminder(userId, reminder);
      }
    }
  }

  // Планирование отдельного напоминания
  private async scheduleReminder(userId: string, reminder: DailyReminder): Promise<void> {
    const notificationId = `${userId}_${reminder.id}`;
    
    try {
      const trigger = this.createNotificationTrigger(reminder);
      
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: reminder.title,
          body: this.getPersonalizedContent(userId, reminder),
          data: {
            userId,
            reminderId: reminder.id,
            type: reminder.type,
            category: reminder.category
          },
          categoryIdentifier: reminder.category,
          sound: 'default'
        },
        trigger
      });
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  }

  // Создание триггера уведомления
  private createNotificationTrigger(reminder: DailyReminder): any {
    const [hours, minutes] = reminder.scheduledTime.split(':').map(Number);
    
    switch (reminder.frequency) {
      case 'daily':
        return {
          hour: hours,
          minute: minutes,
          repeats: true
        };
      
      case 'weekly':
        return {
          weekday: 1, // Понедельник
          hour: hours,
          minute: minutes,
          repeats: true
        };
      
      case 'weekdays':
        // Планируем для каждого рабочего дня отдельно
        return {
          weekday: [2, 3, 4, 5, 6], // Вт-Сб (в iOS воскресенье = 1)
          hour: hours,
          minute: minutes,
          repeats: true
        };
      
      case 'weekends':
        return {
          weekday: [1, 7], // Вс, Сб
          hour: hours,
          minute: minutes,
          repeats: true
        };
      
      case 'custom':
        if (reminder.customDays) {
          return reminder.customDays.map(day => ({
            weekday: day + 1, // iOS использует 1-7
            hour: hours,
            minute: minutes,
            repeats: true
          }));
        }
        break;
    }
    
    return null;
  }

  // Получение персонализированного контента
  private getPersonalizedContent(userId: string, reminder: DailyReminder): string {
    if (!reminder.personalized) {
      return reminder.body;
    }

    const profile = this.getUserProfile(userId);
    
    // Выбираем мотивационный контент на основе профиля
    const relevantContent = this.motivationalLibrary.filter(content => 
      content.category === reminder.category || 
      profile.effectiveCategories.includes(content.category)
    );

    if (relevantContent.length > 0) {
      const selectedContent = relevantContent[Math.floor(Math.random() * relevantContent.length)];
      return this.adaptMessageStyle(selectedContent.content, profile.motivationStyle);
    }

    return reminder.body;
  }

  // Адаптация стиля сообщения
  private adaptMessageStyle(message: string, style: string): string {
    switch (style) {
      case 'gentle':
        return message.replace(/!/g, '.').replace(/\b(должны|нужно)\b/g, 'можете');
      
      case 'direct':
        return message + ' Сделайте это прямо сейчас.';
      
      case 'inspirational':
        return '✨ ' + message + ' Вы способны на великие дела!';
      
      case 'practical':
        return message + ' Это займет всего несколько минут.';
      
      default:
        return message;
    }
  }

  // Инициализация мотивационного контента
  private initializeMotivationalContent(): MotivationalContent[] {
    return [
      {
        id: 'quote_001',
        type: 'quote',
        content: 'Каждый день трезвости - это день, когда вы выбираете себя',
        category: 'morning',
        mood: 'uplifting',
        difficultyLevel: 'easy',
        personalityMatch: ['gentle', 'inspirational']
      },
      {
        id: 'affirmation_001',
        type: 'affirmation',
        content: 'Я достоин любви, здоровья и счастья',
        category: 'morning',
        mood: 'uplifting',
        difficultyLevel: 'easy',
        personalityMatch: ['gentle', 'inspirational']
      },
      {
        id: 'reminder_001',
        type: 'reminder',
        content: 'Помните: прогресс не всегда линеен, но каждый шаг имеет значение',
        category: 'evening',
        mood: 'encouraging',
        difficultyLevel: 'challenging',
        personalityMatch: ['direct', 'practical']
      },
      {
        id: 'tip_001',
        type: 'tip',
        content: 'Когда чувствуете тягу, попробуйте технику "Остановись-Подыши-Наблюдай-Продолжай"',
        category: 'practice',
        mood: 'practical',
        difficultyLevel: 'easy',
        personalityMatch: ['practical', 'direct']
      },
      {
        id: 'achievement_001',
        type: 'achievement',
        content: 'Вы уже прошли самую трудную часть - решили изменить свою жизнь',
        category: 'achievement',
        mood: 'encouraging',
        difficultyLevel: 'inspiring',
        personalityMatch: ['inspirational', 'gentle']
      },
      {
        id: 'story_001',
        type: 'story',
        content: 'Каждый рассвет напоминает нам: у нас есть еще один шанс начать заново',
        category: 'morning',
        mood: 'reflective',
        difficultyLevel: 'inspiring',
        personalityMatch: ['inspirational', 'gentle']
      }
    ];
  }

  // Настройка категорий уведомлений
  private async setupNotificationCategories(): Promise<void> {
    const categories = [
      {
        identifier: 'morning',
        actions: [
          { identifier: 'set_intention', title: 'Поставить цель' },
          { identifier: 'morning_meditation', title: 'Медитация' }
        ]
      },
      {
        identifier: 'wellness',
        actions: [
          { identifier: 'mood_check', title: 'Настроение' },
          { identifier: 'quick_technique', title: 'Техника' }
        ]
      },
      {
        identifier: 'evening',
        actions: [
          { identifier: 'gratitude_log', title: 'Благодарность' },
          { identifier: 'day_reflection', title: 'Размышления' }
        ]
      }
    ];

    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync(
        'morning',
        categories[0].actions.map(action => ({
          identifier: action.identifier,
          buttonTitle: action.title,
          options: { foreground: true }
        }))
      );
    }
  }

  // Настройка обработчиков уведомлений
  private setupNotificationHandlers(): void {
    // Обработчик нажатия на уведомление
    Notifications.addNotificationResponseReceivedListener(response => {
      const { userId, reminderId, type } = response.notification.request.content.data as any;
      this.handleNotificationResponse(userId, reminderId, type, response.actionIdentifier);
    });

    // Обработчик получения уведомления в активном приложении
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received while app is active:', notification);
    });
  }

  // Обработка ответов на уведомления
  private handleNotificationResponse(
    userId: string, 
    reminderId: string, 
    type: string, 
    actionId: string
  ): void {
    console.log('Notification response:', { userId, reminderId, type, actionId });
    
    // Здесь можно добавить логику для обработки различных действий
    switch (actionId) {
      case 'set_intention':
        // Открыть экран постановки целей
        break;
      case 'morning_meditation':
        // Запустить медитацию
        break;
      case 'mood_check':
        // Открыть трекер настроения
        break;
      // ... другие действия
    }

    // Записываем статистику взаимодействия
    this.recordNotificationInteraction(userId, reminderId, actionId);
  }

  // Запись статистики взаимодействий
  private recordNotificationInteraction(
    userId: string, 
    reminderId: string, 
    actionId: string
  ): void {
    // Здесь можно сохранять статистику для улучшения персонализации
    console.log('Recording interaction:', { userId, reminderId, actionId });
  }

  // Отмена уведомлений пользователя
  private async cancelUserNotifications(userId: string): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    const userNotifications = scheduledNotifications.filter(notification => 
      notification.identifier.startsWith(userId)
    );

    for (const notification of userNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  // Вспомогательные методы
  private getUserProfile(userId: string): UserMotivationProfile {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        preferredTimes: ['08:00', '13:00', '21:00'],
        motivationStyle: 'gentle',
        responseToReminders: 'medium',
        effectiveCategories: ['morning', 'evening'],
        skipDays: [],
        personalizedQuotes: [],
        milestonePreferences: [
          { type: 'daily', frequency: 1, celebrationStyle: 'quiet' },
          { type: 'weekly', frequency: 7, celebrationStyle: 'enthusiastic' }
        ]
      };
      this.userProfiles.set(userId, profile);
    }
    
    return profile;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Публичные методы для управления напоминаниями
  async updateReminderSettings(
    userId: string, 
    reminderId: string, 
    settings: Partial<DailyReminder>
  ): Promise<void> {
    const userReminders = this.reminders.get(userId);
    if (!userReminders) return;

    const reminderIndex = userReminders.findIndex(r => r.id === reminderId);
    if (reminderIndex === -1) return;

    // Обновляем настройки
    userReminders[reminderIndex] = { ...userReminders[reminderIndex], ...settings };
    
    // Перепланируем уведомления
    await this.scheduleAllReminders(userId, userReminders);
  }

  async getUserReminders(userId: string): Promise<DailyReminder[]> {
    return this.reminders.get(userId) || [];
  }

  async enableReminder(userId: string, reminderId: string): Promise<void> {
    await this.updateReminderSettings(userId, reminderId, { enabled: true });
  }

  async disableReminder(userId: string, reminderId: string): Promise<void> {
    await this.updateReminderSettings(userId, reminderId, { enabled: false });
  }
}

export default DailyMotivationSystem;