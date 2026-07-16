import { AICoachService } from '../services/AICoachService';

describe('AICoachService Sleep Quality Analysis', () => {
  it('should handle empty or missing entries gracefully', () => {
    const result = AICoachService.analyzeSleepFromJournal([]);
    expect(result.sleepQuality).toBe(3);
    expect(result.feedback).toContain('Недостаточно данных');
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.detectedIssues).toEqual([]);
  });

  it('should analyze positive sleep mentions and return high sleep quality', () => {
    const entries = [
      { content: 'Сегодня проснулся бодр. Был отличный сон, спал очень крепко.', date: '2024-10-01' },
      { content: 'Прекрасно выспался! Настроение на высоте.', date: '2024-10-02' }
    ];
    const result = AICoachService.analyzeSleepFromJournal(entries);
    expect(result.sleepQuality).toBeGreaterThanOrEqual(4);
    expect(result.feedback).toContain('отличная динамика сна');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should detect sleep issues and return low sleep quality for bad sleep mentions', () => {
    const entries = [
      { content: 'Всю ночь мучила бессонница, ворочался до 4 утра.', date: '2024-10-01' },
      { content: 'Опять приснился кошмар, просыпался несколько раз. Чувствую себя разбитым.', date: '2024-10-02' }
    ];
    const result = AICoachService.analyzeSleepFromJournal(entries);
    expect(result.sleepQuality).toBeLessThanOrEqual(2);
    expect(result.feedback).toContain('Обнаружены выраженные проблемы');
    expect(result.detectedIssues).toContain('Трудности с засыпанием (бессонница)');
    expect(result.detectedIssues).toContain('Прерывистый сон или кошмары');
    expect(result.detectedIssues).toContain('Отсутствие чувства отдыха по утрам');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should average scores when there is a mix of positive and negative mentions', () => {
    const entries = [
      { content: 'Прекрасно выспался, очень бодр.', date: '2024-10-01' }, // High score (5)
      { content: 'Опять бессонница, ворочался.', date: '2024-10-02' }   // Low score (1)
    ];
    const result = AICoachService.analyzeSleepFromJournal(entries);
    expect(result.sleepQuality).toBe(3); // (5 + 1) / 2 = 3
    expect(result.feedback).toContain('на среднем уровне');
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
