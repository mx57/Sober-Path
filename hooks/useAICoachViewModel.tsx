import { useState, useEffect, useCallback } from 'react';
import { AICoachService, RecommendedArticle, AICoachChallenge } from '../services/AICoachService';
import { useRecovery } from './useRecovery';
import NotificationService from '../services/notificationService';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

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
  roadmap?: any;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  exercise?: any;
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
  const [roadmap, setRoadmap] = useState<any>(null);
  const [activeExercise, setActiveExercise] = useState<any>(null);

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

    AICoachService.getUserInsights(userProfile?.id || 'default').then(setInsights);
    setTriggers(AICoachService.detectTriggerPatterns(userProfile?.id || 'default'));
    setNotifications(NotificationService.getNotifications());
    const initialChallenges = await AICoachService.getChallenges(userProfile?.id || 'default');
    setChallenges(initialChallenges);
    setChatStarters([...AICoachService.getChatStarters({ mood: 3, soberDays }), 'План на неделю', 'Техника 5-4-3-2-1', 'Рефрейминг мыслей', 'Письмо в будущее']);

    const weeklyPlan = await AICoachService.getWeeklyRoadmap(userProfile?.id || 'default', soberDays);
    setRoadmap(weeklyPlan);

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

  const toggleTask = useCallback(async (taskId: string) => {
    const result = await AICoachService.toggleRoadmapTask(userProfile?.id || 'default', taskId);
    if (result.success) {
      setRoadmap(result.data);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [userProfile?.id]);

  const nextExerciseStep = useCallback(() => {
    if (!activeExercise) return;

    const nextStep = activeExercise.currentStep + 1;
    if (nextStep < activeExercise.steps.length) {
      const updatedExercise = { ...activeExercise, currentStep: nextStep };
      setActiveExercise(updatedExercise);

      const aiMsg: ChatMessage = {
        id: `ex_${Date.now()}`,
        text: updatedExercise.steps[nextStep],
        isUser: false,
        timestamp: new Date(),
        suggestions: nextStep === updatedExercise.steps.length - 1 ? ['Завершить'] : ['Далее'],
        exercise: updatedExercise
      };
      setMessages(prev => [...prev, aiMsg]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setActiveExercise(null);
      const aiMsg: ChatMessage = {
        id: `ex_end_${Date.now()}`,
        text: 'Отлично! Вы успешно выполнили упражнение. Как вы себя чувствуете сейчас?',
        isUser: false,
        timestamp: new Date(),
        suggestions: ['Намного лучше', 'Немного успокоился', 'Все еще тревожно']
      };
      setMessages(prev => [...prev, aiMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [activeExercise]);

  const sendMessage = async (overrideText?: string) => {
    const textToSend = typeof overrideText === 'string' ? overrideText : inputText;
    if (!textToSend.trim() || isTyping) return;

    const exerciseTriggers = ['Далее', 'Начать упражнение', 'Начать рефрейминг', 'Написать письмо'];
    if (activeExercise && exerciseTriggers.some(t => textToSend.includes(t))) {
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: textToSend,
            isUser: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        nextExerciseStep();
        return;
    }

    if (activeExercise && textToSend === 'Завершить') {
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: textToSend,
            isUser: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        nextExerciseStep();
        return;
    }

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

      if (textToSend.toLowerCase().includes('план на неделю')) {
        const plan = await AICoachService.getWeeklyRoadmap(userProfile?.id || 'default', soberDays);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `Вот ваш персональный план на ${plan.weekNumber}-ю неделю:\n\n🎯 Фокус: ${plan.focus}\n\n✅ Задачи:\n${plan.tasks.map(t => `• ${t.text}`).join('\n')}`,
          isUser: false,
          timestamp: new Date(),
          roadmap: plan
        };
        setMessages(prev => [...prev, aiMsg]);
      } else if (response.success) {
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

        if (data.exercise) {
            setActiveExercise(data.exercise);
        }

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
    chatStarters,
    roadmap,
    toggleTask,
    activeExercise
  };
}
