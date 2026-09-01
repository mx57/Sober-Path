import { AICoachService } from '../services/AICoachService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase, validateArticlesDatabase, getArticleById } from '../services/articlesDatabase';

describe('Cycle 24 Features Tests', () => {
  describe('AI Coach Anxiety & Panic Management Exercise', () => {
    it('triggers anxiety_management exercise when keywords like "паника" or "тревожность" are sent', async () => {
      const result = await AICoachService.getEnhancedResponse('test-user', 'У меня сильная паника и тревожность!', {
        userMood: 2,
        soberDays: 14,
        cravingLevel: 3,
        timeOfDay: 'afternoon'
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exercise).toBeDefined();
        expect(result.data.exercise?.id).toBe('anxiety_management');
        expect(result.data.exercise?.name).toBe('Преодоление тревоги и паники');
        expect(result.data.exercise?.steps.length).toBe(5);
      }
    });
  });

  describe('Micro-course Database Cycle 24', () => {
    it('contains the anxiety_and_panic_control course with 3 lessons', () => {
      const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Управление тревогой и паникой');
      expect(course?.lessons.length).toBe(3);
    });
  });

  describe('Articles Database Cycle 24', () => {
    it('passes database validation with 107 total articles', () => {
      const validation = validateArticlesDatabase();
      expect(validation.isValid).toBe(true);
      expect(articlesDatabase.length).toBeGreaterThanOrEqual(107);
    });

    it('retrieves newly added articles 103 through 107', () => {
      const art103 = getArticleById('article-103');
      const art107 = getArticleById('article-107');

      expect(art103).toBeDefined();
      expect(art103?.title).toContain('Анатомия панической атаки');
      expect(art107).toBeDefined();
      expect(art107?.title).toContain('Профилактика ночной тревожности');
    });
  });
});
