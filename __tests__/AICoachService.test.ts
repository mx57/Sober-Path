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
});
