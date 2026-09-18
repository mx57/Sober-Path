import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase, getArticleById } from '../services/articlesDatabase';
import { AICoachService } from '../services/AICoachService';
import { CommunityService } from '../services/communityService';

describe('Cycle 24 Features and Enhancements', () => {
  test('New micro-course anxiety_and_panic_control exists and is structured properly', () => {
    const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
    expect(course).toBeDefined();
    expect(course?.title).toBe('Управление тревогой и паникой');
    expect(course?.lessons.length).toBe(3);
    expect(course?.lessons[0].title).toBe('Нейробиология паники');
  });

  test('New specialized articles 103-107 are present in articlesDatabase', () => {
    const article103 = getArticleById('article-103');
    expect(article103).toBeDefined();
    expect(article103?.title).toBe('Анатомия панической атаки: что происходит с телом');

    const article107 = getArticleById('article-107');
    expect(article107).toBeDefined();
    expect(article107?.title).toBe('Профилактика фоновой тревожности: дневные якори');
  });

  test('AICoachService offers anxiety_management exercise on panic keywords', async () => {
    const responseResult = await AICoachService.getEnhancedResponse('test_user_c24', 'У меня паническая атака и сильная тревога', {
      userMood: 1,
      soberDays: 10,
      cravingLevel: 3,
      timeOfDay: 'evening'
    });

    expect(responseResult.success).toBe(true);
    if (responseResult.success) {
      const resp = responseResult.data;
      expect(resp.exercise).toBeDefined();
      expect(resp.exercise?.id).toBe('anxiety_management');
      expect(resp.exercise?.name).toBe('Преодоление тревоги и паники');
      expect(resp.exercise?.steps.length).toBe(5);
    }
  });

  test('CommunityService getGratitudeLeaderboard calculates top contributors correctly', async () => {
    const leaderboard = await CommunityService.getGratitudeLeaderboard();
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBeGreaterThan(0);
    // Leaderboard should be sorted descending by totalHearts
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].totalHearts).toBeGreaterThanOrEqual(leaderboard[i + 1].totalHearts);
    }
  });
});
