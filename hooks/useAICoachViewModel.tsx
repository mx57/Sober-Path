import { useState, useEffect, useCallback, useMemo } from 'react';
import { AICoachService, AICoachMessage } from '../services/AICoachService';
import { useRecovery } from './useRecovery';
import NotificationService from '../services/notificationService';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

export function useAICoachViewModel() {
  const { soberDays, userProfile, getStreakDays } = useRecovery();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'notifications'>('chat');
  const [insights, setInsights] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    // Initial welcome message
    const welcome: ChatMessage = {
      id: 'welcome',
      text: `Привет! Я ваш AI-коуч. У вас ${soberDays} дней трезвости. Как я могу помочь?`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcome]);

    // Load data
    const aiInsights = AICoachService.getUserInsights(userProfile?.id || 'default');
    setInsights(aiInsights);
    setNotifications(NotificationService.getNotifications());
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await AICoachService.getEnhancedResponse(
        userProfile?.id || 'default',
        inputText,
        {
          userMood: 3,
          soberDays,
          cravingLevel: 1,
          timeOfDay: 'afternoon'
        }
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, aiMsg]);
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
    notifications,
    sendMessage,
    soberDays,
    getStreakDays
  };
}
