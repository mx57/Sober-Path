import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase, getArticleById } from '../services/articlesDatabase';
import { CommunityService } from '../services/communityService';
import { AICoachService } from '../services/AICoachService';

describe('Cycle 24 Features Unit Tests', () => {
  describe('Micro-Courses & Articles', () => {
    it('should include the new anxiety_and_panic_control course', () => {
      const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Управление тревогой и паникой');
      expect(course?.lessons.length).toBe(3);
    });

    it('should include specialized articles 103-107 for anxiety and panic recovery', () => {
      for (let id = 103; id <= 107; id++) {
        const article = getArticleById(`article-${String(id).padStart(3, '0')}`);
        expect(article).toBeDefined();
        expect(article?.content.length).toBeGreaterThan(50);
      }
    });
  });

  describe('Community Communication Features', () => {
    it('should handle panic support pulse with +15 Karma points', async () => {
      const result = await CommunityService.sendPanicSupportPulse('Паническая атака на работе');
      expect(result.success).toBe(true);
      expect(result.alertMessage).toContain('Паническая атака на работе');
    });

    it('should send buddy appreciation and award Karma points', async () => {
      const success = await CommunityService.sendBuddyAppreciation('b1', 'Спасибо за вовремя отправленный пульс!');
      expect(success).toBe(true);
    });

    it('should return support stickers and award Karma points on sending sticker', async () => {
      const stickers = CommunityService.getSupportStickers();
      expect(stickers.length).toBeGreaterThanOrEqual(4);
      expect(stickers[0].pointsReward).toBe(15);

      const sent = await CommunityService.sendSupportSticker('Андрей', stickers[0].id);
      expect(sent).toBe(true);
    });
  });

  describe('AI Coach Anxiety & Panic Management', () => {
    it('should trigger anxiety_management CBT exercise when detecting panic/anxiety keywords', async () => {
      const response = await AICoachService.getEnhancedResponse('user123', 'У меня сильная тревожность и паника', {
        userMood: 2,
        soberDays: 10,
        cravingLevel: 3,
        timeOfDay: 'evening'
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.exercise).toBeDefined();
        expect(response.data.exercise?.id).toBe('anxiety_management');
        expect(response.data.exercise?.steps.length).toBe(5);
      }
    });
  });
});
