// Продвинутый AI чат компонент

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert
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
import AdvancedAIChat, { ChatMessage, ActionSuggestion } from '../../services/advancedAIChat';

const { width: screenWidth } = Dimensions.get('window');

interface AIAssistantPageProps {
  initialContext?: {
    mood: number;
    cravingLevel: number;
    stressLevel: number;
  };
}

// Компонент сообщения в чате
const MessageBubble = React.memo(({ message, onSuggestionPress }: {
  message: ChatMessage;
  onSuggestionPress: (suggestion: ActionSuggestion) => void;
}) => {
  const isUser = message.senderType === 'user';
  const isEmergency = message.messageType === 'emergency';
  
  const scaleValue = useSharedValue(0);
  const slideValue = useSharedValue(isUser ? 50 : -50);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      { translateX: slideValue.value }
    ]
  }));

  useEffect(() => {
    scaleValue.value = withSpring(1, { damping: 15 });
    slideValue.value = withSpring(0, { damping: 15 });
  }, []);

  const getBubbleColor = () => {
    if (isEmergency) return ['#FF5722', '#FF3D00'];
    if (isUser) return ['#2196F3', '#1976D2'];
    return ['#4CAF50', '#388E3C'];
  };

  const getTextColor = () => {
    return isUser || isEmergency ? 'white' : 'white';
  };

  return (
    <Animated.View style={[
      styles.messageContainer,
      isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      animatedStyle
    ]}>
      <LinearGradient
        colors={getBubbleColor()}
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isEmergency && styles.emergencyBubble
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <MaterialIcons 
              name={isEmergency ? "emergency" : "psychology"} 
              size={16} 
              color="white" 
            />
          </View>
        )}
        
        <Text style={[styles.messageText, { color: getTextColor() }]}>
          {message.content}
        </Text>
        
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </LinearGradient>


      {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {message.metadata.suggestions.map(suggestion => (
            <TouchableOpacity
              key={suggestion.id}
              style={[
                styles.suggestionButton,
                suggestion.type === 'emergency' && styles.emergencySuggestion
              ]}
              onPress={() => onSuggestionPress(suggestion)}
            >
              <MaterialIcons 
                name={getSuggestionIcon(suggestion.type)} 
                size={16} 
                color={suggestion.type === 'emergency' ? '#FF5722' : '#4CAF50'} 
              />
              <Text style={[
                styles.suggestionText,
                suggestion.type === 'emergency' && styles.emergencySuggestionText
              ]}>
                {suggestion.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
});

// Компонент быстрых ответов
const QuickResponses = React.memo(({ onSelect, currentMood }: {
  onSelect: (response: string) => void;
  currentMood: number;
}) => {
  const getQuickResponses = () => {
    if (currentMood <= 2) {
      return [
        "Мне тяжело сегодня",
        "Нужна поддержка",
        "Чувствую тягу",
        "Хочу поговорить"
      ];
    } else if (currentMood >= 4) {
      return [
        "У меня хороший день!",
        "Хочу поделиться прогрессом",
        "Все идет хорошо",
        "Благодарен за поддержку"
      ];
    } else {
      return [
        "Как дела?",
        "Нужен совет",
        "Расскажи что-нибудь мотивирующее",
        "Какие техники посоветуешь?"
      ];
    }
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.quickResponsesContainer}
      contentContainerStyle={styles.quickResponsesContent}
    >
      {getQuickResponses().map((response, index) => (
        <TouchableOpacity
          key={index}
          style={styles.quickResponseButton}
          onPress={() => onSelect(response)}
        >
          <Text style={styles.quickResponseText}>{response}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

// Индикатор печати ИИ
const TypingIndicator = React.memo(() => {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  const animatedStyle1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const animatedStyle2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const animatedStyle3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  useEffect(() => {
    const animate = () => {
      dot1.value = withTiming(1, { duration: 400 }, () => {
        dot1.value = withTiming(0.3, { duration: 400 });
      });
      
      setTimeout(() => {
        dot2.value = withTiming(1, { duration: 400 }, () => {
          dot2.value = withTiming(0.3, { duration: 400 });
        });
      }, 200);
      
      setTimeout(() => {
        dot3.value = withTiming(1, { duration: 400 }, () => {
          dot3.value = withTiming(0.3, { duration: 400 });
        });
      }, 400);
    };

    animate();
    const interval = setInterval(animate, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.typingDot, animatedStyle1]} />
          <Animated.View style={[styles.typingDot, animatedStyle2]} />
          <Animated.View style={[styles.typingDot, animatedStyle3]} />
        </View>
      </View>
    </View>
  );
});

// Основной компонент AI Assistant
const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ initialContext }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [aiChat] = useState(() => new AdvancedAIChat());
  const [isTyping, setIsTyping] = useState(false);
  const [currentContext, setCurrentContext] = useState(
    initialContext || { mood: 3, cravingLevel: 2, stressLevel: 3 }
  );

  // Приветственное сообщение при первом запуске
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome_1',
      senderId: 'ai_coach',
      senderType: 'ai',
      content: 'Привет! Я ваш ИИ-помощник в пути к выздоровлению. Я здесь, чтобы поддержать вас, выслушать и помочь справиться с любыми трудностями. Как дела сегодня?',
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        suggestions: [
          {
            id: 'mood_check',
            type: 'technique',
            title: 'Отметить настроение',
            description: 'Проверить текущее эмоциональное состояние',
            action: 'open_mood_tracker'
          },
          {
            id: 'need_help',
            type: 'contact',
            title: 'Нужна помощь',
            description: 'Получить немедленную поддержку',
            action: 'show_help_options'
          }
        ]
      }
    };
    
    setMessages([welcomeMessage]);
  }, []);

  // Отправка сообщения
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Добавляем сообщение пользователя
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      senderId: 'user_1',
      senderType: 'user',
      content: text.trim(),
      timestamp: new Date(),
      messageType: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Получаем ответ от ИИ
      const aiResponses = await aiChat.sendMessage('user_1', text.trim(), {
        userMood: currentContext.mood,
        cravingLevel: currentContext.cravingLevel,
        stressLevel: currentContext.stressLevel,
        timeOfDay: new Date().getHours(),
        recentEvents: []
      });

      // Добавляем ответы ИИ с задержкой для реалистичности
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, ...aiResponses]);
        
        // Прокручиваем к последнему сообщению
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000 + Math.random() * 1000); // 1-2 секунды задержки

    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        senderId: 'ai_coach',
        senderType: 'ai',
        content: 'Извините, у меня возникли технические проблемы. Попробуйте еще раз через мгновение.',
        timestamp: new Date(),
        messageType: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [aiChat, currentContext]);

  // Обработка предложенных действий
  const handleSuggestionPress = useCallback((suggestion: ActionSuggestion) => {
    console.log('Suggestion pressed:', suggestion);
    
    switch (suggestion.type) {
      case 'technique':
        // Открыть технику или упражнение
        if (Platform.OS === 'web') {
          alert(`Запускаем: ${suggestion.title}`);
        } else {
          Alert.alert('Техника', `Запускаем: ${suggestion.title}`);
        }
        break;
        
      case 'contact':
        // Открыть контакты поддержки
        if (Platform.OS === 'web') {
          alert('Открываем контакты службы поддержки');
        } else {
          Alert.alert('Поддержка', 'Открываем контакты службы поддержки');
        }
        break;
        
      case 'emergency':
        // Экстренная помощь
        handleEmergencyAction(suggestion);
        break;
        
      default:
        sendMessage(`Расскажи больше про "${suggestion.title}"`);
    }
  }, [sendMessage]);

  const handleEmergencyAction = (suggestion: ActionSuggestion) => {
    const emergencyMessage: ChatMessage = {
      id: `emergency_response_${Date.now()}`,
      senderId: 'ai_coach',
      senderType: 'ai',
      content: 'Я понимаю, что сейчас очень тяжело. Вы сделали правильный шаг, обратившись за помощью. Давайте вместе пройдем через это.',
      timestamp: new Date(),
      messageType: 'emergency',
      metadata: {
        urgency: 'critical',
        suggestions: [
          {
            id: 'emergency_breathing',
            type: 'technique',
            title: 'Дыхательная техника 4-7-8',
            description: 'Быстрая помощь при панике',
            action: 'start_emergency_breathing'
          },
          {
            id: 'crisis_hotline',
            type: 'contact',
            title: 'Горячая линия кризиса',
            description: 'Связаться с консультантом',
            action: 'call_crisis_hotline'
          }
        ]
      }
    };

    setMessages(prev => [...prev, emergencyMessage]);
  };

  // Обновление контекста
  const updateContext = (newContext: Partial<typeof currentContext>) => {
    setCurrentContext(prev => ({ ...prev, ...newContext }));
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >

      <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiAvatarLarge}>
            <MaterialIcons name="psychology" size={24} color="white" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>ИИ-Помощник</Text>
            <Text style={styles.headerSubtitle}>Всегда готов помочь и поддержать</Text>
          </View>
          <View style={styles.statusIndicator}>
            <View style={styles.onlineIndicator} />
          </View>
        </View>
      </LinearGradient>


      <View style={styles.contextPanel}>
        <View style={styles.contextItem}>
          <MaterialIcons name="mood" size={16} color="#4CAF50" />
          <Text style={styles.contextLabel}>Настроение: {currentContext.mood}/5</Text>
        </View>
        <View style={styles.contextItem}>
          <MaterialIcons name="warning" size={16} color="#FF9800" />
          <Text style={styles.contextLabel}>Тяга: {currentContext.cravingLevel}/5</Text>
        </View>
        <View style={styles.contextItem}>
          <MaterialIcons name="psychology" size={16} color="#F44336" />
          <Text style={styles.contextLabel}>Стресс: {currentContext.stressLevel}/5</Text>
        </View>
      </View>


      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            onSuggestionPress={handleSuggestionPress}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
      </ScrollView>


      <QuickResponses 
        onSelect={sendMessage}
        currentMood={currentContext.mood}
      />


      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Напишите сообщение..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onSubmitEditing={() => {
              if (inputText.trim()) {
                sendMessage(inputText);
              }
            }}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <MaterialIcons 
              name="send" 
              size={20} 
              color={inputText.trim() ? '#4CAF50' : '#CCC'} 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.micButton}
          onPress={() => {
            // Здесь можно добавить функцию голосового ввода
            if (Platform.OS === 'web') {
              alert('Голосовой ввод (функция в разработке)');
            } else {
              Alert.alert('Голосовой ввод', 'Функция в разработке');
            }
          }}
        >
          <MaterialIcons name="mic" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Вспомогательная функция для получения иконки предложения
