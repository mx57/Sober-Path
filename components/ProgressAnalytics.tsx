import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAnalytics } from '../hooks/useAnalytics';

const screenWidth = Dimensions.get('window').width;

export default function ProgressAnalytics() {
  const { 
    moodEntries, 
    getAverageMood, 
    getMoodTrend, 
    getCravingPatterns,
    getPersonalizedInsights 
  } = useAnalytics();

  const last30DaysMood = moodEntries.slice(-30);
  const moodTrend = getMoodTrend();
  const cravingPatterns = getCravingPatterns();
  const insights = getPersonalizedInsights();

  const getTrendIcon = () => {
    switch (moodTrend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      default: return 'trending-flat';
    }
  };

  const getTrendColor = () => {
    switch (moodTrend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#FF6B6B';
      default: return '#FF9800';
    }
  };

  const getTrendText = () => {
    switch (moodTrend) {
      case 'improving': return 'Улучшается';
      case 'declining': return 'Снижается';
      default: return 'Стабильно';
    }
  };

  // Простая визуализация настроения без внешних библиотек
  const renderMoodChart = () => {
    const recentMoods = last30DaysMood.slice(-7);
    const maxHeight = 100;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Настроение за неделю</Text>
        <View style={styles.simpleChart}>
          {recentMoods.map((entry, index) => (
            <View key={index} style={styles.chartBarContainer}>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    height: (entry.mood / 5) * maxHeight,
                    backgroundColor: entry.mood >= 4 ? '#4CAF50' : entry.mood >= 3 ? '#FF9800' : '#FF6B6B'
                  }
                ]} 
              />
              <Text style={styles.chartLabel}>
                {new Date(entry.date).toLocaleDateString('ru-RU', { weekday: 'short' })}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Визуализация распределения настроения
  const renderMoodDistribution = () => {
    const distribution = [
      { emoji: '😢', mood: 1, count: last30DaysMood.filter(e => e.mood === 1).length },
      { emoji: '😕', mood: 2, count: last30DaysMood.filter(e => e.mood === 2).length },
      { emoji: '😐', mood: 3, count: last30DaysMood.filter(e => e.mood === 3).length },
      { emoji: '😊', mood: 4, count: last30DaysMood.filter(e => e.mood === 4).length },
      { emoji: '😄', mood: 5, count: last30DaysMood.filter(e => e.mood === 5).length }
    ];

    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    if (total === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Распределение настроения</Text>
        <View style={styles.distributionChart}>
          {distribution.map((item) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <View key={item.mood} style={styles.distributionItem}>
                <Text style={styles.distributionEmoji}>{item.emoji}</Text>
                <View style={styles.distributionBar}>
                  <View 
                    style={[
                      styles.distributionFill, 
                      { width: `${percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.distributionText}>{item.count}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Общая статистика */}
      <View style={styles.statsOverview}>
        <Text style={styles.sectionTitle}>Общая статистика</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="mood" size={24} color="#2E7D4A" />
            <Text style={styles.statNumber}>{getAverageMood(7).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Среднее настроение за неделю</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name={getTrendIcon()} size={24} color={getTrendColor()} />
            <Text style={[styles.statNumber, { color: getTrendColor() }]}>{getTrendText()}</Text>
            <Text style={styles.statLabel}>Тренд настроения</Text>
          </View>
        </View>
      </View>

      {/* График настроения */}
      {last30DaysMood.length > 0 && renderMoodChart()}

      {/* Распределение настроения */}
      {last30DaysMood.length > 0 && renderMoodDistribution()}

      {/* Паттерны тяги */}
      {cravingPatterns.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Время повышенной тяги</Text>
          <View style={styles.patternsContainer}>
            {cravingPatterns.slice(0, 4).map((pattern, index) => (
              <View key={index} style={styles.patternItem}>
                <Text style={styles.patternTime}>{pattern.time}</Text>
                <View style={styles.patternBar}>
                  <View 
                    style={[
                      styles.patternFill, 
                      { width: `${(pattern.frequency / Math.max(...cravingPatterns.map(p => p.frequency))) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.patternCount}>{pattern.frequency}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Персональные инсайты */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Персональные рекомендации</Text>
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <MaterialIcons name="lightbulb" size={20} color="#FF9800" />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))
        ) : (
          <View style={styles.noInsights}>
            <MaterialIcons name="info" size={24} color="#666" />
            <Text style={styles.noInsightsText}>
              Ведите дневник настроения несколько дней для получения персональных рекомендаций
            </Text>
          </View>
        )}
      </View>

      {/* Детальная статистика */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Детальная статистика</Text>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Записей в дневнике:</Text>
          <Text style={styles.detailValue}>{moodEntries.length}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Лучшее настроение:</Text>
          <Text style={styles.detailValue}>
            {Math.max(...moodEntries.map(e => e.mood), 0)} из 5
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Среднее за месяц:</Text>
          <Text style={styles.detailValue}>
            {getAverageMood(30).toFixed(1)} из 5
          </Text>
        </View>

        {cravingPatterns.length > 0 && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Всего эпизодов тяги:</Text>
            <Text style={styles.detailValue}>
              {cravingPatterns.reduce((sum, p) => sum + p.frequency, 0)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  statsOverview: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginTop: 8,
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  simpleChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: 20
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 5
  },
  chartLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center'
  },
  distributionChart: {
    gap: 10
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  distributionEmoji: {
    fontSize: 20,
    width: 30
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#2E7D4A'
  },
  distributionText: {
    fontSize: 12,
    color: '#666',
    width: 30,
    textAlign: 'right'
  },
  patternsContainer: {
    gap: 12
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  patternTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 60
  },
  patternBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  patternFill: {
    height: '100%',
    backgroundColor: '#FF6B6B'
  },
  patternCount: {
    fontSize: 12,
    color: '#666',
    width: 30,
    textAlign: 'right'
  },
  insightsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    gap: 12
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#F57F17',
    lineHeight: 20
  },
  noInsights: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    gap: 12
  },
  noInsightsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  detailLabel: {
    fontSize: 14,
    color: '#666'
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A'
  }
});