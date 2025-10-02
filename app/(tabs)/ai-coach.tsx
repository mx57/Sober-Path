
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Alert, Modal,
  Dimensions, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRecovery } from '../../hooks/useRecovery';
import { LocalAICoach, AIResponse, ConversationContext } from '../../services/localAICoach';
import NotificationService from '../../services/notificationService';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  aiResponse?: AIResponse;
}

// Мемоизированные компоненты для оптимизации
const MemoizedMessage = React.memo(({ message }: { message: ChatMessage }) => {
  const fadeValue = useSharedValue(0);
  const [alertConfig, setAlertConfig] = useState<{visible: boolean; title: string; message: string}>({visible: false, title: '', message: ''});

  const showAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message });
    } else {
      Alert.alert(title, message);
    }
  }, []);

  useEffect(() => {
    fadeValue.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
    transform: [{ translateY: (1 - fadeValue.value) * 20 }]
  }));

  return (
    <Animated.View style={[styles.messageContainer, message.isUser && styles.userMessageContainer, animatedStyle]}>
      <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
        {!message.isUser && (
          <View style={styles.aiHeader}>
            <MaterialIcons name="psychology" size={16} color="#2E7D4A" />
            <Text style={styles.aiLabel}>AI-Коуч</Text>
          </View>
        )}
        
        <Text style={[styles.messageText, message.isUser ? styles.userMessageText : styles.aiMessageText]}>
          {message.text}
        </Text>
        
        {message.aiResponse && (
          <View style={styles.aiExtras}>
            {message.aiResponse.suggestions.length > 0 && (
              <View style={styles.suggestions}>
                <Text style={styles.suggestionsTitle}>💡 Рекомендации:</Text>
                {message.aiResponse.suggestions.slice(0, 3).map((suggestion, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.suggestionButton}
                    onPress={() => showAlert('Рекомендация', suggestion)}
                  >
                    <Text style={styles.suggestionText}>• {suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.webAlertOverlay}>
            <View style={styles.webAlertContent}>
              <Text style={styles.webAlertTitle}>{alertConfig.title}</Text>
              <Text style={styles.webAlertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={styles.webAlertButton}
                onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.webAlertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </Animated.View>
  );
});

const MemoizedQuickAction = React.memo(({ icon, label, onPress, color }: {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
}) => {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  const handlePress = useCallback(() => {
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  }, [onPress, scaleValue]);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: color }]} onPress={handlePress}>
        <MaterialIcons name={icon as any} size={20} color="white" />
        <Text style={styles.quickActionText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

function EnhancedAICoach() {
  const insets = useSafeAreaInsets();
  const { soberDays, userProfile, getStreakDays } = useRecovery();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'notifications'>('chat');
  const [insights, setInsights] = useState<{ patterns: string[]; recommendations: string[] } | null>(null);
  // Corrected the type of `notifications` to match `NotificationService.getNotifications()`
  const [notifications, setNotifications] = useState<any[]>(NotificationService.getNotifications());
  const scrollViewRef = useRef<ScrollView>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  // Мемоизированный AI-коуч
  const aiCoach = useMemo(() => new LocalAICoach(), []);

  // Анимации
  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withSpring(1, { duration: 500 });
    contentOpacity.value = withTiming(1, { duration: 800 });
    initializeAI();
    initializeNotifications();
    loadInsights();
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerScale.value
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value
  }));

  const showWebAlert = useCallback((title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  }, []);

  const initializeAI = useCallback(async () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Привет! Я ваш AI-коуч по восстановлению. ${soberDays > 0 ? `Поздравляю с ${soberDays} днями трезвости!` : 'Готов поддержать вас на пути к трезвости.'} Как дела сегодня?`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [soberDays]);

  const initializeNotifications = useCallback(async () => {
    try {
      await NotificationService.initialize();
      if (soberDays >= 0) {
        // Assuming NotificationService.getNotifications() might return a new array
        // or the previously set notifications might be outdated after initialization/scheduling
        await NotificationService.scheduleAdaptiveNotifications(soberDays);
        setNotifications(NotificationService.getNotifications()); // Refresh notifications after scheduling
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }, [soberDays]);

  const loadInsights = useCallback(() => {
    const aiInsights = aiCoach.getInsights();
    setInsights(aiInsights);
  }, [aiCoach]);

  const getCurrentTimeOfDay = useCallback((): ConversationContext['timeOfDay'] => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const context: ConversationContext = {
        userMood: 3,
        soberDays: soberDays,
        recentChallenges: [],
        preferredTechniques: [],
        timeOfDay: getCurrentTimeOfDay(),
        urgency: 'low'
      };

      const aiResponse = await aiCoach.getResponse(inputText.trim(), context);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.message,
        isUser: false,
        timestamp: new Date(),
        aiResponse
      };

      setMessages(prev => [...prev, aiMessage]);
      loadInsights();

      if (inputText.toLowerCase().includes('помогите') || inputText.toLowerCase().includes('плохо')) {
        await NotificationService.sendEmergencyNotification(
          'Помните: вы сильнее, чем думаете. Каждый момент трезвости - это победа.'
        );
      }

    } catch (error) {
      console.error('AI Response Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, возникла проблема. Попробуйте еще раз или воспользуйтесь экстренной помощью.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputText, isTyping, soberDays, getCurrentTimeOfDay, aiCoach, loadInsights]);

  const getQuickSupport = useCallback(async () => {
    if (isTyping) return;
    
    setIsTyping(true);
    
    try {
      const quickResponse = await aiCoach.getQuickSupport('crisis');
      
      const supportMessage: ChatMessage = {
        id: Date.now().toString(),
        text: quickResponse.message,
        isUser: false,
        timestamp: new Date(),
        aiResponse: quickResponse
      };

      setMessages(prev => [...prev, supportMessage]);
      await NotificationService.sendEmergencyNotification();
      
    } catch (error) {
      showWebAlert('Экстренная поддержка', 'Дышите глубоко. Это чувство временно. Обратитесь за профессиональной помощью при необходимости.');
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, aiCoach, showWebAlert]);

  const getMotivation = useCallback(async () => {
    if (isTyping) return;

    setIsTyping(true);
    try {
      const motivation = await aiCoach.getMotivationalMessage(soberDays);
      const motMessage: ChatMessage = {
        id: Date.now().toString(),
        text: motivation,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, motMessage]);
    } catch (error) {
      showWebAlert('Мотивация', 'Вы делаете отличную работу! Каждый день трезвости - это победа!');
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, aiCoach, soberDays, showWebAlert]);

  const quickActions = useMemo(() => [
    { icon: 'emergency', label: 'SOS', onPress: getQuickSupport, color: '#FF6B6B' },
    { icon: 'auto-awesome', label: 'Мотивация', onPress: getMotivation, color: '#007AFF' },
    { icon: 'self-improvement', label: 'Дыхание', onPress: () => showWebAlert('Упражнение', 'Глубоко вдохните на 4 счета, задержите на 4, выдохните на 6. Повторите 5 раз.'), color: '#4CAF50' },
    { icon: 'favorite', label: 'Поддержка', onPress: () => showWebAlert('Поддержка', 'Вы не одиноки. Многие прошли этот путь и стали сильнее. Вы тоже справитесь!'), color: '#FF9800' }
  ], [getQuickSupport, getMotivation, showWebAlert]);

  const renderChatTab = useCallback(() => (
    <Animated.View style={[styles.chatContainer, contentAnimatedStyle]}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(message => (
          <MemoizedMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#2E7D4A" />
              <Text style={styles.typingText}>Коуч печатает...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Быстрые действия */}
      <View style={styles.quickActionsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <MemoizedQuickAction
                key={index}
                icon={action.icon}
                label={action.label}
                onPress={action.onPress}
                color={action.color}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Ввод сообщения */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Напишите сообщение..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          editable={!isTyping}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]} 
          onPress={sendMessage} 
          disabled={!inputText.trim() || isTyping}
        >
          {isTyping ? (
            <ActivityIndicator size="small" color="#CCC" />
          ) : (
            <MaterialIcons name="send" size={24} color={inputText.trim() ? "#2E7D4A" : "#CCC"} />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Animated.View>
  ), [contentAnimatedStyle, messages, isTyping, quickActions, inputText, sendMessage]);

  const renderInsightsTab = useCallback(() => (
    <Animated.View style={[styles.tabContent, contentAnimatedStyle]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.insightsHeader}>
          <MaterialIcons name="analytics" size={32} color="#2E7D4A" />
          <Text style={styles.insightsTitle}>Анализ поведения</Text>
        </View>

        {insights ? (
          <>
            <View style={styles.insightCard}>
              <Text style={styles.cardTitle}>📊 Обнаруженные паттерны</Text>
              {insights.patterns.map((pattern, index) => (
                <Text key={index} style={styles.patternText}>• {pattern}</Text>
              ))}
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.cardTitle}>💡 Персональные рекомендации</Text>
              {insights.recommendations.map((recommendation, index) => (
                <Text key={index} style={styles.recommendationText}>• {recommendation}</Text>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2E7D4A" />
            <Text style={styles.loadingText}>Анализируем ваши данные...</Text>
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>📈 Статистика общения</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Всего сообщений:</Text>
            <Text style={styles.statValue}>{messages.filter(m => m.isUser).length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Дней трезвости:</Text>
            <Text style={styles.statValue}>{soberDays}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Текущая серия:</Text>
            <Text style={styles.statValue}>{getStreakDays()}</Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  ), [contentAnimatedStyle, insights, messages, soberDays, getStreakDays]);

  const renderNotificationsTab = useCallback(() => (
    <Animated.View style={[styles.tabContent, contentAnimatedStyle]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.notificationsHeader}>
          <MaterialIcons name="notifications" size={32} color="#FF9500" />
          <Text style={styles.notificationsTitle}>Уведомления поддержки</Text>
        </View>

        <View style={styles.notificationInfo}>
          <MaterialIcons name="info" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            Персонализированные уведомления помогут поддерживать мотивацию
          </Text>
        </View>

        {/* Removed the `notificationInfo` component from inside the map item, as it's typically for the whole section */}
        {notifications.slice(0, 5).map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            {/* The outer View with style notificationInfo is incorrect,
                it should be a separate header/info section or applied differently */}
            {/* Fixed the structure here: Assuming `notification.title` and `notification.body` are direct children */}
            <View style={styles.notificationContentWrapper}> {/* Added a wrapper for content and toggle */}
              <View style={styles.notificationTextContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationBody}>{notification.body}</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.toggleButton, notification.enabled && styles.toggleButtonActive]}
                onPress={() => {
                  // Toggle логика
                  // This part typically involves updating the state for `notifications`
                  // For now, it just shows an alert.
                  showWebAlert('Настройки', `Уведомление ${notification.enabled ? 'выключено' : 'включено'}`);
                }}
              >
                <MaterialIcons 
                  name={notification.enabled ? "notifications-active" : "notifications-off"} 
                  size={24} 
                  color={notification.enabled ? "white" : "#999"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  ), [contentAnimatedStyle, notifications, showWebAlert]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.headerGradient}>
          <MaterialIcons name="psychology" size={32} color="white" />
          <Text style={styles.title}>AI-Коуч 2.0</Text>
          <View style={styles.headerStats}>
            <MaterialIcons name="timeline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.headerStatsText}>Дней: {soberDays}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Табы */}
      <View style={styles.tabBar}>
        {[
          { key: 'chat', icon: 'chat', label: 'Чат' },
          { key: 'insights', icon: 'analytics', label: 'Анализ' },
          { key: 'notifications', icon: 'notifications', label: 'Уведомления' }
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

      <View style={styles.content}>
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'insights' && renderInsightsTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
      </View>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.webAlertOverlay}>
            <View style={styles.webAlertContent}>
              <Text style={styles.webAlertTitle}>{alertConfig.title}</Text>
              <Text style={styles.webAlertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={styles.webAlertButton}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={styles.webAlertButtonText}>OK</Text>
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
    margin: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  headerGradient: {
    padding: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8
  },
  headerStatsText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6
  },
  activeTab: {
    backgroundColor: '#2E7D4A'
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D4A'
  },
  activeTabLabel: {
    color: 'white'
  },
  content: {
    flex: 1,
    marginTop: 15
  },
  chatContainer: {
    flex: 1
  },
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    padding: 15,
    gap: 12
  },
  messageContainer: {
    alignItems: 'flex-start'
  },
  userMessageContainer: {
    alignItems: 'flex-end'
  },
  messageBubble: {
    maxWidth: screenWidth * 0.8,
    padding: 14,
    borderRadius: 18,
    marginBottom: 4
  },
  userBubble: {
    backgroundColor: '#2E7D4A',
    borderBottomRightRadius: 6
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2E7D4A',
    textTransform: 'uppercase'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  userMessageText: {
    color: 'white'
  },
  aiMessageText: {
    color: '#333'
  },
  aiExtras: {
    marginTop: 12,
    gap: 10
  },
  suggestions: {
    backgroundColor: '#F0F8F0',
    padding: 12,
    borderRadius: 12
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8
  },
  suggestionButton: {
    paddingVertical: 2
  },
  suggestionText: {
    fontSize: 13,
    color: '#4A6741',
    lineHeight: 20
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'right'
  },
  typingIndicator: {
    alignItems: 'flex-start'
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 18,
    gap: 8
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666'
  },
  quickActionsBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  quickActionsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 10
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  quickActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: 'white',
    gap: 12
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F8F9FA'
  },
  sendButton: {
    padding: 12,
    borderRadius: 22
  },
  sendButtonDisabled: {
    opacity: 0.5
  },
  tabContent: {
    flex: 1
  },
  scrollContent: {
    padding: 20,
    gap: 20
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  insightsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  loadingText: {
    fontSize: 16,
    color: '#2E7D4A',
    marginTop: 15,
    fontWeight: '500'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  patternText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8
  },
  recommendationText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  statLabel: {
    fontSize: 16,
    color: '#666'
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  notificationsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9500'
  },
  notificationInfo: { // This style seems to be for a general info banner, not for individual cards
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    gap: 12,
    marginBottom: 15, // Added margin to separate it from notification cards
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 10, // Add margin between cards
  },
  notificationContentWrapper: { // New style to structure content and toggle
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between', // Distribute items horizontally
    gap: 15, // Gap between text content and toggle button
  },
  notificationTextContent: { // New style for the text part of the notification
    flex: 1, // Allow text content to take up available space
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 6
  },
  notificationBody: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  toggleButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0'
  },
  toggleButtonActive: {
    backgroundColor: '#2E7D4A'
  },
  webAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  webAlertContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    minWidth: 320,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  webAlertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  webAlertMessage: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
    lineHeight: 22
  },
  webAlertButton: {
    backgroundColor: '#2E7D4A',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  webAlertButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default React.memo(EnhancedAICoach);
