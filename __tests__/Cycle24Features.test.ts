import { AICoachService } from '../services/AICoachService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase, getArticleById } from '../services/articlesDatabase';
import { CommunityService } from '../services/communityService';

describe('Cycle 24 Features Tests', () => {
  test('AI Coach triggers anxiety_management CBT exercise on anxiety keywords', async () => {
    const response = await AICoachService.getEnhancedResponse('user_test', 'У меня сильная тревога и паника', {
      userMood: 2,
      soberDays: 14,
      cravingLevel: 3,
      timeOfDay: 'afternoon'
    });

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data.exercise).toBeDefined();
      expect(response.data.exercise?.id).toBe('anxiety_management');
      expect(response.data.exercise?.name).toBe('Преодоление тревоги и паники');
      expect(response.data.exercise?.steps.length).toBeGreaterThanOrEqual(4);
    }
  });

  test('microCoursesDatabase contains anxiety_and_panic_control course', () => {
    const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
    expect(course).toBeDefined();
    expect(course?.title).toBe('Управление тревогой и паникой');
    expect(course?.lessons.length).toBe(3);
  });

  test('articlesDatabase contains new Cycle 24 articles (IDs 103-107)', () => {
    const article103 = getArticleById('article-103');
    const article107 = getArticleById('article-107');

    expect(article103).toBeDefined();
    expect(article103?.title).toBe('Нейробиология панических атак');

    expect(article107).toBeDefined();
    expect(article107?.title).toBe('Адаптогены и травяные практики при панике');
  });

  test('CommunityService support stickers award Karma points correctly', async () => {
    const stickers = CommunityService.getSupportStickers();
    expect(stickers.length).toBe(3);

    const initialKarma = await CommunityService.getUserKarma();
    const result = await CommunityService.sendSupportSticker('hug', 'Мария');
    expect(result).toBe(true);

    const updatedKarma = await CommunityService.getUserKarma();
    expect(updatedKarma).toBe(initialKarma + 15);
  });
});
