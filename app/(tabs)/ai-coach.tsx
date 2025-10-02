import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Alert, Modal,
  Dimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecovery } from '../../hooks/useRecovery';
import { LocalAICoach, AIResponse, ConversationContext } from '../../services/localAICoach';
import NotificationService from '../../services/notificationService';

const { width: screenWidth } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  aiResponse?: AIResponse;
}

export default function EnhancedAICoach() {
  const insets = useSafeAreaInsets();
  const { soberDays, userProfile, getStreakDays } = useRecovery();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiCoach] = useState(() => new LocalAICoach());
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'notifications'>('chat');
  const [insights, setInsights] = useState<{ patterns: string[]; recommendations: string[] } | null>(null);
  const [notifications, setNotifications] = useState(NotificationService.getNotifications());
  const scrollViewRef = useRef<ScrollView>(null);

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

  useEffect(() => {
    initializeAI();
    initializeNotifications();
    loadInsights();
  }, []);

  const initializeAI = async () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Привет! Я ваш AI-коуч по восстановлению. ${soberDays > 0 ? `Поздравляю с ${soberDays} днями трезвости!` : 'Готов поддержать вас на пути к трезвости.'} Как дела сегодня?`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const initializeNotifications = async () => {
    try {
      await NotificationService.initialize();
      
      // Адаптивные уведомления на основе прогресса
      if (soberDays >= 0) {
        await NotificationService.scheduleAdaptiveNotifications(soberDays);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const loadInsights = () => {
    const aiInsights = aiCoach.getInsights();
    setInsights(aiInsights);
  };

  const getCurrentTimeOfDay = (): ConversationContext['timeOfDay'] => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

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
        userMood: 3, // Базовое настроение, можно улучшить анализом
        soberDays: soberDays,
        recentChallenges: [], // Можно добавить из профиля
        preferredTechniques: [], // Можно добавить из настроек
        timeOfDay: getCurrentTimeOfDay(),
        urgency: 'low' // Определяется AI
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
      
      // Обновляем инсайты
      loadInsights();
      
      // Отправляем уведомление при высоком уровне поддержки
      if (context.urgency === 'crisis' || inputText.toLowerCase().includes('помогите')) {
        await NotificationService.sendEmergencyNotification(
          'Помните: вы сильнее, чем думаете. Каждый момент трезвости - это победа.'
        );
      }

    } catch (error) {
      console.error('AI Response Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, возникла техническая проблема. Попробуйте еще раз или воспользуйтесь экстренной помощью.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getQuickSupport = async () => {
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
      
      // Экстренное уведомление
      await NotificationService.sendEmergencyNotification();
      
    } catch (error) {
      showWebAlert('Экстренная поддержка', 'Дышите глубоко. Это чувство временно. Обратитесь за профессиональной помощью при необходимости.');
    } finally {
      setIsTyping(false);
    }
  };

  const toggleNotification = async (notificationId: string, enabled: boolean) => {
    try {
      await NotificationService.toggleNotification(notificationId, enabled);
      setNotifications(NotificationService.getNotifications());
      showWebAlert('Настройки', `Уведомление ${enabled ? 'включено' : 'выключено'}`);
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось изменить настройки уведомлений');
    }
  };

  const renderMessage = (message: ChatMessage) => (
    <View key={message.id} style={[styles.messageContainer, message.isUser && styles.userMessageContainer]}>
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
            {/* Предложения действий */}
            {message.aiResponse.suggestions.length > 0 && (
              <View style={styles.suggestions}>
                <Text style={styles.suggestionsTitle}>💡 Рекомендации:</Text>
                {message.aiResponse.suggestions.map((suggestion, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.suggestionButton}
                    onPress={() => showWebAlert('Рекомендация', suggestion)}
                  >
                    <Text style={styles.suggestionText}>• {suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Ресурсы */}
            {message.aiResponse.resources.length > 0 && (
              <View style={styles.resources}>
                <Text style={styles.resourcesTitle}>📚 Полезные ресурсы:</Text>
                {message.aiResponse.resources.map((resource, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.resourceButton}
                    onPress={() => showWebAlert('Ресурс', `Открываем: ${resource}`)}
                  >
                    <MaterialIcons name="open-in-new" size={14} color="#007AFF" />
                    <Text style={styles.resourceText}>{resource}</Text>
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
    </View>
  );

  const renderChatTab = () => (
    <View style={styles.chatContainer}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingBubble}>
              <MaterialIcons name="psychology" size={16} color="#2E7D4A" />
              <Text style={styles.typingText}>Коуч печатает...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Быстрые действия */}
      <View style={styles.quickActionsBar}>
        <TouchableOpacity style={styles.emergencyButton} onPress={getQuickSupport}>
          <MaterialIcons name="emergency" size={20} color="white" />
          <Text style={styles.emergencyText}>SOS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.motivationButton}
          onPress={async () => {
            const motivation = await aiCoach.getMotivationalMessage(soberDays);
            const motMessage: ChatMessage = {
              id: Date.now().toString(),
              text: motivation,
              isUser: false,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, motMessage]);
          }}
        >
          <MaterialIcons name="auto-awesome" size={20} color="white" />
          <Text style={styles.motivationText}>Мотивация</Text>
        </TouchableOpacity>
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
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!inputText.trim()}>
          <MaterialIcons name="send" size={24} color={inputText.trim() ? "#2E7D4A" : "#CCC"} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );

  const renderInsightsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.insightsHeader}>
        <MaterialIcons name="analytics" size={32} color="#2E7D4A" />
        <Text style={styles.insightsTitle}>Анализ поведения</Text>
      </View>

      {insights && (
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

      <TouchableOpacity 
        style={styles.clearButton}
        onPress={() => {
          aiCoach.clearHistory();
          loadInsights();
          showWebAlert('История очищена', 'История разговоров удалена');
        }}
      >
        <MaterialIcons name="clear-all" size={20} color="white" />
        <Text style={styles.clearButtonText}>Очистить историю</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderNotificationsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.notificationsHeader}>
        <MaterialIcons name="notifications" size={32} color="#FF9500" />
        <Text style={styles.notificationsTitle}>Уведомления поддержки</Text>
      </View>

      <View style={styles.notificationInfo}>
        <MaterialIcons name="info" size={20} color="#007AFF" />
        <Text style={styles.infoText}>
          Персонализированные уведомления помогут поддерживать мотивацию и напоминать о важных моментах
        </Text>
      </View>

      {notifications.map((notification) => (
        <View key={notification.id} style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationBody}>{notification.body}</Text>
              <Text style={styles.notificationSchedule}>
                {notification.trigger.type === 'daily' 
                  ? `Ежедневно в ${notification.trigger.hour?.toString().padStart(2, '0')}:${notification.trigger.minute?.toString().padStart(2, '0')}` 
                  : notification.trigger.type === 'weekly'
                  ? `Еженедельно (день ${notification.trigger.weekday})`
                  : 'По расписанию'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.toggleButton, notification.enabled && styles.toggleButtonActive]}
              onPress={() => toggleNotification(notification.id, !notification.enabled)}
            >
              <MaterialIcons 
                name={notification.enabled ? "notifications-active" : "notifications-off"} 
                size={24} 
                color={notification.enabled ? "white" : "#999"} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {notification.category === 'motivation' && '💪 Мотивация'}
              {notification.category === 'reminder' && '⏰ Напоминание'}
              {notification.category === 'emergency' && '🆘 Экстренная'}
              {notification.category === 'celebration' && '🎉 Праздник'}
              {notification.category === 'exercise' && '🧘 Упражнение'}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity 
        style={styles.testNotificationButton}
        onPress={async () => {
          await NotificationService.sendEmergencyNotification('Это тестовое уведомление поддержки. Вы делаете отличную работу! 💪');
          showWebAlert('Тест', 'Тестовое уведомление отправлено');
        }}
      >
        <MaterialIcons name="notification-important" size={20} color="white" />
        <Text style={styles.testButtonText}>Отправить тестовое уведомление</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>AI-Коуч 2.0</Text>
        <View style={styles.headerStats}>
          <MaterialIcons name="psychology" size={20} color="#2E7D4A" />
          <Text style={styles.headerStatsText}>Дней: {soberDays}</Text>
        </View>
      </View>

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
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerStatsText: {
    fontSize: 14,
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
    paddingVertical: 12,
    marginHorizontal: 2,
    borderRadius: 20,
    gap: 6
  },
  activeTab: {
    backgroundColor: '#2E7D4A'
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  activeTabLabel: {
    color: 'white'
  },
  content: {
    flex: 1
  },
  chatContainer: {
    flex: 1
  },
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    padding: 15,
    gap: 10
  },
  messageContainer: {
    alignItems: 'flex-start'
  },
  userMessageContainer: {
    alignItems: 'flex-end'
  },
  messageBubble: {
    maxWidth: screenWidth * 0.8,
    padding: 12,
    borderRadius: 16,
    marginBottom: 4
  },
  userBubble: {
    backgroundColor: '#2E7D4A',
    borderBottomRightRadius: 4
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20
  },
  userMessageText: {
    color: 'white'
  },
  aiMessageText: {
    color: '#333'
  },
  aiExtras: {
    marginTop: 12,
    gap: 8
  },
  suggestions: {
    backgroundColor: '#F0F8F0',
    padding: 10,
    borderRadius: 8
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 6
  },
  suggestionButton: {
    paddingVertical: 2
  },
  suggestionText: {
    fontSize: 13,
    color: '#4A6741',
    lineHeight: 18
  },
  resources: {
    backgroundColor: '#F0F5FF',
    padding: 10,
    borderRadius: 8
  },
  resourcesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 6
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 4
  },
  resourceText: {
    fontSize: 13,
    color: '#007AFF'
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    textAlign: 'right'
  },
  typingIndicator: {
    alignItems: 'flex-start'
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 16,
    gap: 6
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666'
  },
  quickActionsBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6
  },
  emergencyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  motivationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6
  },
  motivationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: 'white',
    gap: 10
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100
  },
  sendButton: {
    padding: 10
  },
  tabContent: {
    padding: 20,
    gap: 20
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 12
  },
  patternText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 6
  },
  recommendationText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 6
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  notificationsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500'
  },
  notificationInfo: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    gap: 10
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15
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
    lineHeight: 20,
    marginBottom: 6
  },
  notificationSchedule: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10
  },
  toggleButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0'
  },
  toggleButtonActive: {
    backgroundColor: '#2E7D4A'
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666'
  },
  testNotificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    paddingVertical: 15,
    borderRadius: 25,
    gap: 8
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});