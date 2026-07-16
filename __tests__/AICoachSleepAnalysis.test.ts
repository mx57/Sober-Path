import { AICoachService } from '../services/AICoachService';
import { JournalService } from '../services/journalService';

jest.mock('../services/journalService');

describe('AICoachService Sleep Analysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return default score when no journal entries exist', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({ success: true, data: [] });

    const result = await AICoachService.analyzeSleepPatterns();
    expect(result.averageScore).toBe(70);
    expect(result.insights[0]).toContain('Недостаточно данных');
  });

  it('should increase score for good sleep keywords', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { content: 'Сегодня я отлично выспался и чувствую себя бодрым', mood: 5 }
      ]
    });

    const result = await AICoachService.analyzeSleepPatterns();
    expect(result.averageScore).toBeGreaterThan(70);
    expect(result.insights[0]).toContain('Отличные показатели');
  });

  it('should decrease score for bad sleep keywords', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { content: 'Опять бессонница, ворочался всю ночь и совсем не выспался', mood: 2 }
      ]
    });

    const result = await AICoachService.analyzeSleepPatterns();
    expect(result.averageScore).toBeLessThan(70);
    expect(result.insights[0]).toContain('беспокойным');
  });

  it('should integrate sleep quality into psychological profile', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
        success: true,
        data: [{ content: 'плохо спал', mood: 2 }]
    });

    const insights = await AICoachService.getUserInsights('test-user');
    expect(insights.profile.sleepQuality).toBeLessThan(70);
    expect(insights.profile.vulnerabilities).toContain('Дефицит сна');
  });
});
