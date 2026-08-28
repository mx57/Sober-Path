import { AICoachService } from '../services/AICoachService';
import { CommunityService } from '../services/communityService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase, validateArticlesDatabase, getArticleById } from '../services/articlesDatabase';

describe('Cycle 24 Features Tests', () => {
  describe('AI Coach Anxiety Management Trigger', () => {
    it('triggers anxiety_management exercise when user mentions panic or strong anxiety', async () => {
      const response = await AICoachService.getEnhancedResponse('test_user', 'У меня сильная тревожность и паническая атака', {
        userMood: 2,
        soberDays: 15,
        cravingLevel: 3,
        timeOfDay: 'evening'
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.exercise).toBeDefined();
        expect(response.data.exercise?.id).toBe('anxiety_management');
        expect(response.data.exercise?.steps.length).toBe(4);
      }
    });
  });

  describe('Community Panic Support Pulse', () => {
    it('sends panic support pulse and awards karma', async () => {
      const result = await CommunityService.sendPanicSupportPulse('Сильная паника в транспорте');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Экстренный сигнал помощи отправлен');

      const karma = await CommunityService.getUserKarma();
      expect(karma).toBeGreaterThanOrEqual(15);
    });
  });

  describe('Micro Courses & Knowledge Base Validation', () => {
    it('includes the new anxiety_and_panic_control course with 3 lessons', () => {
      const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
      expect(course).toBeDefined();
      expect(course?.lessons.length).toBe(3);
    });

    it('validates articles database and includes articles 103-107', () => {
      const validation = validateArticlesDatabase();
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);

      const article103 = getArticleById('article-103');
      expect(article103).toBeDefined();
      expect(article103?.title).toBe('Нейробиология панической атаки в трезвости');

      const article107 = getArticleById('article-107');
      expect(article107).toBeDefined();
      expect(article107?.title).toBe('Соматическая терапия тревожных расстройств');
    });
  });
});
