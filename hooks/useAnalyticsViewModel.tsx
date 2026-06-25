import { useMemo } from 'react';
import { useAnalytics } from './useAnalytics';

export function useAnalyticsViewModel() {
  const analytics = useAnalytics();

  const moodTrend = useMemo(() => analytics.getMoodTrend(), [analytics]);
  const last30DaysMood = useMemo(() => analytics.moodEntries.slice(-30), [analytics.moodEntries]);
  const cravingPatterns = useMemo(() => analytics.getCravingPatterns(), [analytics]);
  const insights = useMemo(() => analytics.getPersonalizedInsights(), [analytics]);

  const stats = useMemo(() => ({
    averageMood7Days: analytics.getAverageMood(7),
    averageMood30Days: analytics.getAverageMood(30),
    totalEntries: analytics.moodEntries.length,
    bestMood: Math.max(...analytics.moodEntries.map(e => e.mood), 0),
    totalCravingEpisodes: cravingPatterns.reduce((sum, p) => sum + p.frequency, 0)
  }), [analytics, cravingPatterns]);

  return {
    moodEntries: analytics.moodEntries,
    last30DaysMood,
    moodTrend,
    cravingPatterns,
    insights,
    stats
  };
}
