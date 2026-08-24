import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { articlesDatabase } from '../services/articlesDatabase';
import { AICoachService } from '../services/AICoachService';
import { CommunityService } from '../services/communityService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Cycle 24 New Features Test Suite', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('microCoursesDatabase contains new Anxiety and Panic control course', () => {
    const anxietyCourse = microCoursesDatabase.find(c => c.id === 'anxiety_and_panic_control');
    expect(anxietyCourse).toBeDefined();
    expect(anxietyCourse?.title).toBe('Управление треводгой и паникой'.replace('треводгой', 'тревогой'));
    expect(anxietyCourse?.lessons.length).toBe(3);
  });

  test('articlesDatabase includes specialized anxiety articles (IDs 103 to 107)', () => {
    const article103 = articlesDatabase.find(a => a.id === 'article-103');
    const article107 = articlesDatabase.find(a => a.id === 'article-107');

    expect(article103).toBeDefined();
    expect(article103?.title).toContain('Нейробиология паники');
    expect(article107).toBeDefined();
    expect(article107?.title).toContain('магния треоната');
  });

  test('AICoachService triggers anxiety_management CBT exercise on panic keywords', async () => {
    const responseResult = await AICoachService.getEnhancedResponse('user_c24', 'У меня сильная тревожность и паника', {
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
      expect(responseResult.data.exercise?.steps.length).toBe(5);
    }
  });

  test('CommunityService support sticker and buddy appreciation award Karma points', async () => {
    // Initial karma
    const initialKarma = await CommunityService.getUserKarma();
    expect(initialKarma).toBe(0);

    // Send support sticker (+15)
    const stickerSuccess = await CommunityService.sendSupportSticker('sticker_1', 'Анна');
    expect(stickerSuccess).toBe(true);
    const karmaAfterSticker = await CommunityService.getUserKarma();
    expect(karmaAfterSticker).toBe(15);

    // Select buddy first
    await CommunityService.selectBuddy({ id: 'b_c24', name: 'Иван', daysSober: 50, avatar: '', status: 'Active' });

    // Send buddy appreciation (+10)
    const appreciationSuccess = await CommunityService.sendBuddyAppreciation('Спасибо за разговор!');
    expect(appreciationSuccess).toBe(true);
    const finalKarma = await CommunityService.getUserKarma();
    expect(finalKarma).toBe(25);
  });
});
