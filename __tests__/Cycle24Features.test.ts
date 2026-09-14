import { AICoachService } from '../services/AICoachService';
import { CommunityService } from '../services/communityService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { getArticleById } from '../services/articlesDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Cycle 24 Features Unit Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('Micro-course "Управление тревогой и паникой" is registered in database', () => {
    const course = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
    expect(course).toBeDefined();
    expect(course?.title).toBe('Управление тревогой и паникой');
    expect(course?.lessons.length).toBe(3);
  });

  test('New articles 103-107 are retrieved correctly from database', () => {
    const article103 = getArticleById('article-103');
    const article107 = getArticleById('article-107');

    expect(article103).toBeDefined();
    expect(article103?.title).toContain('Природа панической атаки');

    expect(article107).toBeDefined();
    expect(article107?.title).toContain('Резильентность');
  });

  test('AICoachService triggers anxiety_management CBT exercise on panic keywords', async () => {
    const responseResult = await AICoachService.getEnhancedResponse('test_user', 'У меня сильная тревожность и паника', {
      userMood: 2,
      soberDays: 14,
      cravingLevel: 3,
      timeOfDay: 'afternoon'
    });

    expect(responseResult.success).toBe(true);
    if (responseResult.success) {
      expect(responseResult.data.exercise).toBeDefined();
      expect(responseResult.data.exercise?.id).toBe('anxiety_management');
      expect(responseResult.data.exercise?.name).toBe('Преодоление тревоги и паники');
      expect(responseResult.data.exercise?.steps.length).toBeGreaterThanOrEqual(4);
    }
  });

  test('CommunityService handles sendPanicSupportPulse and rewards Karma', async () => {
    const initialKarma = await CommunityService.getUserKarma();
    const sent = await CommunityService.sendPanicSupportPulse('Сильный страх и тревога');

    expect(sent).toBe(true);
    const updatedKarma = await CommunityService.getUserKarma();
    expect(updatedKarma).toBe(initialKarma + 15);
  });

  test('CommunityService calculates getGratitudeLeaderboard correctly', async () => {
    await CommunityService.saveGratitude('Благодарен за спокойствие', 'Алексей К.', 45);
    await CommunityService.saveGratitude('Благодарен за поддержку в группе', 'Алексей К.', 45);

    const leaderboard = await CommunityService.getGratitudeLeaderboard();
    expect(leaderboard.length).toBeGreaterThan(0);

    const topAuthor = leaderboard.find(item => item.author === 'Алексей К.');
    expect(topAuthor).toBeDefined();
    expect(topAuthor?.totalPosts).toBe(2);
  });
});
