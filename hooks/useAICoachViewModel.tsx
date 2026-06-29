import { useState, useEffect, useCallback } from 'react';
import { AICoachService, RecommendedArticle, AICoachChallenge } from '../services/AICoachService';
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
  recommendedCourses?: { id: string, title: string }[];
  followUpQuestions?: string[];
  isCheckIn?: boolean;
  isReflection?: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export function useAICoachViewModel() {
  const { soberDays, userProfile, getStreakDays } = useRecovery();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'notifications'>('chat');
  const [insights, setInsights] = useState<any>(null);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<AICoachChallenge[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatStarters, setChatStarters] = useState<string[]>([]);

  useEffect(() => {
    initialize();
  }, [soberDays, userProfile?.id]);

  const initialize = async () => {
    await AICoachService.loadFromStorage();

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
    const initialChallenges = await AICoachService.getChallenges(userProfile?.id || 'default');
    setChallenges(initialChallenges);
    setChatStarters(AICoachService.getChatStarters({ mood: 3, soberDays }));

    // Check for evening reflection (after 20:00)
    const hours = new Date().getHours();
    if (hours >= 20) {
      const reflection = await AICoachService.getEveningReflection(userProfile?.id || 'default');
      const reflectionMsg: ChatMessage = {
        id: 'evening_reflection',
        text: reflection.message,
        isUser: false,
        timestamp: new Date(),
        suggestions: reflection.suggestions,
        isReflection: true
      };
      setMessages(prev => [...prev, reflectionMsg]);
    }
  };

  const completeChallenge = useCallback(async (challengeId: string) => {
    const result = await AICoachService.completeChallenge(userProfile?.id || 'default', challengeId);
    if (result.success) {
      setChallenges(result.data);
    }
  }, [userProfile?.id]);

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
          recommendedCourses: data.recommendedCourses,
          followUpQuestions: data.followUpQuestions,
          urgency: data.urgency
        };

        setMessages(prev => [...prev, aiMsg]);

        // Планируем напоминание через час, если был высокий стресс или тяга
        if (data.checkInRequired) {
          await AICoachService.scheduleAssistantReminder(
            userProfile?.id || 'default',
            'Как вы себя чувствуете сейчас? Помните о дыхательных техниках.',
            3600 // 1 час
          );

          setTimeout(() => {
            const checkInMsg: ChatMessage = {
              id: (Date.now() + 2).toString(),
              text: 'Я заметил повышенное напряжение. Как вы оцениваете свое состояние по шкале от 1 до 5?',
              isUser: false,
              timestamp: new Date(),
              isCheckIn: true,
              suggestions: ['1 - Критически', '2 - Тяжело', '3 - Терпимо', '4 - Хорошо', '5 - Отлично']
            };
            setMessages(prev => [...prev, checkInMsg]);
          }, 1000);
        }
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
    challenges,
    completeChallenge,
    sendMessage,
    soberDays,
    getStreakDays,
    speak,
    stopSpeaking,
    isSpeaking,
    chatStarters
  };
}
