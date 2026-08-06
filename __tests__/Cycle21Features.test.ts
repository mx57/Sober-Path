import { CommunityService } from '../services/communityService';
import { microCoursesDatabase } from '../services/microCoursesDatabase';
import { AICoachService } from '../services/AICoachService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Cycle 21 Features Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('Support Groups Feature', () => {
    it('should retrieve list of support groups with default status', async () => {
      const groups = await CommunityService.getSupportGroups();
      expect(groups).toBeDefined();
      expect(groups.length).toBe(4);

      const firstGroup = groups.find(g => g.id === 'g1');
      expect(firstGroup).toBeDefined();
      expect(firstGroup?.name).toBe('Первый месяц вместе 🎯');
      expect(firstGroup?.isJoined).toBe(false);
    });

    it('should toggle support group participation and award 20 Karma points', async () => {
      const groupId = 'g2';
      const initialKarma = await CommunityService.getUserKarma();

      const isJoined = await CommunityService.toggleGroupParticipation(groupId);
      expect(isJoined).toBe(true);

      const updatedKarma = await CommunityService.getUserKarma();
      expect(updatedKarma).toBe(initialKarma + 20);

      const groups = await CommunityService.getSupportGroups();
      const updatedGroup = groups.find(g => g.id === groupId);
      expect(updatedGroup?.isJoined).toBe(true);
      expect(updatedGroup?.membersCount).toBe(186); // Default 185 + 1
    });

    it('should leave support group and not award extra points', async () => {
      const groupId = 'g3';
      await CommunityService.toggleGroupParticipation(groupId); // Join
      const karmaAfterJoin = await CommunityService.getUserKarma();

      const isJoined = await CommunityService.toggleGroupParticipation(groupId); // Leave
      expect(isJoined).toBe(false);

      const karmaAfterLeave = await CommunityService.getUserKarma();
      expect(karmaAfterLeave).toBe(karmaAfterJoin); // No change

      const groups = await CommunityService.getSupportGroups();
      const updatedGroup = groups.find(g => g.id === groupId);
      expect(updatedGroup?.isJoined).toBe(false);
      expect(updatedGroup?.membersCount).toBe(290); // Reverted back
    });
  });

  describe('New Micro-Course structure', () => {
    it('should find the "mindfulness_in_city" course with all 3 lessons', () => {
      const course = microCoursesDatabase.find(c => c.id === 'mindfulness_in_city');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Осознанность в мегаполисе: борьба со стрессом');
      expect(course?.points).toBe(150);
      expect(course?.lessons.length).toBe(3);

      const [l1, l2, l3] = course!.lessons;
      expect(l1.id).toBe('mc_l1');
      expect(l2.id).toBe('mc_l2');
      expect(l3.id).toBe('mc_l3');
      expect(l2.type).toBe('exercise');
      expect(l2.exerciseId).toBe('box-breathing');
    });
  });

  describe('AI Coach Urban Stress Detox Exercise', () => {
    it('should trigger "urban_detox" exercise on city/stress keywords', async () => {
      const responseResult = await AICoachService.getEnhancedResponse('test_user', 'Я ужасно устал от этого города и вечного шума мегаполиса', {
        userMood: 2,
        soberDays: 10,
        cravingLevel: 2,
        timeOfDay: 'evening'
      });

      expect(responseResult.success).toBe(true);
      const data = (responseResult as any).data;
      expect(data.exercise).toBeDefined();
      expect(data.exercise.id).toBe('urban_detox');
      expect(data.exercise.name).toBe('Умный городской детокс');
      expect(data.exercise.steps.length).toBe(5);
    });
  });
});
