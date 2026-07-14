import { AICoachService } from '../services/AICoachService';

describe('AICoachService', () => {
  it('should initialize memory for a new user', () => {
    const userId = 'test-user';
    AICoachService.initializeUserMemory(userId);
  });

  it('should return crisis message for high craving and stress', () => {
    const data = {
      mood: 2,
      cravingLevel: 5,
      stressLevel: 5,
      healthMetrics: {},
      recentEvents: []
    };
    const result = AICoachService.analyzeUserBehavior(data);
    expect(result.success).toBe(true);
    if (result.success) {
        expect(result.data.some(m => m.type === 'crisis')).toBe(true);
    }
  });

  it('should update psychological profile based on topics', async () => {
    const userId = 'profile-test-user';
    AICoachService.initializeUserMemory(userId);

    // Simulate a response which updates memory
    await AICoachService.getEnhancedResponse(userId, 'Чувствую сильный стресс и тревогу сегодня', {
      userMood: 2,
      soberDays: 10,
      cravingLevel: 1,
      timeOfDay: 'afternoon'
    });

    const insights = AICoachService.getUserInsights(userId);
    expect(insights.conversationCount).toBe(1);
    expect(insights.psychologicalProfile).toBeDefined();
    expect(insights.psychologicalProfile?.vulnerabilities).toContain('стресс');
  });
});
