import { AICoachService } from '../services/AICoachService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { CommunityService } from '../services/communityService';
import { articlesDatabase } from '../services/articlesDatabase';

describe('Cycle 23 Features Integration Tests', () => {
  it('should trigger letter_to_craving exercise in AI Coach', async () => {
    const response = await AICoachService.getEnhancedResponse('test_user_c23', 'Я хочу написать письмо тяге', {
      userMood: 3,
      soberDays: 15,
      cravingLevel: 3,
      timeOfDay: 'evening'
    });

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data.exercise).toBeDefined();
      expect(response.data.exercise?.id).toBe('letter_to_craving');
      expect(response.data.exercise?.steps.length).toBeGreaterThan(3);
    }
  });

  it('should trigger halt_analysis exercise in AI Coach', async () => {
    const response = await AICoachService.getEnhancedResponse('test_user_c23', 'Сделай мне halt анализ', {
      userMood: 2,
      soberDays: 5,
      cravingLevel: 4,
      timeOfDay: 'afternoon'
    });

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data.exercise).toBeDefined();
      expect(response.data.exercise?.id).toBe('halt_analysis');
      expect(response.data.exercise?.steps.length).toBe(4);
    }
  });

  it('should contain the new sleep_and_biorhythms micro-course', () => {
    const course = microCoursesDatabase.find(c => c.id === 'sleep_and_biorhythms');
    expect(course).toBeDefined();
    expect(course?.title).toBe('Восстановление сна и биоритмов');
    expect(course?.lessons.length).toBe(3);
  });

  it('should contain articles for sleep hygiene and melatonin', () => {
    const articles = articlesDatabase.filter(a => a.tags.includes('сон') || a.tags.includes('мелатонин'));
    expect(articles.length).toBeGreaterThanOrEqual(4);
  });

  it('should calculate user gratitude statistics correctly', async () => {
    const stats = await CommunityService.getUserGratitudeStats('Анна К.');
    expect(stats).toBeDefined();
    expect(typeof stats.totalPosts).toBe('number');
    expect(typeof stats.totalHearts).toBe('number');
  });
});
