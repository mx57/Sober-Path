import { getAllArticles, getArticleById } from '../services/articlesDatabase';
import { MicroCoursesService } from '../services/microCoursesService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { AICoachService } from '../services/AICoachService';
import { CommunityService } from '../services/communityService';

describe('Cycle 24 Features Tests', () => {
  describe('Content & Educational Materials', () => {
    test('micro-course anxiety_and_panic_control exists in microCoursesDatabase', () => {
      const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Управление тревогой и паникой');
      expect(course?.lessons.length).toBe(3);
    });

    test('micro-course anxiety_and_panic_control exists in MicroCoursesService with quiz', () => {
      const course = MicroCoursesService.getCourseById('anxiety_and_panic_control');
      expect(course).toBeDefined();
      expect(course?.category).toBe('psychology');
      expect(course?.quiz).toBeDefined();
      expect(course?.quiz?.length).toBeGreaterThan(0);
    });

    test('new articles 103 to 107 exist in articlesDatabase', () => {
      const allArticles = getAllArticles();
      const article103 = getArticleById('article-103');
      const article104 = getArticleById('article-104');
      const article105 = getArticleById('article-105');
      const article106 = getArticleById('article-106');
      const article107 = getArticleById('article-107');

      expect(allArticles.length).toBeGreaterThanOrEqual(107);
      expect(article103).toBeDefined();
      expect(article103?.title).toContain('Нейробиология панической атаки');
      expect(article104?.title).toContain('Соматическое заземление');
      expect(article105?.title).toContain('Преодоление токсичного стыда');
      expect(article106?.title).toContain('скрытые триггеры тревожности');
      expect(article107?.title).toContain('Техники когнитивной дефузии');
    });
  });

  describe('AI Coach Anxiety & Panic Exercise Trigger', () => {
    test('triggers anxiety_management exercise when user mentions panic keywords', async () => {
      const defaultContext = {
        userMood: 3,
        soberDays: 10,
        cravingLevel: 2,
        timeOfDay: 'afternoon' as const
      };
      const response = await AICoachService.getEnhancedResponse('user_24', 'У меня сильная паника и тревожность, помоги', defaultContext);
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.exercise).toBeDefined();
        expect(response.data.exercise?.id).toBe('anxiety_management');
        expect(response.data.exercise?.name).toBe('Преодоление тревоги и паники');
        expect(response.data.exercise?.steps.length).toBeGreaterThan(3);
      }
    });
  });

  describe('Community Support Stickers', () => {
    test('getSupportStickers returns list of stickers', () => {
      const stickers = CommunityService.getSupportStickers();
      expect(stickers.length).toBeGreaterThanOrEqual(4);
      expect(stickers[0]).toHaveProperty('id');
      expect(stickers[0]).toHaveProperty('name');
      expect(stickers[0]).toHaveProperty('karmaReward');
    });

    test('sendSupportSticker awards +15 Karma points', async () => {
      const initialKarma = await CommunityService.getUserKarma();
      const result = await CommunityService.sendSupportSticker('hug', 'Алексей');
      expect(result.success).toBe(true);
      expect(result.newKarma).toBe(initialKarma + 15);
    });
  });
});
