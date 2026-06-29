import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Настройки уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationTrigger {
  type: 'daily' | 'weekly' | 'interval';
  hour?: number; // 0-23
  minute?: number; // 0-59
  weekday?: number; // 1-7 (Monday = 1)
  seconds?: number; // для interval
}

export interface RecoveryNotification {
  id: string;
  title: string;
  body: string;
  trigger: NotificationTrigger;
  category: 'motivation' | 'reminder' | 'emergency' | 'celebration' | 'exercise';
  enabled: boolean;
}

const defaultNotifications: RecoveryNotification[] = [
  // Ежедневные мотивационные уведомления
  {
    id: 'morning-motivation',
    title: '🌅 Доброе утро!',
    body: 'Новый день - новая возможность оставаться сильным. Вы можете это сделать!',
    trigger: { type: 'daily', hour: 9, minute: 0 },
    category: 'motivation',
    enabled: true
  },
  {
    id: 'evening-reflection',
    title: '🌙 Время размышлений',
    body: 'Как прошел день? Отметьте свой прогресс и поблагодарите себя за усилия.',
    trigger: { type: 'daily', hour: 21, minute: 0 },
    category: 'reminder',
    enabled: true
  },
  
  // Напоминания о упражнениях
  {
    id: 'midday-exercise',
    title: '🧘‍♂️ Время для себя',
    body: 'Сделайте короткую дыхательную практику или НЛП упражнение.',
    trigger: { type: 'daily', hour: 14, minute: 30 },
    category: 'exercise',
    enabled: true
  },
  
  // Еженедельные проверки
  {
    id: 'weekly-progress',
    title: '📊 Еженедельный прогресс',
    body: 'Время проанализировать свои достижения за неделю!',
    trigger: { type: 'weekly', weekday: 7, hour: 18, minute: 0 },
    category: 'reminder',
    enabled: true
  },
  
  // Мотивационные сообщения в сложное время
  {
    id: 'tough-moment-1',
    title: '💪 Вы сильнее, чем думаете',
    body: 'Каждое "нет" алкоголю делает вас сильнее. Дышите глубоко.',
    trigger: { type: 'daily', hour: 17, minute: 0 }, // Часто сложное время
    category: 'motivation',
    enabled: true
  },
  {
    id: 'tough-moment-2',
    title: '🎯 Помните свои цели',
    body: 'Визуализируйте свою жизнь без алкоголя. Как вы себя чувствуете?',
    trigger: { type: 'daily', hour: 19, minute: 30 },
    category: 'motivation',
    enabled: true
  },
  
  // Праздничные уведомления
  {
    id: 'milestone-reminder',
    title: '🎉 Время праздновать!',
    body: 'Проверьте свои достижения - возможно, пора отметить очередную веху!',
    trigger: { type: 'weekly', weekday: 5, hour: 20, minute: 0 },
    category: 'celebration',
    enabled: true
  },
  
  // Техники преодоления тяги
  {
    id: 'craving-help',
    title: '🆘 Справляемся с тягой',
    body: 'Помните: тяга как волна - она обязательно спадет. Попробуйте технику "серфинг по тяге".',
    trigger: { type: 'daily', hour: 22, minute: 0 }, // Вечернее время
    category: 'emergency',
    enabled: false // По умолчанию выключено, включается при необходимости
  }
];

// Дополнительные мотивационные сообщения
const motivationalMessages = [
  {
    title: '🌟 Каждый день имеет значение',
    body: 'Сегодня вы выбираете здоровье. Гордитесь своим решением!'
  },
  {
    title: '🔥 Внутренняя сила',
    body: 'В вас есть вся сила, необходимая для преодоления любых трудностей.'
  },
  {
    title: '🎯 Фокус на цели',
    body: 'Представьте себя через год - здоровым, счастливым и свободным.'
  },
  {
    title: '💎 Вы - драгоценность',
    body: 'Каждый трезвый день добавляет блеск в бриллиант вашей жизни.'
  },
  {
    title: '🌈 После бури всегда радуга',
    body: 'Сложные моменты временны. Ваша сила - постоянна.'
  }
];

