import { AICoachService } from '../services/AICoachService';
import { CommunityService } from '../services/communityService';

describe('Cycle 21 Improvements', () => {
  beforeAll(async () => {
    await AICoachService.loadFromStorage();
  });

  describe('CBT Thought Diary (SMER)', () => {
    it('should trigger CBT SMER exercise on keyword "дневник смэр"', async () => {
      const result = await AICoachService.getEnhancedResponse('test-user', 'я хочу заполнить дневник смэр', {
        userMood: 3,
        soberDays: 10,
        cravingLevel: 1,
        timeOfDay: 'afternoon'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exercise).toBeDefined();
        expect(result.data.exercise?.id).toBe('cbt_smer');
        expect(result.data.exercise?.type).toBe('nlp');
        expect(result.data.exercise?.steps.length).toBe(5);
        expect(result.data.exercise?.steps[0]).toContain('СИТУАЦИЮ');
      }
    });

    it('should trigger CBT SMER exercise on keyword "смэр"', async () => {
      const result = await AICoachService.getEnhancedResponse('test-user', 'расскажи про смэр', {
        userMood: 3,
        soberDays: 10,
        cravingLevel: 1,
        timeOfDay: 'afternoon'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exercise).toBeDefined();
        expect(result.data.exercise?.id).toBe('cbt_smer');
      }
    });
  });

  describe('Community Gratitude Board', () => {
    it('should retrieve prepopulated gratitudes by default', async () => {
      const list = await CommunityService.getGratitudes();
      expect(list.length).toBeGreaterThanOrEqual(4);
      expect(list[0]).toHaveProperty('text');
      expect(list[0]).toHaveProperty('hearts');
      expect(list[0]).toHaveProperty('author');
    });

    it('should save a new gratitude and reward karma points', async () => {
      const initialKarma = await CommunityService.getUserKarma();
      const text = 'Благодарен за утренний спорт и свежий воздух';
      const newGrat = await CommunityService.saveGratitude(text, 'Иван', 15);

      expect(newGrat.text).toBe(text);
      expect(newGrat.author).toBe('Иван');
      expect(newGrat.authorDaysSober).toBe(15);
      expect(newGrat.hearts).toBe(0);
      expect(newGrat.userHearted).toBe(false);

      const list = await CommunityService.getGratitudes();
      expect(list[0].text).toBe(text);

      const updatedKarma = await CommunityService.getUserKarma();
      expect(updatedKarma).toBe(initialKarma + 15);
    });

    it('should toggle gratitude heart and increase hearts count', async () => {
      const list = await CommunityService.getGratitudes();
      const targetId = list[0].id;
      const initialHearts = list[0].hearts;

      const updatedList = await CommunityService.toggleGratitudeHeart(targetId);
      const targetItem = updatedList.find(g => g.id === targetId);

      expect(targetItem?.userHearted).toBe(true);
      expect(targetItem?.hearts).toBe(initialHearts + 1);

      // Toggle again (remove heart)
      const revertedList = await CommunityService.toggleGratitudeHeart(targetId);
      const revertedItem = revertedList.find(g => g.id === targetId);

      expect(revertedItem?.userHearted).toBe(false);
      expect(revertedItem?.hearts).toBe(initialHearts);
    });
  });
});
