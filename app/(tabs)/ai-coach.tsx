import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Platform, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AICoachService, AICoachMessage, PredictiveInsight, PersonalizedPlan, TriggerPattern } from '../services/aiCoachService';

const { width: screenWidth } = Dimensions.get('window');

export default function AICoachDashboard() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PersonalizedPlan | null>(null);
  const [triggerPatterns, setTriggerPatterns] = useState<TriggerPattern[]>([]);
  const [activeTab, setActiveTab] = useState<'coach' | 'insights' | 'plan' | 'patterns'>('coach');

  // Web alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  // Анимация
  const pulseAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(0);

  useEffect(() => {
    loadAIData();
    
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );

    slideAnimation.value = withSpring(1);
  }, []);

  const loadAIData = () => {
    // Симуляция данных пользователя
    const userData = {
      mood: 3,
      cravingLevel: 2,
      stressLevel: 3,
      healthMetrics: {
        sleepQuality: 4 as 1 | 2 | 3 | 4 | 5,
        stressLevel: 3 as 1 | 2 | 3 | 4 | 5,
        energyLevel: 4 as 1 | 2 | 3 | 4 | 5,
      },
      recentEvents: ['work_stress', 'social_event']
    };

    const coachMessages = AICoachService.analyzeUserBehavior(userData);
    const predictiveInsights = AICoachService.generatePredictiveInsights(userData);
    const plan = AICoachService.createPersonalizedPlan(userData, 'stabilization');
    const patterns = AICoachService.detectTriggerPatterns([]);

    setMessages(coachMessages);
    setInsights(predictiveInsights);
    setCurrentPlan(plan);
    setTriggerPatterns(patterns);
  };

  const handleMessageAction = (action: string) => {
    switch (action) {
      case 'emergency_techniques':
        showWebAlert('Экстренные техники', 'Переходим к техникам экстренной помощи...');
        break;
      case 'breathing_exercise':
        showWebAlert('Дыхательное упражнение', 'Начинаем дыхательную технику 4-7-8...');
        break;
      case 'contact_support':
        showWebAlert('Поддержка', 'Соединяем с системой поддержки...');
        break;
      default:
        showWebAlert('Действие', `Выполняется: ${action}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'crisis': return 'emergency';
      case 'warning': return 'warning';
      case 'celebration': return 'celebration';
      case 'guidance': return 'lightbulb';
      default: return 'psychology';
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnimation.value * 0 }],
    opacity: slideAnimation.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulseAnimation.value * 0.1 }],
  }));

  const renderCoachTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {/* AI Coach Header */}
      <View style={styles.coachHeader}>
        <Animated.View style={[styles.coachAvatar, pulseStyle]}>
          <MaterialIcons name="psychology" size={40} color="#2E7D4A" />
        </Animated.View>
        <View style={styles.coachInfo}>
          <Text style={styles.coachName}>Ваш AI-Коуч</Text>
          <Text style={styles.coachStatus}>Анализирую ваш прогресс...</Text>
        </View>
      </View>

      {/* Сообщения от коуча */}
      <View style={styles.messagesContainer}>
        <Text style={styles.sectionTitle}>Персональные рекомендации</Text>
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageCard, { borderLeftColor: getPriorityColor(message.priority) }]}>
            <View style={styles.messageHeader}>
              <MaterialIcons 
                name={getMessageIcon(message.type) as any} 
                size={24} 
                color={getPriorityColor(message.priority)} 
              />
              <Text style={[styles.messageTime, { color: getPriorityColor(message.priority) }]}>
                {message.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={styles.messageText}>{message.message}</Text>
            {message.actions && (
              <View style={styles.messageActions}>
                {message.actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.actionButton, { backgroundColor: getPriorityColor(message.priority) }]}
                    onPress={() => handleMessageAction(action.action)}
                  >
                    <Text style={styles.actionButtonText}>{action.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Быстрые действия */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Быстрые действия</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.quickActionCard}>
            <MaterialIcons name="emergency" size={32} color="#FF3B30" />
            <Text style={styles.quickActionText}>SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <MaterialIcons name="self-improvement" size={32} color="#007AFF" />
            <Text style={styles.quickActionText}>Медитация</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <MaterialIcons name="chat" size={32} color="#34C759" />
            <Text style={styles.quickActionText}>Поддержка</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <MaterialIcons name="analytics" size={32} color="#FF9500" />
            <Text style={styles.quickActionText}>Прогресс</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderInsightsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.insightsHeader}>
        <MaterialIcons name="trending-up" size={32} color="#2E7D4A" />
        <Text style={styles.insightsTitle}>Предиктивная аналитика</Text>
      </View>

      {insights.map((insight) => (
        <View key={insight.id} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{insight.confidence}%</Text>
            </View>
          </View>
          
          <Text style={styles.insightDescription}>{insight.description}</Text>
          
          <View style={styles.recommendationContainer}>
            <MaterialIcons name="lightbulb" size={20} color="#FF9500" />
            <Text style={styles.recommendationText}>{insight.recommendation}</Text>
          </View>

          <View style={styles.insightMeta}>
            <Text style={styles.insightType}>
              {insight.type === 'risk_prediction' ? 'Прогноз риска' :
               insight.type === 'success_probability' ? 'Вероятность успеха' :
               insight.type === 'trigger_alert' ? 'Предупреждение о триггере' : 'Оптимальное время'}
            </Text>
            <Text style={styles.validUntil}>
              Актуально до: {insight.validUntil.toLocaleDateString('ru')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderPlanTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {currentPlan && (
        <>
          <View style={styles.planHeader}>
            <MaterialIcons name="assignment" size={32} color="#2E7D4A" />
            <View>
              <Text style={styles.planTitle}>{currentPlan.name}</Text>
              <Text style={styles.planPhase}>Фаза: {currentPlan.phase}</Text>
            </View>
          </View>

          {/* Прогресс плана */}
          <View style={styles.planProgress}>
            <Text style={styles.progressTitle}>Прогресс выполнения</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '35%' }]} />
            </View>
            <Text style={styles.progressText}>День 8 из {currentPlan.duration}</Text>
          </View>

          {/* Ежедневные задачи */}
          <View style={styles.dailyTasks}>
            <Text style={styles.sectionTitle}>Сегодняшние задачи</Text>
            
            {Object.entries(currentPlan.dailyTasks).map(([period, tasks]) => (
              <View key={period} style={styles.taskPeriod}>
                <Text style={styles.periodTitle}>
                  {period === 'morning' ? 'Утро' : period === 'afternoon' ? 'День' : 'Вечер'}
                </Text>
                {tasks.map((task, index) => (
                  <TouchableOpacity key={index} style={styles.taskItem}>
                    <MaterialIcons name="check-box-outline-blank" size={20} color="#2E7D4A" />
                    <Text style={styles.taskText}>{task}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Контрольные точки */}
          <View style={styles.checkpoints}>
            <Text style={styles.sectionTitle}>Ближайшие достижения</Text>
            {currentPlan.checkpoints.map((checkpoint) => (
              <View key={checkpoint.day} style={styles.checkpointItem}>
                <View style={styles.checkpointDay}>
                  <Text style={styles.checkpointDayText}>День {checkpoint.day}</Text>
                </View>
                <View style={styles.checkpointInfo}>
                  <Text style={styles.checkpointMilestone}>{checkpoint.milestone}</Text>
                  <Text style={styles.checkpointReward}>Награда: {checkpoint.reward}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderPatternsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.patternsHeader}>
        <MaterialIcons name="pattern" size={32} color="#FF6B6B" />
        <Text style={styles.patternsTitle}>Анализ триггеров</Text>
      </View>

      {triggerPatterns.map((pattern) => (
        <View key={pattern.id} style={styles.patternCard}>
          <View style={styles.patternHeader}>
            <Text style={styles.patternName}>{pattern.name}</Text>
            <View style={[styles.severityBadge, { 
              backgroundColor: pattern.severity >= 4 ? '#FF6B6B' : pattern.severity >= 3 ? '#FF9500' : '#34C759'
            }]}>
              <Text style={styles.severityText}>{pattern.severity}/5</Text>
            </View>
          </View>

          <Text style={styles.patternDescription}>{pattern.description}</Text>
          <Text style={styles.patternFrequency}>Частота: {pattern.frequency} раз в месяц</Text>

          <View style={styles.countermeasures}>
            <Text style={styles.countermeasuresTitle}>Способы преодоления:</Text>
            {pattern.countermeasures.map((measure, index) => (
              <View key={index} style={styles.countermeasureItem}>
                <MaterialIcons name="lightbulb" size={16} color="#FF9500" />
                <Text style={styles.countermeasureText}>{measure}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>AI-Коуч</Text>
        <TouchableOpacity onPress={loadAIData}>
          <MaterialIcons name="refresh" size={24} color="#2E7D4A" />
        </TouchableOpacity>
      </View>

      {/* Табы */}
      <View style={styles.tabBar}>
        {[
          { key: 'coach', icon: 'psychology', label: 'Коуч' },
          { key: 'insights', icon: 'insights', label: 'Анализ' },
          { key: 'plan', icon: 'assignment', label: 'План' },
          { key: 'patterns', icon: 'pattern', label: 'Триггеры' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <MaterialIcons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? 'white' : '#2E7D4A'} 
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View style={[styles.content, animatedStyle]}>
        {activeTab === 'coach' && renderCoachTab()}
        {activeTab === 'insights' && renderInsightsTab()}
        {activeTab === 'plan' && renderPlanTab()}
        {activeTab === 'patterns' && renderPatternsTab()}
      </Animated.View>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, minWidth: 280, maxWidth: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{alertConfig.title}</Text>
              <Text style={{ fontSize: 16, marginBottom: 20, lineHeight: 22 }}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#2E7D4A', padding: 10, borderRadius: 4, alignItems: 'center' }}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 15,
    gap: 4
  },
  activeTab: {
    backgroundColor: '#2E7D4A'
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  activeTabLabel: {
    color: 'white'
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: 20,
    gap: 20
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    gap: 15
  },
  coachAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  coachInfo: {
    flex: 1
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 4
  },
  coachStatus: {
    fontSize: 14,
    color: '#666'
  },
  messagesContainer: {
    gap: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  messageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  messageTime: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15
  },
  messageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white'
  },
  quickActions: {
    gap: 15
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: (screenWidth - 60) / 2,
    gap: 8
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20
  },
  insightsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    flex: 1,
    marginRight: 10
  },
  confidenceBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  insightDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15
  },
  recommendationContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 10
  },
  recommendationText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
    lineHeight: 20
  },
  insightMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  insightType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666'
  },
  validUntil: {
    fontSize: 12,
    color: '#999'
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    gap: 15
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  planPhase: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  planProgress: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D4A',
    borderRadius: 4
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  dailyTasks: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15
  },
  taskPeriod: {
    marginBottom: 20
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    flex: 1
  },
  checkpoints: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15
  },
  checkpointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15
  },
  checkpointDay: {
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20
  },
  checkpointDayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white'
  },
  checkpointInfo: {
    flex: 1
  },
  checkpointMilestone: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 4
  },
  checkpointReward: {
    fontSize: 14,
    color: '#666'
  },
  patternsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20
  },
  patternsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B'
  },
  patternCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  patternName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    flex: 1,
    marginRight: 10
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white'
  },
  patternDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8
  },
  patternFrequency: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15
  },
  countermeasures: {
    gap: 8
  },
  countermeasuresTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 8
  },
  countermeasureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  countermeasureText: {
    fontSize: 13,
    color: '#333',
    flex: 1
  }
});