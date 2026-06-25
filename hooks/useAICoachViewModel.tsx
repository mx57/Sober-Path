import { useState, useEffect } from 'react';
import { AICoachService, RecommendedArticle } from '../services/AICoachService';
import { useRecovery } from './useRecovery';
import NotificationService from '../services/notificationService';
import * as Speech from 'expo-speech';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  recommendedArticles?: RecommendedArticle[];
  followUpQuestions?: string[];
}

export function useAICoachViewModel() {
  const { soberDays, userProfile, getStreakDays } = useRecovery();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'notifications'>('chat');
  const [insights, setInsights] = useState<any>(null);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    initialize();
  }, [soberDays, userProfile?.id]);

  const initialize = async () => {
    const welcome: ChatMessage = {
      id: 'welcome',
      text: `Привет! Я ваш AI-коуч. У вас ${soberDays} дней трезвости. Как я могу помочь сегодня?`,
      isUser: false,
      timestamp: new Date(),
      suggestions: ['Как справиться с тягой?', 'Нужна мотивация', 'Я сорвался'],
      followUpQuestions: ['Что у вас на уме?', 'Как ваше настроение?']
    };
    setMessages([welcome]);

    const aiInsights = AICoachService.getUserInsights(userProfile?.id || 'default');
    setInsights(aiInsights);
    setTriggers(AICoachService.detectTriggerPatterns(userProfile?.id || 'default'));
    setNotifications(NotificationService.getNotifications());
  };

  const speak = (text: string) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(text, {
        language: 'ru',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const sendMessage = async (overrideText?: string) => {
    const textToSend = typeof overrideText === 'string' ? overrideText : inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (typeof overrideText !== 'string') setInputText('');
    setIsTyping(true);

    try {
      const response = await AICoachService.getEnhancedResponse(
        userProfile?.id || 'default',
        textToSend,
        {
          userMood: 3,
          soberDays,
          cravingLevel: 1,
          timeOfDay: 'afternoon'
        }
      );

      if (response.success) {
        const data = response.data;
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isUser: false,
          timestamp: new Date(),
          suggestions: data.suggestions,
          recommendedArticles: data.recommendedArticles,
          followUpQuestions: data.followUpQuestions
        };

        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    activeTab,
    setActiveTab,
    insights,
    triggers,
    notifications,
    sendMessage,
    soberDays,
    getStreakDays,
    speak,
    stopSpeaking,
    isSpeaking
  };
}
