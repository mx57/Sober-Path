import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAnalytics } from '../hooks/useAnalytics';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

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

  // Данные для графиков
  const moodData = {
    labels: last30DaysMood.slice(-7).map(entry => 
      new Date(entry.date).toLocaleDateString('ru-RU', { weekday: 'short' })
    ),
    datasets: [{
      data: last30DaysMood.slice(-7).map(entry => entry.mood),
      color: (opacity = 1) => `rgba(46, 125, 74, ${opacity})`,
      strokeWidth: 3
    }]
  };

  const cravingData = {
    labels: cravingPatterns.slice(0, 4).map(p => p.time),
    datasets: [{
      data: cravingPatterns.slice(0, 4).map(p => p.frequency)
    }]
  };

  const weeklyMoodDistribution = [
    { name: '😢', population: last30DaysMood.filter(e => e.mood === 1).length, color: '#FF6B6B', legendFontColor: '#333' },
    { name: '😕', population: last30DaysMood.filter(e => e.mood === 2).length, color: '#FF9800', legendFontColor: '#333' },
    { name: '😐', population: last30DaysMood.filter(e => e.mood === 3).length, color: '#FFC107', legendFontColor: '#333' },
    { name: '😊', population: last30DaysMood.filter(e => e.mood === 4).length, color: '#4CAF50', legendFontColor: '#333' },
    { name: '😄', population: last30DaysMood.filter(e => e.mood === 5).length, color: '#2E7D4A', legendFontColor: '#333' }
  ];

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(46, 125, 74, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForLabels: { fontSize: 12 }
  };

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

      {/* График настроения за неделю */}
      {moodData.labels.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Динамика настроения за неделю</Text>
          <LineChart
            data={moodData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
          />
        </View>
      )}

      {/* Распределение настроения */}
      {weeklyMoodDistribution.some(item => item.population > 0) && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Распределение настроения за месяц</Text>
          <PieChart
            data={weeklyMoodDistribution.filter(item => item.population > 0)}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      )}

      {/* Паттерны тяги */}
      {cravingPatterns.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Время повышенной тяги</Text>
          <BarChart
            data={cravingData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            verticalLabelRotation={30}
          />
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
  chart: {
    borderRadius: 16
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