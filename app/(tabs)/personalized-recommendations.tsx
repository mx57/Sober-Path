// Компонент персонализированных рекомендаций

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import PersonalizationEngine from '../../services/personalizationService';
import AdvancedMoodTracker from '../../services/advancedMoodTracker';
import InteractiveMeditationEngine from '../../services/interactiveMeditationService';

const { width: screenWidth } = Dimensions.get('window');

interface PersonalizedRecommendation {
  id: string;
  type: 'technique' | 'activity' | 'reminder' | 'social' | 'emergency';
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  timeToComplete: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  personalizedMessage: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

const MemoizedRecommendationCard = React.memo(({ 
  recommendation, 
  onPress, 
  onFeedback 
}: {
  recommendation: PersonalizedRecommendation;
  onPress: () => void;
  onFeedback: (helpful: boolean) => void;
}) => {
  const scaleValue = useSharedValue(1);
  const glowValue = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    shadowOpacity: 0.1 + glowValue.value * 0.2,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowValue.value,
  }));

  useEffect(() => {
    if (recommendation.urgency === 'critical' || recommendation.urgency === 'high') {
      glowValue.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      );
    }
  }, [recommendation.urgency]);

  const handlePress = () => {
    scaleValue.value = withSpring(0.96, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return '#666';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'emergency';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'lightbulb';
      default: return 'help';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technique': return 'psychology';
      case 'activity': return 'directions-run';
      case 'reminder': return 'notifications';
      case 'social': return 'group';
      case 'emergency': return 'emergency';
      default: return 'star';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <Animated.View style={[styles.recommendationCard, animatedStyle]}>
      {/* Glow effect для важных рекомендаций */}
      {(recommendation.urgency === 'critical' || recommendation.urgency === 'high') && (
        <Animated.View 
          style={[
            styles.glowEffect, 
            { borderColor: getUrgencyColor(recommendation.urgency) },
            glowAnimatedStyle
          ]} 
        />
      )}
      
      <TouchableOpacity onPress={handlePress} style={styles.cardContent}>
        {/* Заголовок карточки */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.typeIcon, { backgroundColor: getUrgencyColor(recommendation.urgency) }]}>
              <MaterialIcons 
                name={getTypeIcon(recommendation.type) as any} 
                size={20} 
                color="white" 
              />
            </View>
            <View style={styles.urgencyBadge}>
              <MaterialIcons 
                name={getUrgencyIcon(recommendation.urgency) as any} 
                size={14} 
                color={getUrgencyColor(recommendation.urgency)} 
              />
            </View>
          </View>
          
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {Math.round(recommendation.confidence * 100)}%
            </Text>
          </View>
        </View>

        {/* Контент */}
        <View style={styles.cardBody}>
          <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
          <Text style={styles.recommendationDescription} numberOfLines={2}>
            {recommendation.description}
          </Text>
          
          {/* Персонализированное сообщение */}
          <View style={styles.personalizedMessage}>
            <MaterialIcons name="auto-awesome" size={16} color="#FF9800" />
            <Text style={styles.personalizedMessageText} numberOfLines={3}>
              {recommendation.personalizedMessage}
            </Text>
          </View>

          {/* Метаданные */}
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={14} color="#666" />
              <Text style={styles.metaText}>{recommendation.timeToComplete} мин</Text>
            </View>
            
            <View style={styles.metaItem}>
              <MaterialIcons name="trending-up" size={14} color={getDifficultyColor(recommendation.difficulty)} />
              <Text style={[styles.metaText, { color: getDifficultyColor(recommendation.difficulty) }]}>
                {recommendation.difficulty === 'easy' ? 'Легко' : 
                 recommendation.difficulty === 'medium' ? 'Средне' : 'Сложно'}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialIcons name="category" size={14} color="#666" />
              <Text style={styles.metaText}>{recommendation.category}</Text>
            </View>
          </View>

          {/* Обоснование */}
          <View style={styles.reasoning}>
            <Text style={styles.reasoningLabel}>💡 Почему эта рекомендация:</Text>
            <Text style={styles.reasoningText}>{recommendation.reasoning}</Text>
          </View>
        </View>

        {/* Действия */}
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handlePress}
          >
            <LinearGradient
              colors={[getUrgencyColor(recommendation.urgency), getUrgencyColor(recommendation.urgency) + '80']}
              style={styles.primaryActionGradient}
            >
              <MaterialIcons name="play-arrow" size={20} color="white" />
              <Text style={styles.primaryActionText}>Начать</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.feedbackButtons}>
            <TouchableOpacity 
              style={styles.feedbackButton}
              onPress={() => onFeedback(true)}
            >
              <MaterialIcons name="thumb-up" size={18} color="#4CAF50" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.feedbackButton}
              onPress={() => onFeedback(false)}
            >
              <MaterialIcons name="thumb-down" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const PersonalizedRecommendationsPage = () => {
  const insets = useSafeAreaInsets();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentContext, setCurrentContext] = useState({
    mood: 3,
    energy: 3,
    stress: 2,
    location: 'home'
  });
  const [selectedRecommendation, setSelectedRecommendation] = useState<PersonalizedRecommendation | null>(null);
  const [showContextUpdate, setShowContextUpdate] = useState(false);

  // Анимации
  const fadeInValue = useSharedValue(0);
  const slideValue = useSharedValue(50);

  const fadeInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: slideValue.value }]
  }));

  useEffect(() => {
    loadRecommendations();
    
    fadeInValue.value = withTiming(1, { duration: 800 });
    slideValue.value = withTiming(0, { duration: 800 });
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Имитация загрузки персонализированных рекомендаций
      const mockRecommendations: PersonalizedRecommendation[] = [
        {
          id: '1',
          type: 'technique',
          title: 'Техника заземления 5-4-3-2-1',
          description: 'Быстрая техника для снижения тревожности',
          confidence: 0.92,
          reasoning: 'Ваш уровень тревожности повысился на 40% за последние 2 дня. Эта техника помогла вам в 8 из 10 похожих ситуаций.',
          timeToComplete: 5,
          difficulty: 'easy',
          category: 'Работа с тревогой',
          personalizedMessage: 'Привет! Я заметил повышенную тревожность в ваших последних записях. Техника 5-4-3-2-1 отлично работала для вас на прошлой неделе - давайте повторим успех!',
          urgency: 'high'
        },
        {
          id: '2',
          type: 'activity',
          title: 'Прогулка на свежем воздухе',
          description: '20-минутная прогулка для улучшения настроения',
          confidence: 0.85,
          reasoning: 'Физическая активность на улице улучшает ваше настроение на 65% эффективнее домашних упражнений.',
          timeToComplete: 20,
          difficulty: 'easy',
          category: 'Физическая активность',
          personalizedMessage: 'Сегодня отличная погода! Помните, как хорошо вы чувствовали себя после прогулки в парке на прошлых выходных? Ваше настроение поднялось с 2 до 4 баллов!',
          urgency: 'medium'
        },
        {
          id: '3',
          type: 'social',
          title: 'Связаться с ментором',
          description: 'Короткий звонок или сообщение вашему ментору',
          confidence: 0.78,
          reasoning: 'Социальная поддержка критически важна в периоды повышенного стресса.',
          timeToComplete: 10,
          difficulty: 'easy',
          category: 'Поддержка',
          personalizedMessage: 'Анна, ваш ментор, была онлайн 15 минут назад. Она всегда рада помочь и отвечает очень быстро. Может, стоит поделиться тем, что на душе?',
          urgency: 'medium'
        },
        {
          id: '4',
          type: 'reminder',
          title: 'Время для медитации',
          description: 'Ваша ежедневная 10-минутная медитация',
          confidence: 0.88,
          reasoning: 'Вы пропустили медитацию вчера. Регулярная практика снижает ваш стресс на 45%.',
          timeToComplete: 10,
          difficulty: 'medium',
          category: 'Медитация',
          personalizedMessage: 'Ваша серия медитаций прервалась вчера после 12 дней! Давайте восстановим привычку - ваш стресс заметно снижается после практики.',
          urgency: 'low'
        }
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationPress = (recommendation: PersonalizedRecommendation) => {
    setSelectedRecommendation(recommendation);
  };

  const handleFeedback = (recommendationId: string, helpful: boolean) => {
    console.log(`Feedback for ${recommendationId}: ${helpful ? 'helpful' : 'not helpful'}`);
    
    if (Platform.OS === 'web') {
      alert(helpful ? 'Спасибо за отзыв! Будем учитывать.' : 'Спасибо за отзыв! Постараемся улучшить рекомендации.');
    } else {
      Alert.alert(
        'Отзыв получен',
        helpful ? 'Спасибо за отзыв! Будем учитывать.' : 'Спасибо за отзыв! Постараемся улучшить рекомендации.'
      );
    }
  };

  const updateContext = async (newContext: any) => {
    setCurrentContext({ ...currentContext, ...newContext });
    await loadRecommendations(); // Перезагружаем рекомендации с новым контекстом
    setShowContextUpdate(false);
  };

  const executeRecommendation = (recommendation: PersonalizedRecommendation) => {
    switch (recommendation.type) {
      case 'technique':
        // Переход к странице техники
        console.log('Opening technique:', recommendation.id);
        break;
      case 'activity':
        // Запуск трекера активности
        console.log('Starting activity tracking:', recommendation.id);
        break;
      case 'social':
        // Открытие контактов или чата
        console.log('Opening social contact:', recommendation.id);
        break;
      case 'reminder':
        // Установка напоминания
        console.log('Setting reminder:', recommendation.id);
        break;
    }
    
    setSelectedRecommendation(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <MaterialIcons name="auto-awesome" size={50} color="#FF9800" />
        <Text style={styles.loadingText}>Анализируем ваши данные...</Text>
        <Text style={styles.loadingSubtext}>Создаем персональные рекомендации</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="auto-awesome" size={32} color="white" />
          <Text style={styles.headerTitle}>Персональные рекомендации</Text>
          <Text style={styles.headerSubtitle}>
            На основе анализа ваших данных и ИИ
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, fadeInAnimatedStyle]}>
        {/* Контекст пользователя */}
        <View style={styles.contextContainer}>
          <View style={styles.contextHeader}>
            <Text style={styles.contextTitle}>Ваше текущее состояние</Text>
            <TouchableOpacity
              style={styles.updateContextButton}
              onPress={() => setShowContextUpdate(true)}
            >
              <MaterialIcons name="edit" size={20} color="#FF9800" />
              <Text style={styles.updateContextText}>Обновить</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.contextMetrics}>
            <View style={styles.contextMetric}>
              <MaterialIcons name="mood" size={20} color="#4CAF50" />
              <Text style={styles.contextMetricLabel}>Настроение</Text>
              <Text style={styles.contextMetricValue}>{currentContext.mood}/5</Text>
            </View>
            <View style={styles.contextMetric}>
              <MaterialIcons name="battery-charging-full" size={20} color="#FF9800" />
              <Text style={styles.contextMetricLabel}>Энергия</Text>
              <Text style={styles.contextMetricValue}>{currentContext.energy}/5</Text>
            </View>
            <View style={styles.contextMetric}>
              <MaterialIcons name="psychology" size={20} color="#F44336" />
              <Text style={styles.contextMetricLabel}>Стресс</Text>
              <Text style={styles.contextMetricValue}>{currentContext.stress}/5</Text>
            </View>
          </View>
        </View>

        {/* Рекомендации */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>
            🎯 Рекомендации для вас ({recommendations.length})
          </Text>
          
          {recommendations.map((recommendation) => (
            <MemoizedRecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onPress={() => handleRecommendationPress(recommendation)}
              onFeedback={(helpful) => handleFeedback(recommendation.id, helpful)}
            />
          ))}
        </View>

        {/* Статистика эффективности */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>📊 Эффективность рекомендаций</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>87%</Text>
              <Text style={styles.statLabel}>Точность</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Выполнено</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>+23%</Text>
              <Text style={styles.statLabel}>Улучшение</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Modal для обновления контекста */}
      <Modal visible={showContextUpdate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Обновить состояние</Text>
            
            {/* Здесь были бы слайдеры для обновления контекста */}
            <Text style={styles.modalText}>Как вы себя чувствуете сейчас?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowContextUpdate(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryModalButton]}
                onPress={() => updateContext({ mood: 4, energy: 4, stress: 2 })}
              >
                <Text style={[styles.modalButtonText, styles.primaryModalButtonText]}>
                  Обновить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal для выполнения рекомендации */}
      <Modal visible={selectedRecommendation !== null} transparent animationType="slide">
        {selectedRecommendation && (
          <View style={styles.modalOverlay}>
            <View style={styles.executionModalContent}>
              <View style={styles.executionHeader}>
                <TouchableOpacity
                  onPress={() => setSelectedRecommendation(null)}
                  style={styles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.executionTitle}>{selectedRecommendation.title}</Text>
              </View>
              
              <ScrollView style={styles.executionBody}>
                <Text style={styles.executionDescription}>
                  {selectedRecommendation.description}
                </Text>
                
                <View style={styles.executionMeta}>
                  <Text style={styles.executionTime}>
                    ⏱ Время: {selectedRecommendation.timeToComplete} минут
                  </Text>
                  <Text style={styles.executionDifficulty}>
                    📊 Сложность: {selectedRecommendation.difficulty}
                  </Text>
                </View>
                
                <View style={styles.executionMessage}>
                  <Text style={styles.executionMessageText}>
                    {selectedRecommendation.personalizedMessage}
                  </Text>
                </View>
              </ScrollView>
              
              <TouchableOpacity
                style={styles.executeButton}
                onPress={() => executeRecommendation(selectedRecommendation)}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.executeButtonGradient}
                >
                  <MaterialIcons name="play-arrow" size={24} color="white" />
                  <Text style={styles.executeButtonText}>Начать выполнение</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
};

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
    fontSize: 18,
    color: '#FF9800',
    marginTop: 15,
    fontWeight: '600'
  },
  loadingSubtext: {
    fontSize: 14,
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
    marginTop: 4,
    textAlign: 'center'
  },
  content: {
    padding: 20
  },
  contextContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  contextTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  updateContextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  updateContextText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600'
  },
  contextMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  contextMetric: {
    alignItems: 'center',
    flex: 1
  },
  contextMetricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  contextMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 16
  },
  recommendationsContainer: {
    marginBottom: 20
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative'
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#FF9800'
  },
  cardContent: {
    padding: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  urgencyBadge: {
    padding: 4
  },
  confidenceBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  confidenceText: {
    color: '#2E7D4A',
    fontSize: 12,
    fontWeight: 'bold'
  },
  cardBody: {
    marginBottom: 16
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  personalizedMessage: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 12,
    gap: 8
  },
  personalizedMessageText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
    fontStyle: 'italic'
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 12,
    color: '#666'
  },
  reasoning: {
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3'
  },
  reasoningLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4
  },
  reasoningText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 16
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actionButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6
  },
  primaryActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 8
  },
  feedbackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0'
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800'
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: screenWidth * 0.9,
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center'
  },
  primaryModalButton: {
    backgroundColor: '#FF9800'
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  primaryModalButtonText: {
    color: 'white'
  },
  executionModalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 60,
    borderRadius: 15,
    maxHeight: '80%'
  },
  executionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  closeButton: {
    padding: 8,
    marginRight: 12
  },
  executionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  executionBody: {
    padding: 20,
    flex: 1
  },
  executionDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20
  },
  executionMeta: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  executionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  executionDifficulty: {
    fontSize: 14,
    color: '#666'
  },
  executionMessage: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  executionMessageText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
    fontStyle: 'italic'
  },
  executeButton: {
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  executeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8
  },
  executeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default PersonalizedRecommendationsPage;