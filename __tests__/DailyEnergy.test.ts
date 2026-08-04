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
    expect(result.physicalResilience).toBe(60);
    expect(result.moodWellness).toBe(70);
    expect(result.mentalClarity).toBe(65);
    expect(result.energyLevel).toBe(65);
    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('should calculate higher physical energy for active & rested days', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { content: 'Сегодня проснулся очень бодрым и полным сил, сделал зарядку.', mood: 5 }
      ]
    });

    const result = await AICoachService.getDailyEnergyForecast('test-user');
    expect(result.physicalResilience).toBeGreaterThan(60);
  });

  it('should calculate lower physical and mental energy for tired/stressful days', async () => {
    (JournalService.getEntries as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { content: 'Ужасно устал, плохо спал, болит голова, но настроение в норме', mood: 4 }
      ]
    });

    const result = await AICoachService.getDailyEnergyForecast('test-user');
    expect(result.physicalResilience).toBeLessThan(60);
    expect(result.recommendations[0]).toContain('физический тонус снижен');
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
    expect(insights.dailyEnergy.mentalClarity).toBeGreaterThanOrEqual(65);
  });
});
