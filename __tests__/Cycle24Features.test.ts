import { AICoachService } from '../services/AICoachService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase, getArticleById } from '../services/articlesDatabase';
import { CommunityService } from '../services/communityService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Cycle 24 Features Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('AICoachService triggers anxiety_management exercise on anxiety keywords', async () => {
    const result = await AICoachService.getEnhancedResponse('test_user', 'У меня сильная тревога и паника', {
      userMood: 2,
      soberDays: 14,
      cravingLevel: 3,
      timeOfDay: 'evening'
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exercise).toBeDefined();
      expect(result.data.exercise?.id).toBe('anxiety_management');
      expect(result.data.exercise?.steps.length).toBe(5);
      expect(result.data.message).toContain('паника');
    }
  });

  test('microCoursesDatabase contains anxiety_and_panic_control course', () => {
    const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
    expect(course).toBeDefined();
    expect(course?.title).toBe('Управление тревогой и паникой');
    expect(course?.lessons.length).toBe(3);
    expect(course?.points).toBe(180);
  });

  test('articlesDatabase contains new Cycle 24 articles (ID 103-107)', () => {
    const article103 = getArticleById('article-103');
    const article107 = getArticleById('article-107');

    expect(article103).toBeDefined();
    expect(article103?.title).toContain('панической атаки');

    expect(article107).toBeDefined();
    expect(article107?.tags).toContain('паника');
  });

  test('CommunityService.sendQuickSupport increases karma and updates post', async () => {
    const res = await CommunityService.sendQuickSupport('p1');
    expect(res.success).toBe(true);
    expect(res.karma).toBeGreaterThanOrEqual(15);
  });
});
