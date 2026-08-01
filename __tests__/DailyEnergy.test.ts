import { AICoachService } from '../services/AICoachService';
import { JournalService } from '../services/journalService';

jest.mock('../services/journalService');

describe('AICoachService Daily Energy Forecast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return default energy scores when no journal entries exist', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({ success: true, data: [] });

    const result = await AICoachService.getDailyEnergyForecast('test-user');
    expect(result.physical).toBe(70);
    expect(result.mood).toBe(65);
    expect(result.mental).toBe(75);
    expect(result.feedback).toContain('энергетический баланс в норме');
  });

  it('should calculate higher physical energy for active & rested days', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { content: 'Сегодня проснулся очень бодрым и полным сил, сделал зарядку.', mood: 5 }
      ]
    });

    const result = await AICoachService.getDailyEnergyForecast('test-user');
    expect(result.physical).toBeGreaterThan(75);
  });

  it('should calculate lower physical and mental energy for tired/stressful days', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { content: 'Ужасно устал, болит голова, но настроение в норме', mood: 4 }
      ]
    });

    const result = await AICoachService.getDailyEnergyForecast('test-user');
    expect(result.physical).toBeLessThan(75);
    expect(result.feedback).toContain('Физический ресурс снижен');
  });

  it('should integrate dailyEnergy forecast into user insights', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { content: 'Всё хорошо, спокоен и сосредоточен на целях.', mood: 4 }
      ]
    });

    const insights = await AICoachService.getUserInsights('test-user');
    expect(insights.dailyEnergy).toBeDefined();
    expect(insights.dailyEnergy.mental).toBeGreaterThanOrEqual(80);
  });
});
