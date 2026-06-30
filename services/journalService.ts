import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JournalAIAnalysis {
  dominantEmotions: string[];
  potentialTriggers: string[];
  advice: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: number;
  tags?: string[];
  aiAnalysis?: JournalAIAnalysis;
}

const JOURNAL_STORAGE_KEY = 'sober_path_journal_entries';

const emotionKeywords: Record<string, string[]> = {
  'Тревога': ['тревог', 'беспокой', 'волну', 'страх', 'боюсь', 'паника'],
  'Радость': ['радост', 'счастл', 'отлично', 'хорошо', 'здорово', 'рад'],
  'Грусть': ['грустн', 'печаль', 'плохо', 'уныние', 'тоскл', 'одинок'],
  'Гнев': ['злость', 'зл', 'раздражен', 'бешен', 'ненависть', 'злюсь'],
  'Усталость': ['устал', 'измотан', 'нет сил', 'вымотан', 'сонн'],
  'Гордость': ['горжусь', 'гордость', 'справился', 'смог', 'получилось'],
  'Спокойствие': ['спокой', 'умиротвор', 'расслаб', 'тихо', 'мирно'],
};

const triggerKeywords: Record<string, string[]> = {
  'Стресс на работе': ['работа', 'начальник', 'коллег', 'дедлайн', 'офис'],
  'Социальное давление': ['друзья', 'компания', 'вечеринка', 'праздник', 'предложили'],
  'Одиночество': ['один', 'одинок', 'никого', 'пусто', 'изолир'],
  'Конфликт в семье': ['семья', 'жена', 'муж', 'дети', 'родители', 'поругался'],
  'Финансовый стресс': ['деньги', 'долги', 'финанс', 'зарплата', 'расходы'],
  'Скука': ['скучно', 'нечего делать', 'пусто', 'неинтересно'],
};

function analyzeEntry(content: string, mood: number): JournalAIAnalysis {
  const lower = content.toLowerCase();
  const dominantEmotions: string[] = [];
  const potentialTriggers: string[] = [];

  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    if (keywords.some(kw => lower.includes(kw))) {
      dominantEmotions.push(emotion);
    }
  });

  Object.entries(triggerKeywords).forEach(([trigger, keywords]) => {
    if (keywords.some(kw => lower.includes(kw))) {
      potentialTriggers.push(trigger);
    }
  });

  if (dominantEmotions.length === 0) {
    dominantEmotions.push(mood >= 4 ? 'Позитив' : mood <= 2 ? 'Дискомфорт' : 'Нейтральное');
  }

  const adviceMap: Record<string, string> = {
    'Тревога': 'Попробуйте технику квадратного дыхания: 4 секунды вдох, 4 задержка, 4 выдох. Это поможет успокоить нервную систему.',
    'Гнев': 'Интенсивная физическая нагрузка помогает переработать адреналин. Попробуйте быструю прогулку или отжимания.',
    'Грусть': 'Поделитесь своими чувствами с кем-то близким или в сообществе приложения. Вы не одни.',
    'Усталость': 'Проверьте себя по методу HALT: не голодны ли вы, не злитесь, не одиноки, не устали слишком сильно?',
    'Радость': 'Отличный момент! Запишите, что именно принесло вам радость — это поможет повторить этот опыт.',
    'Гордость': 'Вы заслуживаете этого момента! Поделитесь своим успехом в сообществе.',
  };

  let advice = 'Продолжайте вести дневник — это помогает отслеживать паттерны и укреплять осознанность.';
  const firstEmotion = dominantEmotions[0];
  if (firstEmotion && adviceMap[firstEmotion]) {
    advice = adviceMap[firstEmotion];
  }
  if (mood <= 2 && potentialTriggers.length > 0) {
    advice = `Обнаружен возможный триггер: ${potentialTriggers[0]}. ${advice}`;
  }

  return { dominantEmotions, potentialTriggers, advice };
}

export const JournalService = {
  async getEntries(): Promise<{ success: boolean; data: JournalEntry[] }> {
    try {
      const stored = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
      const entries: JournalEntry[] = stored ? JSON.parse(stored) : [];
      return { success: true, data: entries };
    } catch (e) {
      return { success: false, data: [] };
    }
  },

  async addEntry(content: string, mood: number): Promise<{ success: boolean; data: JournalEntry }> {
    try {
      const stored = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
      const entries: JournalEntry[] = stored ? JSON.parse(stored) : [];

      const aiAnalysis = analyzeEntry(content, mood);
      const newEntry: JournalEntry = {
        id: `j_${Date.now()}`,
        date: new Date().toISOString(),
        content,
        mood,
        tags: aiAnalysis.dominantEmotions,
        aiAnalysis,
      };

      const updated = [newEntry, ...entries];
      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
      return { success: true, data: newEntry };
    } catch (e) {
      return { success: false, data: { id: '', date: '', content, mood } };
    }
  },

  async deleteEntry(id: string): Promise<{ success: boolean }> {
    try {
      const stored = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
      const entries: JournalEntry[] = stored ? JSON.parse(stored) : [];
      const updated = entries.filter(e => e.id !== id);
      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  },
};
