import { AICoachService } from '../services/AICoachService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase, getArticleById } from '../services/articlesDatabase';
import { CommunityService } from '../services/communityService';

describe('Cycle 24 Features Unit Tests', () => {
  describe('AI Coach Anxiety & Panic Exercise Trigger', () => {
    it('should trigger anxiety_management exercise when anxiety or panic keywords are detected', async () => {
      const response = await AICoachService.getEnhancedResponse('test_user', 'У меня сильная тревожность и паника, помоги', {
        userMood: 2,
        soberDays: 14,
        cravingLevel: 3,
        timeOfDay: 'evening'
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.exercise).toBeDefined();
        expect(response.data.exercise?.id).toBe('anxiety_management');
        expect(response.data.exercise?.name).toBe('Преодоление тревоги и паники');
        expect(response.data.exercise?.steps.length).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe('Micro-Course: anxiety_and_panic_control', () => {
    it('should exist in microCoursesDatabase with 3 valid lessons', () => {
      const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Управление тревогой и паникой');
      expect(course?.lessons.length).toBe(3);
      expect(course?.points).toBe(150);
    });
  });

  describe('Specialized Articles (IDs 103-107)', () => {
    it('should contain all 5 newly added panic and anxiety articles', () => {
      const article103 = getArticleById('article-103');
      const article104 = getArticleById('article-104');
      const article105 = getArticleById('article-105');
      const article106 = getArticleById('article-106');
      const article107 = getArticleById('article-107');

      expect(article103?.title).toContain('Нейробиология панических атак');
      expect(article104?.title).toContain('Контроль гипервентиляции');
      expect(article105?.title).toContain('Соматическое заземление');
      expect(article106?.title).toContain('Шкала тревоги Бека');
      expect(article107?.title).toContain('SOS-протокол');
    });
  });

  describe('Community Panic Support Pulse', () => {
    it('should send panic support pulse and award +15 Karma points', async () => {
      const initialKarma = await CommunityService.getUserKarma();
      const buddy = CommunityService.getAvailableBuddies()[0];
      await CommunityService.selectBuddy(buddy);

      const success = await CommunityService.sendPanicSupportPulse('Паническая атака');
      expect(success).toBe(true);

      const updatedKarma = await CommunityService.getUserKarma();
      expect(updatedKarma).toBe(initialKarma + 15);

      const currentBuddy = await CommunityService.getSelectedBuddy();
      expect(currentBuddy?.status).toContain('Паническая атака');
    });
  });
});
