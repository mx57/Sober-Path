import { useContext } from 'react';
import { AnalyticsContext } from '../contexts/AnalyticsContext';

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}