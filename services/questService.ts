import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuestMilestone {
  id: string;
  day: number;
  title: string;
  description: string;
  reward: string;
  isCompleted: boolean;
  icon: string;
}

const QUEST_STORAGE_KEY = 'sober_path_quest_progress';

export const QUEST_MILESTONES: QuestMilestone[] = [
  { id: '1', day: 1, title: 'Первый шаг', description: 'Первый день новой жизни. Вы приняли важное решение.', reward: 'Медаль новичка', icon: 'flare', isCompleted: false },
  { id: '3', day: 3, title: 'Установка', description: 'Три дня чистоты и ясности. Организм начинает детоксикацию.', reward: 'Бонус концентрации', icon: 'opacity', isCompleted: false },
  { id: '7', day: 7, title: 'Неделя!', description: 'Семь дней — это серьезная победа над привычкой.', reward: 'Доступ к секретному уроку', icon: 'filter-hdr', isCompleted: false },
  { id: '14', day: 14, title: 'Две недели', description: 'Привычка начинает формироваться. Вы чувствуете себя лучше.', reward: 'Эксклюзивная тема оформления', icon: 'auto-awesome', isCompleted: false },
  { id: '21', day: 21, title: 'Три недели', description: 'Организм восстанавливается на клеточном уровне.', reward: 'Значок мастера дисциплины', icon: 'psychology', isCompleted: false },
  { id: '30', day: 30, title: 'Месяц Свободы', description: '30 дней — фундамент новой жизни заложен!', reward: 'Кубок Победителя', icon: 'emoji-events', isCompleted: false },
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