function getSuggestionIcon(type: string): keyof typeof MaterialIcons.glyphMap {
  switch (type) {
    case 'technique': return 'self-improvement';
    case 'contact': return 'phone';
    case 'emergency': return 'emergency';
    case 'exercise': return 'fitness-center';
    case 'distraction': return 'games';
    default: return 'help';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  aiAvatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  headerText: {
    flex: 1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2
  },
  statusIndicator: {
    alignItems: 'center'
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50'
  },
  contextPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  contextLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  messagesContent: {
    paddingVertical: 10
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 15
  },
  userMessageContainer: {
    alignItems: 'flex-end'
  },
  aiMessageContainer: {
    alignItems: 'flex-start'
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    position: 'relative'
  },
  userBubble: {
    marginLeft: screenWidth * 0.25
  },
  aiBubble: {
    marginRight: screenWidth * 0.25,
    paddingTop: 15
  },
  emergencyBubble: {
    borderWidth: 2,
    borderColor: '#FFE0DB'
  },
  aiAvatar: {
    position: 'absolute',
    top: -5,
    left: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 4,
    alignSelf: 'flex-end',
    color: 'white'
  },
  suggestionsContainer: {
    marginTop: 8,
    gap: 6
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start'
  },
  emergencySuggestion: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FF5722'
  },
  suggestionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500'
  },
  emergencySuggestionText: {
    color: '#FF5722',
    fontWeight: '600'
  },
  typingContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    marginVertical: 4
  },
  typingBubble: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: screenWidth * 0.25
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666'
  },
  quickResponsesContainer: {
    maxHeight: 50,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  quickResponsesContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8
  },
  quickResponseButton: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3'
  },
  quickResponseText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500'
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    minHeight: 20,
    paddingVertical: 4
  },
  sendButton: {
    padding: 8,
    marginLeft: 8
  },
  sendButtonDisabled: {
    opacity: 0.5
  },
  micButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  }
});

export default AIAssistantPage;