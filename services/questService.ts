import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuestMilestone {
  id: string;
  day: number;
  title: string;
  description: string;
  reward: string;
  isCompleted: boolean;
}

const QUEST_STORAGE_KEY = 'sober_path_quest_progress';

export const QUEST_MILESTONES: QuestMilestone[] = [
  { id: '1', day: 1, title: 'Первый шаг', description: 'Первый день новой жизни', reward: 'Медаль новичка', isCompleted: false },
  { id: '3', day: 3, title: 'Установка', description: 'Три дня чистоты и ясности', reward: 'Бонус концентрации', isCompleted: false },
  { id: '7', day: 7, title: 'Неделя!', description: 'Семь дней — это серьезная победа', reward: 'Доступ к секретному уроку', isCompleted: false },
  { id: '14', day: 14, title: 'Две недели', description: 'Привычка начинает формироваться', reward: 'Эксклюзивная тема оформления', isCompleted: false },
  { id: '21', day: 21, title: 'Три недели', description: 'Организм восстанавливается', reward: 'Значок мастера дисциплины', isCompleted: false },
  { id: '30', day: 30, title: 'Месяц Свободы', description: '30 дней — фундамент заложен!', reward: 'Кубок Победителя', isCompleted: false },
];

class QuestService {
  async getQuestProgress(): Promise<QuestMilestone[]> {
    try {
      const saved = await AsyncStorage.getItem(QUEST_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return QUEST_MILESTONES;
    } catch (e) {
      console.error('Failed to load quest progress', e);
      return QUEST_MILESTONES;
    }
  }

  async updateQuestProgress(soberDays: number): Promise<QuestMilestone[]> {
    const milestones = await this.getQuestProgress();
    const updated = milestones.map(m => ({
      ...m,
      isCompleted: soberDays >= m.day
    }));
    await AsyncStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  async getCurrentQuestLevel(soberDays: number): Promise<number> {
    const milestones = await this.getQuestProgress();
    const lastCompleted = [...milestones].reverse().find(m => soberDays >= m.day);
    return lastCompleted ? milestones.indexOf(lastCompleted) + 1 : 0;
  }
}

export default new QuestService();
