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

  it('should calculate burnout rate with expected fields', async () => {
    const result = await AICoachService.getBurnoutRate('test-user');
    expect(result).toHaveProperty('burnoutRate');
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('feedback');
    expect(result).toHaveProperty('factors');
    expect(result).toHaveProperty('recommendations');
    expect(typeof result.burnoutRate).toBe('number');
    expect(['low', 'medium', 'high']).toContain(result.level);
  });

  it('should load social-anxiety course successfully', () => {
    const { MicroCoursesService } = require('../services/microCoursesService');
    const course = MicroCoursesService.getCourseById('social-anxiety');
    expect(course).toBeDefined();
    expect(course?.title).toBe('Социальная Тревожность');
    expect(course?.lessons.length).toBe(3);
    expect(course?.quiz?.length).toBe(1);
    expect(course?.quiz?.[0].correctAnswerIndex).toBe(1);
  });
});
