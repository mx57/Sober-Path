import { AICoachService } from '../services/AICoachService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase, getArticleById } from '../services/articlesDatabase';
import { CommunityService } from '../services/communityService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Cycle 24 Features Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('AICoachService triggers anxiety_management CBT exercise on anxiety keywords', async () => {
    const res = await AICoachService.getEnhancedResponse('u1', 'меня накрыла сильнейшая паническая атака и тревога', {
      userMood: 1,
      soberDays: 10,
      cravingLevel: 3,
      timeOfDay: 'evening'
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.exercise).toBeDefined();
      expect(res.data.exercise?.id).toBe('anxiety_management');
      expect(res.data.exercise?.name).toBe('Преодоление тревоги и паники');
      expect(res.data.exercise?.steps.length).toBeGreaterThan(0);
    }
  });

  test('microCoursesDatabase contains anxiety_and_panic_control course', () => {
    const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
    expect(course).toBeDefined();
    expect(course?.title).toBe('Управление тревогой и паникой');
    expect(course?.lessons.length).toBe(3);
  });

  test('articlesDatabase contains new articles IDs 103 to 107', () => {
    for (let i = 103; i <= 107; i++) {
      const artId = `article-${String(i).padStart(3, '0')}`;
      const article = getArticleById(artId);
      expect(article).toBeDefined();
      expect(article?.title.length).toBeGreaterThan(0);
    }
  });

  test('CommunityService.sendBuddyAppreciation awards karma and updates buddy status', async () => {
    const buddy = {
      id: 'b1',
      name: 'Андрей',
      daysSober: 45,
      avatar: 'avatar.png',
      status: 'Держусь уверенно'
    };
    await CommunityService.selectBuddy(buddy);

    const result = await CommunityService.sendBuddyAppreciation('Спасибо за твою тёплую поддержку!');
    expect(result).toBe(true);

    const karma = await CommunityService.getUserKarma();
    expect(karma).toBe(10);

    const updatedBuddy = await CommunityService.getSelectedBuddy();
    expect(updatedBuddy?.status).toContain('Получил благодарность');
  });
});
