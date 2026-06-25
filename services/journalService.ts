
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Result, success, failure } from './types';
import { AICoachService } from './AICoachService';

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: number;
  tags: string[];
  aiAnalysis?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    dominantEmotions: string[];
    potentialTriggers: string[];
    advice: string;
  };
}

const STORAGE_KEY = '@journal_entries';

export class JournalService {
  static async getEntries(): Promise<Result<JournalEntry[]>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return success(data ? JSON.parse(data) : []);
    } catch (e) {
      return failure(e as Error);
    }
  }

  static async addEntry(content: string, mood: number): Promise<Result<JournalEntry>> {
    try {
      const entriesResult = await this.getEntries();
      if (!entriesResult.success) return entriesResult as any;
      const entries = entriesResult.data;

      const analysis = await this.analyzeEntry(content);

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content,
        mood,
        tags: analysis.dominantEmotions,
        aiAnalysis: analysis
      };

      const updatedEntries = [newEntry, ...entries];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));

      return success(newEntry);
    } catch (e) {
      return failure(e as Error);
    }
  }

  private static async analyzeEntry(content: string) {
    // В реальном приложении здесь был бы вызов LLM
    // Имитируем анализ на основе ключевых слов
    const lowerContent = content.toLowerCase();
    const emotions = [];
    const triggers = [];

    if (lowerContent.includes('груст') || lowerContent.includes('плохо')) emotions.push('грусть');
    if (lowerContent.includes('зл') || lowerContent.includes('бесит')) emotions.push('гнев');
    if (lowerContent.includes('рад') || lowerContent.includes('хорошо')) emotions.push('радость');
    if (lowerContent.includes('трево') || lowerContent.includes('страх')) emotions.push('тревога');

    if (lowerContent.includes('раб')) triggers.push('работа');
    if (lowerContent.includes('вечер')) triggers.push('вечернее время');
    if (lowerContent.includes('друз')) triggers.push('социальное давление');

    return {
      sentiment: emotions.includes('радость') ? 'positive' : emotions.length > 0 ? 'negative' : 'neutral' as any,
      dominantEmotions: emotions.length > 0 ? emotions : ['спокойствие'],
      potentialTriggers: triggers,
      advice: this.getAdviceForEmotions(emotions)
    };
  }

  private static getAdviceForEmotions(emotions: string[]): string {
    if (emotions.includes('гнев')) return 'Попробуйте технику глубокого дыхания 4-7-8, чтобы успокоиться.';
    if (emotions.includes('тревога')) return 'Используйте технику заземления 5-4-3-2-1 для возврата в настоящий момент.';
    if (emotions.includes('грусть')) return 'Не забывайте о самосострадании. Вы делаете большую работу.';
    return 'Продолжайте осознанно проживать каждый день. Вы на верном пути!';
  }

  static async deleteEntry(id: string): Promise<Result<void>> {
    try {
      const entriesResult = await this.getEntries();
      if (!entriesResult.success) return entriesResult as any;
      const updatedEntries = entriesResult.data.filter(e => e.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
      return success(undefined);
    } catch (e) {
      return failure(e as Error);
    }
  }
}
