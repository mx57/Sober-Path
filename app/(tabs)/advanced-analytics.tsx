import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Switch
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { useRecovery } from '../../hooks/useRecovery';
import { useAnalytics } from '../../hooks/useAnalytics';
import { advancedInsightsService, PersonalInsight } from '../../services/advancedInsightsService';
import { smartNotificationService } from '../../services/smartNotificationService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Мемоизированные компоненты для производительности
const MemoizedInsightCard = React.memo(({ insight, onPress }: { 
  insight: PersonalInsight; 
  onPress: () => void; 
}) => {
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.98, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#FF6B6B';
      default: return '#2196F3';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'pattern': return 'trending-up';
      case 'risk': return 'warning';
      case 'achievement': return 'emoji-events';
      case 'recommendation': return 'lightbulb';
      default: return 'info';
    }
  };

  return (
    <Animated.View style={[styles.insightCard, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.insightContent}>
        <View style={styles.insightHeader}>
          <View style={[styles.insightIcon, { backgroundColor: getSeverityColor(insight.severity) }]}>
            <MaterialIcons 
              name={getSeverityIcon(insight.type)} 
              size={24} 
              color="white" 
            />
          </View>
          <View style={styles.insightInfo}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription} numberOfLines={2}>
              {insight.description}
            </Text>
          </View>
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceText}>
              {Math.round(insight.confidence * 100)}%
            </Text>
            <Text style={styles.confidenceLabel}>точность</Text>
          </View>
        </View>
        
        {insight.actionableAdvice.length > 0 && (
          <View style={styles.advicePreview}>
            <Text style={styles.adviceText}>
              💡 {insight.actionableAdvice[0]}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const MemoizedRiskIndicator = React.memo(({ riskLevel, factors }: {
  riskLevel: string;
  factors: string[];
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#FF5722';
      case 'critical': return '#D32F2F';
      default: return '#9E9E9E';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'low': return 'Низкий риск';
      case 'medium': return 'Умеренный риск';
      case 'high': return 'Высокий риск';
      case 'critical': return 'Критический риск';
      default: return 'Неизвестно';
    }
  };

  return (
    <View style={[styles.riskContainer, { borderColor: getRiskColor(riskLevel) }]}>
      <LinearGradient 
        colors={[getRiskColor(riskLevel) + '20', getRiskColor(riskLevel) + '05']}
        style={styles.riskGradient}
      >
        <View style={styles.riskHeader}>
          <MaterialIcons 
            name="shield" 
            size={28} 
            color={getRiskColor(riskLevel)} 
          />
          <Text style={[styles.riskTitle, { color: getRiskColor(riskLevel) }]}>
            {getRiskText(riskLevel)}
          </Text>
        </View>
        
        {factors.length > 0 && (
          <View style={styles.riskFactors}>
            <Text style={styles.factorsTitle}>Факторы риска:</Text>
            {factors.slice(0, 3).map((factor, index) => (
              <Text key={index} style={styles.factorText}>
                • {factor}
              </Text>
            ))}
            {factors.length > 3 && (
              <Text style={styles.moreFactors}>
                +{factors.length - 3} других факторов
              </Text>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
});

export default function AdvancedAnalyticsPage() {
  const insets = useSafeAreaInsets();
  const { userProfile, progress, soberDays } = useRecovery();
  const { moodData, getAnalytics } = useAnalytics();

  const [insights, setInsights] = useState<PersonalInsight[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [motivationalContent, setMotivationalContent] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<PersonalInsight | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Анимации
  const fadeInValue = useSharedValue(0);
  const slideValue = useSharedValue(50);

  const fadeInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: slideValue.value }]
  }));

  // Загрузка и анализ данных
  useEffect(() => {
    loadAdvancedAnalytics();
    initializeAnimations();
  }, []);

  const initializeAnimations = () => {
    fadeInValue.value = withTiming(1, { duration: 800 });
    slideValue.value = withTiming(0, { duration: 800 });
  };

  const loadAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      
      // Анализируем паттерны пользователя
      const userInsights = advancedInsightsService.analyzeUserPatterns(progress || [], moodData || []);
      setInsights(userInsights);

      // Оцениваем текущий риск
      const currentRisk = advancedInsightsService.assessRelapsRisk({
        mood: moodData?.[moodData.length - 1]?.mood || 3,
        stress: moodData?.[moodData.length - 1]?.stressLevel || 3,
        sleep: moodData?.[moodData.length - 1]?.sleepQuality || 3,
        socialSupport: 4, // заглушка
        cravings: moodData?.[moodData.length - 1]?.cravingLevel || 2
      });
      setRiskAssessment(currentRisk);

      // Генерируем персонализированный контент
      const content = advancedInsightsService.generateMotivationalContent(userProfile, soberDays || 0);
      setMotivationalContent(content);

      // Загружаем настройки уведомлений
      const settings = smartNotificationService.getPreferences();
      setNotificationSettings(settings);

    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики событий
  const handleInsightPress = useCallback((insight: PersonalInsight) => {
    setSelectedInsight(insight);
  }, []);

  const handleUpdateNotificationSetting = useCallback(async (key: string, value: any) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    
    smartNotificationService.updatePreferences({ [key]: value });
    
    // Перепланируем уведомления при изменении настроек
    if (value && userProfile) {
      switch (key) {
        case 'motivationalQuotes':
          await smartNotificationService.scheduleMotivationalNotifications(userProfile, soberDays || 0);
          break;
        case 'riskInterventions':
          if (riskAssessment) {
            await smartNotificationService.scheduleRiskInterventions(riskAssessment);
          }
          break;
        case 'dailyCheckIns':
          await smartNotificationService.scheduleDailyCheckIns(userProfile);
          break;
      }
    }
  }, [notificationSettings, userProfile, soberDays, riskAssessment]);

  // Мемоизированные компоненты для производительности
  const insightsList = useMemo(() => 
    insights.map((insight, index) => (
      <MemoizedInsightCard
        key={insight.id}
        insight={insight}
        onPress={() => handleInsightPress(insight)}
      />
    ))
  , [insights, handleInsightPress]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <MaterialIcons name="psychology" size={60} color="#6A1B9A" />
        <Text style={styles.loadingText}>Анализируем ваши данные...</Text>
        <Text style={styles.loadingSubtext}>ИИ создает персональные инсайты</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#6A1B9A', '#8E24AA']} style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="psychology" size={32} color="white" />
          <Text style={styles.headerTitle}>ИИ-Аналитика</Text>
          <Text style={styles.headerSubtitle}>Персональные инсайты и прогнозы</Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, fadeInAnimatedStyle]}>
        {/* Оценка риска */}
        {riskAssessment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡️ Текущий статус риска</Text>
            <MemoizedRiskIndicator 
              riskLevel={riskAssessment.riskLevel} 
              factors={riskAssessment.factors} 
            />
          </View>
        )}

        {/* Персональные инсайты */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Персональные инсайты</Text>
          {insights.length > 0 ? (
            <View style={styles.insightsList}>
              {insightsList}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="insights" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>
                Недостаточно данных для анализа
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Продолжайте отмечать дни для получения персональных инсайтов
              </Text>
            </View>
          )}
        </View>

        {/* Мотивационный контент */}
        {motivationalContent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💪 Персональная мотивация</Text>
            {motivationalContent.map((content, index) => (
              <View key={index} style={styles.motivationCard}>
                <View style={styles.motivationHeader}>
                  <MaterialIcons 
                    name={content.type === 'quote' ? 'format-quote' : 
                          content.type === 'story' ? 'book' :
                          content.type === 'tip' ? 'lightbulb' : 'emoji-events'}
                    size={24} 
                    color="#6A1B9A" 
                  />
                  <Text style={styles.motivationType}>
                    {content.type === 'quote' ? 'Цитата' :
                     content.type === 'story' ? 'История' :
                     content.type === 'tip' ? 'Совет' : 'Вызов'}
                  </Text>
                  {content.duration && (
                    <Text style={styles.motivationDuration}>
                      {content.duration} мин
                    </Text>
                  )}
                </View>
                <Text style={styles.motivationContent}>{content.content}</Text>
                {content.author && (
                  <Text style={styles.motivationAuthor}>— {content.author}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Настройки умных уведомлений */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Умные уведомления</Text>
          <View style={styles.notificationSettings}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Мотивационные цитаты</Text>
                <Text style={styles.settingDescription}>
                  Персональные мотивационные сообщения
                </Text>
              </View>
              <Switch
                value={notificationSettings.motivationalQuotes}
                onValueChange={(value) => handleUpdateNotificationSetting('motivationalQuotes', value)}
                trackColor={{ false: '#E0E0E0', true: '#6A1B9A' }}
                thumbColor={notificationSettings.motivationalQuotes ? 'white' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Интервенции при риске</Text>
                <Text style={styles.settingDescription}>
                  Помощь в моменты повышенного риска
                </Text>
              </View>
              <Switch
                value={notificationSettings.riskInterventions}
                onValueChange={(value) => handleUpdateNotificationSetting('riskInterventions', value)}
                trackColor={{ false: '#E0E0E0', true: '#6A1B9A' }}
                thumbColor={notificationSettings.riskInterventions ? 'white' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Ежедневные проверки</Text>
                <Text style={styles.settingDescription}>
                  Напоминания отметить настроение
                </Text>
              </View>
              <Switch
                value={notificationSettings.dailyCheckIns}
                onValueChange={(value) => handleUpdateNotificationSetting('dailyCheckIns', value)}
                trackColor={{ false: '#E0E0E0', true: '#6A1B9A' }}
                thumbColor={notificationSettings.dailyCheckIns ? 'white' : '#F4F3F4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Советы по здоровью</Text>
                <Text style={styles.settingDescription}>
                  ИИ-инсайты для улучшения самочувствия
                </Text>
              </View>
              <Switch
                value={notificationSettings.wellnessTips}
                onValueChange={(value) => handleUpdateNotificationSetting('wellnessTips', value)}
                trackColor={{ false: '#E0E0E0', true: '#6A1B9A' }}
                thumbColor={notificationSettings.wellnessTips ? 'white' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        {/* Детальный просмотр инсайта */}
        {selectedInsight && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Детальный анализ</Text>
            <View style={styles.detailedInsight}>
              <Text style={styles.detailedTitle}>{selectedInsight.title}</Text>
              <Text style={styles.detailedDescription}>
                {selectedInsight.description}
              </Text>
              
              <View style={styles.confidenceIndicator}>
                <Text style={styles.confidenceLabel}>Точность анализа:</Text>
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill, 
                      { width: `${selectedInsight.confidence * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.confidenceValue}>
                  {Math.round(selectedInsight.confidence * 100)}%
                </Text>
              </View>

              {selectedInsight.actionableAdvice.length > 0 && (
                <View style={styles.actionableAdvice}>
                  <Text style={styles.adviceTitle}>Рекомендации к действию:</Text>
                  {selectedInsight.actionableAdvice.map((advice, index) => (
                    <Text key={index} style={styles.adviceItem}>
                      {index + 1}. {advice}
                    </Text>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedInsight(null)}
              >
                <Text style={styles.closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginTop: 20
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8
  },
  header: {
    padding: 20,
    alignItems: 'center'
  },
  headerContent: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4
  },
  content: {
    padding: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 16
  },
  riskContainer: {
    borderRadius: 15,
    borderWidth: 2,
    overflow: 'hidden'
  },
  riskGradient: {
    padding: 20
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12
  },
  riskFactors: {
    marginTop: 8
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  factorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  moreFactors: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4
  },
  insightsList: {
    gap: 12
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  insightContent: {
    padding: 16
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  insightInfo: {
    flex: 1
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  confidenceContainer: {
    alignItems: 'center',
    marginLeft: 8
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A1B9A'
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#999'
  },
  advicePreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8
  },
  adviceText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic'
  },
  emptyState: {
    alignItems: 'center',
    padding: 40
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center'
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  },
  motivationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  motivationType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6A1B9A',
    marginLeft: 8,
    flex: 1
  },
  motivationDuration: {
    fontSize: 12,
    color: '#999'
  },
  motivationContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24
  },
  motivationAuthor: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'right'
  },
  notificationSettings: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  settingInfo: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 14,
    color: '#666'
  },
  detailedInsight: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  detailedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  detailedDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16
  },
  confidenceIndicator: {
    marginBottom: 16
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginVertical: 8
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#6A1B9A',
    borderRadius: 4
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6A1B9A',
    textAlign: 'center'
  },
  actionableAdvice: {
    marginBottom: 20
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  adviceItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8
  },
  closeButton: {
    backgroundColor: '#6A1B9A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});