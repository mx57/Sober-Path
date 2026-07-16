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
  });
});