class NotificationService {
  private static instance: NotificationService;
  private notifications: RecoveryNotification[] = defaultNotifications;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Запрос разрешений
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Web notifications handled differently
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  // Загрузка настроек уведомлений
  async loadNotificationSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notification_settings');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  // Сохранение настроек
  async saveNotificationSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  // Планирование всех уведомлений
  async scheduleAllNotifications(): Promise<void> {
    await this.cancelAllNotifications();
    
    for (const notification of this.notifications) {
      if (notification.enabled) {
        await this.scheduleNotification(notification);
      }
    }
  }

  // Планирование конкретного уведомления
  private async scheduleNotification(notification: RecoveryNotification): Promise<void> {
    if (Platform.OS === 'web') {
      return; // Skip for web platform
    }

    const trigger = this.createTrigger(notification.trigger);
    
    await Notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: {
        title: notification.title,
        body: notification.body,
        categoryIdentifier: notification.category,
        sound: 'default'
      },
      trigger
    });
  }

  // Создание триггера для уведомления
  private createTrigger(trigger: NotificationTrigger) {
    switch (trigger.type) {
      case 'daily':
        return {
          hour: trigger.hour || 9,
          minute: trigger.minute || 0,
          repeats: true
        };
      
      case 'weekly':
        return {
          weekday: trigger.weekday || 1,
          hour: trigger.hour || 9,
          minute: trigger.minute || 0,
          repeats: true
        };
      
      case 'interval':
        return {
          seconds: trigger.seconds || 3600,
          repeats: true
        };
      
      default:
        return {
          hour: 9,
          minute: 0,
          repeats: true
        };
    }
  }

  // Отмена всех уведомлений
  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  // Включение/выключение уведомления
  async toggleNotification(notificationId: string, enabled: boolean): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.enabled = enabled;
      await this.saveNotificationSettings();
      
      if (enabled) {
        await this.scheduleNotification(notification);
      } else {
        await this.cancelNotification(notificationId);
      }
    }
  }

  // Отмена конкретного уведомления
  async cancelNotification(notificationId: string): Promise<void> {
    if (Platform.OS !== 'web') {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  }

  // Отправка экстренного уведомления
  async sendEmergencyNotification(message?: string): Promise<void> {
    const randomMotivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    const notification = {
      title: message ? '🆘 Поддержка рядом' : randomMotivation.title,
      body: message || randomMotivation.body,
      categoryIdentifier: 'emergency',
      sound: 'default'
    };

    if (Platform.OS === 'web') {
      // Web notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/favicon.ico'
        });
      }
    } else {
      await Notifications.scheduleNotificationAsync({
        content: notification,
        trigger: null // Немедленно
      });
    }
  }

  // Отправка уведомления о достижении
  async sendAchievementNotification(title: string, description: string): Promise<void> {
    const notification = {
      title: `🏆 ${title}`,
      body: description,
      categoryIdentifier: 'celebration',
      sound: 'default'
    };

    if (Platform.OS === 'web') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/favicon.ico'
        });
      }
    } else {
      await Notifications.scheduleNotificationAsync({
        content: notification,
        trigger: null
      });
    }
  }

  // Планирование уведомления с задержкой (в секундах)
  async scheduleDelayedNotification(title: string, body: string, seconds: number): Promise<void> {
    if (Platform.OS === 'web') {
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body });
        }
      }, seconds * 1000);
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: {
        seconds,
        repeats: false
      },
    });
  }

  // Получение всех уведомлений
  getNotifications(): RecoveryNotification[] {
    return this.notifications;
  }

  // Обновление уведомления
  async updateNotification(notificationId: string, updates: Partial<RecoveryNotification>): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      Object.assign(notification, updates);
      await this.saveNotificationSettings();
      
      if (notification.enabled) {
        await this.cancelNotification(notificationId);
        await this.scheduleNotification(notification);
      }
    }
  }

  // Добавление кастомного уведомления
  async addCustomNotification(notification: Omit<RecoveryNotification, 'id'>): Promise<void> {
    const id = `custom_${Date.now()}`;
    const newNotification: RecoveryNotification = {
      ...notification,
      id
    };
    
    this.notifications.push(newNotification);
    await this.saveNotificationSettings();
    
    if (newNotification.enabled) {
      await this.scheduleNotification(newNotification);
    }
  }

  // Удаление уведомления
  async removeNotification(notificationId: string): Promise<void> {
    await this.cancelNotification(notificationId);
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    await this.saveNotificationSettings();
  }

  // Инициализация сервиса
  async initialize(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (hasPermission) {
      await this.loadNotificationSettings();
      await this.scheduleAllNotifications();
    }
  }

  // Web push notifications setup
  async setupWebNotifications(): Promise<void> {
    if (Platform.OS === 'web' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }

  // Уведомление о времени приема лекарств/витаминов (если применимо)
  async scheduleMedicationReminder(time: { hour: number; minute: number }): Promise<void> {
    const notification: RecoveryNotification = {
      id: 'medication_reminder',
      title: '💊 Напоминание о приеме',
      body: 'Время принять витамины или лекарства для поддержки восстановления.',
      trigger: { type: 'daily', hour: time.hour, minute: time.minute },
      category: 'reminder',
      enabled: true
    };

    const existingIndex = this.notifications.findIndex(n => n.id === 'medication_reminder');
    if (existingIndex >= 0) {
      this.notifications[existingIndex] = notification;
    } else {
      this.notifications.push(notification);
    }

    await this.saveNotificationSettings();
    await this.scheduleNotification(notification);
  }

  // Адаптивные уведомления на основе прогресса
  async scheduleAdaptiveNotifications(soberDays: number): Promise<void> {
    // Разные сообщения в зависимости от периода трезвости
    let adaptiveNotification: RecoveryNotification;

    if (soberDays < 7) {
      adaptiveNotification = {
        id: 'adaptive_early',
        title: '🌱 Первые шаги',
        body: 'Каждый час трезвости - это победа. Вы на правильном пути!',
        trigger: { type: 'daily', hour: 16, minute: 0 },
        category: 'motivation',
        enabled: true
      };
    } else if (soberDays < 30) {
      adaptiveNotification = {
        id: 'adaptive_building',
        title: '💪 Набираем силу',
        body: 'Ваше тело восстанавливается, разум проясняется. Продолжайте!',
        trigger: { type: 'daily', hour: 16, minute: 0 },
        category: 'motivation',
        enabled: true
      };
    } else if (soberDays < 90) {
      adaptiveNotification = {
        id: 'adaptive_strengthening',
        title: '🏋️‍♂️ Укрепляемся',
        body: 'Привычки меняются, жизнь улучшается. Вы создаете новую версию себя!',
        trigger: { type: 'daily', hour: 16, minute: 0 },
        category: 'motivation',
        enabled: true
      };
    } else {
      adaptiveNotification = {
        id: 'adaptive_mastery',
        title: '👑 Мастерство',
        body: 'Вы - пример силы и решимости. Ваш опыт вдохновляет других!',
        trigger: { type: 'daily', hour: 16, minute: 0 },
        category: 'motivation',
        enabled: true
      };
    }

    // Обновляем или добавляем адаптивное уведомление
    const existingIndex = this.notifications.findIndex(n => n.id.startsWith('adaptive_'));
    
    if (existingIndex >= 0) {
      // Отменяем старое
      await this.cancelNotification(this.notifications[existingIndex].id);
      this.notifications[existingIndex] = adaptiveNotification;
    } else {
      this.notifications.push(adaptiveNotification);
    }

    await this.saveNotificationSettings();
    await this.scheduleNotification(adaptiveNotification);
  }
}

export default NotificationService.getInstance();