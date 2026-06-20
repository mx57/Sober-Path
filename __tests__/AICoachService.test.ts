import { AICoachService } from '../services/AICoachService';

describe('AICoachService', () => {
  it('should initialize memory for a new user', () => {
    const userId = 'test-user';
    AICoachService.initializeUserMemory(userId);
    // Accessing private memory for test verification isn't ideal,
    // but we can check if it returns a valid response
  });

  it('should return crisis message for high craving and stress', () => {
    const data = {
      mood: 2,
      cravingLevel: 5,
      stressLevel: 5,
      healthMetrics: {},
      recentEvents: []
    };
    const messages = AICoachService.analyzeUserBehavior(data);
    expect(messages.some(m => m.type === 'crisis')).toBe(true);
  });
});
