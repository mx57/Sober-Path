import AsyncStorage from '@react-native-async-storage/async-storage';
import { Result, success, failure } from './types';

export interface QuestMilestone {
  id: string;
  day: number;
  title: string;
  description: string;
  rewardPoints: number;
  type: 'milestone' | 'challenge';
  completed: boolean;
  unlocked: boolean;
}

const QUEST_PROGRESS_KEY = 'sober_path_quest_progress';

export class QuestService {
  private static milestones: QuestMilestone[] = [
    {
      id: 'day_1',
      day: 1,
      title: 'Первый шаг',
      description: 'Продержитесь первые 24 часа. Это самый важный фундамент.',
      rewardPoints: 50,
      type: 'milestone',
      completed: false,
      unlocked: true,
    },
    {
      id: 'day_3',
      day: 3,
      title: 'Очищение',
      description: 'Организм начинает избавляться от токсинов. Вы можете чувствовать усталость, но это признак исцеления.',
      rewardPoints: 100,
      type: 'milestone',
      completed: false,
      unlocked: false,
    },
    {
      id: 'day_7',
      day: 7,
      title: 'Первая неделя',
      description: 'Вы победили первые семь дней. Уровень дофамина начинает стабилизироваться.',
      rewardPoints: 200,
      type: 'milestone',
      completed: false,
      unlocked: false,
    },
    {
      id: 'day_14',
      day: 14,
      title: 'Осознанность',
      description: 'Две недели свободы. Теперь важно научиться справляться с эмоциями без допинга.',
      rewardPoints: 300,
      type: 'milestone',
      completed: false,
      unlocked: false,
    },
    {
      id: 'day_21',
      day: 21,
      title: 'Новая привычка',
      description: 'Три недели. Формируются новые нейронные связи. Вы на финишной прямой к первому месяцу.',
      rewardPoints: 400,
      type: 'milestone',
      completed: false,
      unlocked: false,
    },
    {
      id: 'day_30',
      day: 30,
      title: 'Месяц триумфа',
      description: '30 дней чистоты. Вы доказали себе, что можете жить полноценной жизнью.',
      rewardPoints: 1000,
      type: 'milestone',
      completed: false,
      unlocked: false,
    },
  ];

  static async getQuestMap(currentSoberDays: number): Promise<QuestMilestone[]> {
    try {
      const storedProgress = await AsyncStorage.getItem(QUEST_PROGRESS_KEY);
      const completedIds = storedProgress ? JSON.parse(storedProgress) : [];

      return this.milestones.map(m => ({
        ...m,
        completed: completedIds.includes(m.id),
        unlocked: currentSoberDays >= m.day || m.day === 1,
      }));
    } catch (e) {
      console.error('Failed to load quest progress', e);
      return this.milestones;
    }
  }

  static async completeMilestone(milestoneId: string): Promise<Result<string[]>> {
    try {
      const storedProgress = await AsyncStorage.getItem(QUEST_PROGRESS_KEY);
      const completedIds: string[] = storedProgress ? JSON.parse(storedProgress) : [];

      if (!completedIds.includes(milestoneId)) {
        completedIds.push(milestoneId);
        await AsyncStorage.setItem(QUEST_PROGRESS_KEY, JSON.stringify(completedIds));
      }

      return success(completedIds);
    } catch (e) {
      return failure(e as Error);
    }
  }

  static getProgressPercentage(completedMilestones: QuestMilestone[]): number {
    const completedCount = completedMilestones.filter(m => m.completed).length;
    return Math.round((completedCount / this.milestones.length) * 100);
  }
}
