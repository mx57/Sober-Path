import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAnalyticsViewModel } from '../hooks/useAnalyticsViewModel';
import { useTranslation } from 'react-i18next';

export default function ProgressAnalytics() {
  const { t } = useTranslation();
  const vm = useAnalyticsViewModel();

  const getTrendIcon = () => {
    switch (vm.moodTrend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      default: return 'trending-flat';
    }
  };

  const getTrendColor = () => {
    switch (vm.moodTrend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#FF6B6B';
      default: return '#FF9800';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statsOverview}>
        <Text style={styles.sectionTitle}>{t('analytics.overview')}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="mood" size={24} color="#2E7D4A" />
            <Text style={styles.statNumber}>{vm.stats.averageMood7Days.toFixed(1)}</Text>
            <Text style={styles.statLabel}>{t('analytics.avgMoodWeek')}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name={getTrendIcon()} size={24} color={getTrendColor()} />
            <Text style={[styles.statNumber, { color: getTrendColor() }]}>
                {vm.moodTrend === 'improving' ? t('analytics.improving') : vm.moodTrend === 'declining' ? t('analytics.declining') : t('analytics.stable')}
            </Text>
            <Text style={styles.statLabel}>{t('analytics.moodTrend')}</Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>{t('analytics.personalizedInsights')}</Text>
        {vm.insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <MaterialIcons name="lightbulb" size={20} color="#FF9800" />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  statsOverview: { backgroundColor: 'white', padding: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D4A', marginBottom: 15 },
  statsGrid: { flexDirection: 'row', gap: 15 },
  statCard: { flex: 1, backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#2E7D4A', marginTop: 8, marginBottom: 5 },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  insightsContainer: { backgroundColor: 'white', padding: 20, marginBottom: 15 },
  insightCard: { flexDirection: 'row', backgroundColor: '#FFF8E1', padding: 15, borderRadius: 10, marginBottom: 10, gap: 12 },
  insightText: { flex: 1, fontSize: 14, color: '#F57F17', lineHeight: 20 }
});
