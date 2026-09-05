import { AICoachService } from '../services/AICoachService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase, getArticleById } from '../services/articlesDatabase';
import { CommunityService } from '../services/communityService';

describe('Cycle 24 Features', () => {
  test('AICoachService triggers PNS Reset Vagus exercise upon VNS keywords', async () => {
    const res = await AICoachService.getEnhancedResponse('test_user', 'мне нужна перезагрузка ВНС и блуждающего нерва', {
      userMood: 2,
      soberDays: 14,
      cravingLevel: 3,
      timeOfDay: 'afternoon'
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.exercise).toBeDefined();
      expect(res.data.exercise?.id).toBe('pns_reset');
      expect(res.data.exercise?.name).toBe('Перезагрузка ВНС (Вагусный детокс)');
      expect(res.data.exercise?.steps.length).toBe(5);
    }
  });

  test('microCoursesDatabase includes anxiety_and_panic_control course', () => {
    const panicCourse = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
    expect(panicCourse).toBeDefined();
    expect(panicCourse?.title).toBe('Управление тревогой и паникой');
    expect(panicCourse?.lessons.length).toBe(3);
  });

  test('articlesDatabase includes Cycle 24 articles (IDs 103-107)', () => {
    const a103 = getArticleById('article-103');
    const a107 = getArticleById('article-107');

    expect(a103).toBeDefined();
    expect(a103?.title).toContain('Анатомия панической атаки');
    expect(a107).toBeDefined();
    expect(a107?.title).toContain('Восстановление парасимпатического тонуса');
  });

  test('CommunityService calculates Gratitude Leaderboard correctly', async () => {
    const leaderboard = await CommunityService.getGratitudeLeaderboard();
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBeGreaterThan(0);
    expect(leaderboard[0]).toHaveProperty('author');
    expect(leaderboard[0]).toHaveProperty('hearts');
    expect(leaderboard[0]).toHaveProperty('posts');
  });
});
