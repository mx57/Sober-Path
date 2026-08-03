import { AICoachService } from '../services/AICoachService';
import { JournalService } from '../services/journalService';

jest.mock('../services/journalService');

describe('AICoachService Burnout Diagnostics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return low burnout rate when no journal entries exist', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({ success: true, data: [] });

    const result = await AICoachService.getBurnoutDiagnostics('test-user');
    expect(result.rate).toBeLessThanOrEqual(20);
    expect(result.level).toBe('Низкий');
    expect(result.factors).toContain('Психоэмоциональное состояние в пределах нормы');
  });

  it('should calculate high burnout rate for stressful and tired days', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { content: 'Ужасно устал на работе, сильный стресс, все бесит. Похоже на выгорание, нет сил совсем.', mood: 2 },
        { content: 'Опять бессонница, не спал всю ночь.', mood: 1 }
      ]
    });

    const result = await AICoachService.getBurnoutDiagnostics('test-user');
    expect(result.rate).toBeGreaterThanOrEqual(70);
    expect(result.level).toBe('Высокий');
    expect(result.factors).toContain('Высокий уровень эмоционального стресса');
    expect(result.factors).toContain('Накапливающаяся физическая усталость');
  });

  it('should calculate medium burnout rate for slightly tired days', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { content: 'Немного устал сегодня, напряжение чувствуется.', mood: 3 }
      ]
    });

    const result = await AICoachService.getBurnoutDiagnostics('test-user');
    expect(result.rate).toBeGreaterThan(20);
    expect(result.level).toBe('Средний');
  });
});
