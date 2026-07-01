import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  Alert, Platform, Modal, Dimensions, ActivityIndicator 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { useRecovery } from '../../hooks/useRecovery';
import { useAnalytics } from '../../hooks/useAnalytics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

import { MemoizedHealthMetric } from '../../components/home/HealthMetric';
import { StatCard } from '../../components/home/StatCard';
import { DailyMotivationService, MotivationQuote, RecoveryTip } from '../../services/dailyMotivationService';
import { LineChart } from 'react-native-chart-kit';
import { AICoachService, WeeklyRoadmap } from '../../services/AICoachService';

const AchievementSystem = React.lazy(() => import('../../components/AchievementSystem'));
const CrisisIntervention = React.lazy(() => import('../../components/CrisisIntervention'));

const { width: screenWidth } = Dimensions.get('window');

const healthKnowledge: Record<string, { title: string; content: string; benefits: string[] }> = {
  sleep: {
    title: 'Улучшение качества сна',
    content: 'Алкоголь серьезно нарушает архитектуру сна. Хотя он может помочь быстрее заснуть, он препятствует глубокому REM-сну, когда происходит восстановление организма.\n\n**Что происходит при отказе от алкоголя:**\n\nДень 1-3: Бессонница и беспокойный сон - нормальное явление. Мозг адаптируется к отсутствию депрессанта.\n\nДень 3-7: Начинается восстановление естественных циклов сна. Увеличивается продолжительность глубокого сна.\n\nДень 7-30: Значительное улучшение качества сна. Больше REM-фаз, лучшее восстановление.\n\n30+ дней: Полная нормализация архитектуры сна. Улучшение когнитивных функций, памяти, настроения.',
    benefits: [
      'Более глубокий и качественный сон',
      'Легче просыпаться по утрам',
      'Больше энергии в течение дня',
      'Улучшение памяти и концентрации',
      'Нормализация гормонального баланса',
      'Укрепление иммунной системы'
    ]
  },
  energy: {
    title: 'Повышение уровня энергии',
    content: 'Алкоголь - это токсин, на переработку которого организм тратит огромное количество энергии. Печень работает сверхурочно, все системы организма в режиме детоксикации.\n\n**Восстановление энергии:**\n\nДень 1-2: Может ощущаться усталость из-за синдрома отмены.\n\nДень 3-5: Первый прилив энергии! Организм больше не тратит ресурсы на детоксикацию.\n\nНеделя 2-3: Значительное повышение энергии. Лучше усваиваются витамины группы B (ключевые для энергии).\n\nМесяц+: Стабильно высокий уровень энергии. Улучшение метаболизма, эффективная работа митохондрий.',
    benefits: [
      'Постоянный высокий уровень энергии',
      'Отсутствие утренних похмелий',
      'Лучшая физическая выносливость',
      'Повышенная продуктивность',
      'Желание заниматься спортом',
      'Улучшение обмена веществ'
    ]
  },
  heart: {
    title: 'Укрепление сердечно-сосудистой системы',
    content: 'Алкоголь вызывает множество проблем с сердцем и сосудами: повышение артериального давления, аритмии, кардиомиопатию, повышенный риск инсульта.\n\n**Восстановление сердца:**\n\nНеделя 1: Снижение артериального давления. Уменьшение нагрузки на сердце.\n\nНедели 2-4: Нормализация сердечного ритма. Улучшение кровообращения.\n\n1-3 месяца: Снижение риска аритмий. Укрепление сердечной мышцы.\n\n6+ месяцев: Значительное снижение риска сердечных заболеваний и инсульта (на 30-40%).',
    benefits: [
      'Нормализация артериального давления',
      'Регулярный сердечный ритм',
      'Улучшение кровообращения',
      'Снижение риска инфаркта',
      'Укрепление сосудов',
      'Улучшение доставки кислорода к органам'
    ]
  },
  mind: {
    title: 'Ясность мышления и когнитивные функции',
    content: 'Алкоголь токсичен для мозга. Он повреждает нейроны, нарушает связи между ними, ухудшает память, концентрацию и принятие решений.\n\n**Восстановление мозга:**\n\nНедели 1-2: "Мозговой туман" начинает рассеиваться. Улучшается концентрация внимания.\n\nНедели 3-6: Значительное улучшение памяти. Лучше работает исполнительная функция (планирование, принятие решений).\n\n2-3 месяца: Восстановление нейронных связей. Улучшение скорости обработки информации.\n\n6+ месяцев: Полное восстановление когнитивных функций. Возможен рост новых нейронов (нейрогенез).',
    benefits: [
      'Улучшение памяти и концентрации',
      'Быстрое и четкое мышление',
      'Лучшее принятие решений',
      'Повышение креативности',
      'Эмоциональная стабильность',
      'Способность к обучению'
    ]
  },
  immunity: {
    title: 'Укрепление иммунной системы',
    content: 'Алкоголь подавляет иммунную систему на нескольких уровнях: нарушает работу иммунных клеток, ухудшает барьерные функции кишечника, вызывает хроническое воспаление.\n\n**Восстановление иммунитета:**\n\nНеделя 1: Начало восстановления функции лейкоцитов.\n\nНедели 2-4: Улучшение кишечного барьера. Нормализация микробиома.\n\n1-3 месяца: Значительное укрепление иммунного ответа. Меньше простуд и инфекций.\n\n6+ месяцев: Полное восстановление иммунной функции. Снижение хронического воспаления.',
    benefits: [
      'Устойчивость к простудам и инфекциям',
      'Быстрое заживление ран',
      'Снижение риска аутоиммунных заболеваний',
      'Улучшение функции лимфатической системы',
      'Нормализация воспалительных процессов',
      'Повышение общей выносливости организма'
    ]
  },
  transformation: {
    title: 'Полная трансформация жизни',
    content: 'После 90 дней трезвости происходят фундаментальные изменения во всех сферах жизни. Это не просто отсутствие алкоголя - это новый образ жизни.\n\n**Физические изменения:**\nПечень почти полностью восстанавливается. Нормализуется вес. Кожа становится здоровее. Глаза ясные.\n\n**Психологические изменения:**\nИсчезает тревожность и депрессия, связанные с алкоголем. Появляется уверенность в себе. Улучшаются отношения.\n\n**Социальные изменения:**\nЛучше работа или учеба. Восстановление отношений. Новые здоровые хобби. Финансовая стабильность.\n\n**Духовный рост:**\nПонимание своих ценностей. Жизненная цель. Гордость за достижения.',
    benefits: [
      'Полное физическое восстановление',
      'Новая идентичность без алкоголя',
      'Глубокие и здоровые отношения',
      'Финансовая стабильность',
      'Ощущение гордости и достижения',
      'Вдохновение для других',
      'Новые возможности и перспективы',
      'Истинное счастье и удовлетворение'
    ]
  }
};

function HomePage() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { 
    soberDays, 
    getStreakDays, 
    getTotalSoberDays,
    userProfile, 
    addProgressEntry,
    getDayStatus,
    getCalendarMarks,
    loading 
  } = useRecovery();
  const { addMoodEntry, moodEntries, getMoodTrend } = useAnalytics();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showCrisisIntervention, setShowCrisisIntervention] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedHealthMetric, setSelectedHealthMetric] = useState<string | null>(null);
  const [dailyQuote, setDailyQuote] = useState<MotivationQuote | null>(null);
  const [dailyTip, setDailyTip] = useState<RecoveryTip | null>(null);
  const [weeklyRoadmap, setWeeklyRoadmap] = useState<WeeklyRoadmap | null>(null);
  const [isUpdatingRoadmap, setIsUpdatingRoadmap] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const pulseValue = useSharedValue(0);
  
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulseValue.value * 0.05 }]
  }));

  const handleToggleTask = useCallback(async (taskId: string) => {
    if (!userProfile?.id || isUpdatingRoadmap) return;

    try {
      setIsUpdatingRoadmap(true);
      const result = await AICoachService.toggleRoadmapTask(userProfile.id, taskId);
      if (result.success) {
        setWeeklyRoadmap(result.data);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Failed to toggle task', error);
    } finally {
      setIsUpdatingRoadmap(false);
    }
  }, [userProfile?.id, isUpdatingRoadmap]);

  useEffect(() => {
    pulseValue.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
    setDailyQuote(DailyMotivationService.getDailyQuote());
    setDailyTip(DailyMotivationService.getDailyTip());

    const loadRoadmap = async () => {
      if (userProfile?.id) {
        const roadmap = await AICoachService.getWeeklyRoadmap(userProfile.id, soberDays);
        setWeeklyRoadmap(roadmap);
      }
    };
    loadRoadmap();
  }, [pulseValue, userProfile?.id, soberDays]);

  const showWebAlert = useCallback((title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  }, []);

  const streakDays = useMemo(() => getStreakDays(), [getStreakDays, loading]);
  const totalSoberDays = useMemo(() => getTotalSoberDays(), [getTotalSoberDays, loading]);

  const moodChartData = useMemo(() => {
    const last7Days = moodEntries.slice(-7);
    if (last7Days.length === 0) return null;

    return {
      labels: last7Days.map(e => new Date(e.date).toLocaleDateString('ru-RU', { weekday: 'short' })),
      datasets: [{
        data: last7Days.map(e => e.mood),
        color: (opacity = 1) => `rgba(46, 125, 74, ${opacity})`,
        strokeWidth: 2
      }]
    };
  }, [moodEntries]);
  const todayStatus = useMemo(() => getDayStatus(selectedDate), [getDayStatus, selectedDate]);
  const calendarMarks = useMemo(() => getCalendarMarks(), [getCalendarMarks]);

  const healthMetrics = useMemo(() => {
    const metrics = [];
    if (soberDays >= 1) metrics.push({ icon: 'bedtime', text: 'Сон улучшается', color: '#4CAF50', days: 1, type: 'sleep' });
    if (soberDays >= 3) metrics.push({ icon: 'fitness-center', text: 'Больше энергии', color: '#FF9800', days: 3, type: 'energy' });
    if (soberDays >= 7) metrics.push({ icon: 'favorite', text: 'Здоровье сердца', color: '#F44336', days: 7, type: 'heart' });
    if (soberDays >= 14) metrics.push({ icon: 'psychology', text: 'Ясность мышления', color: '#9C27B0', days: 14, type: 'mind' });
    if (soberDays >= 30) metrics.push({ icon: 'shield', text: 'Сильный иммунитет', color: '#607D8B', days: 30, type: 'immunity' });
    if (soberDays >= 90) metrics.push({ icon: 'auto-awesome', text: 'Новая жизнь!', color: '#E91E63', days: 90, type: 'transformation' });
    return metrics;
  }, [soberDays]);

  const handleLogDay = useCallback(async (status: 'sober' | 'relapse') => {
    try {
      if (todayStatus !== 'no-entry') {
        showWebAlert(
          'День уже отмечен', 
          'Вы уже отметили этот день. Каждый день можно отметить только один раз.'
        );
        setShowMoodSelector(false);
        return;
      }

      await addProgressEntry({
        date: selectedDate,
        status,
        mood
      });

      if (addMoodEntry) {
        await addMoodEntry({
          date: selectedDate,
          mood,
          cravingLevel: status === 'relapse' ? 5 : (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3 | 4 | 5,
          stressLevel: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
          sleepQuality: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5
        });
      }

      if (status === 'relapse') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showWebAlert(
          '💪 Не сдавайтесь!',
          'Срыв - это не конец пути, а новый урок. Каждый новый день - новая возможность стать сильнее.',
          () => setShowCrisisIntervention(true)
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showWebAlert(
          '🎉 Отлично!', 
          `Ещё один трезвый день! Ваша серия: ${streakDays + 1} дней. Продолжайте в том же духе!`
        );
      }
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось сохранить данные. Попробуйте снова.');
    } finally {
      setShowMoodSelector(false);
    }
  }, [selectedDate, todayStatus, mood, addProgressEntry, addMoodEntry, streakDays, showWebAlert]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <MaterialIcons name="hourglass-empty" size={50} color="#2E7D4A" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <LinearGradient 
        colors={['#E8F5E8', '#F8F9FA']} 
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.welcomeContainer}>
          <MaterialIcons name="eco" size={100} color="#2E7D4A" />
          <Text style={styles.welcomeTitle}>Sober Path</Text>
          <Text style={styles.welcomeSubtitle}>Ваш проводник к новой жизни</Text>
          <Text style={styles.welcomeText}>
            Начните свой путь к здоровой жизни без алкоголя. 
            Получите поддержку, отслеживайте прогресс и достигайте целей.
          </Text>
          <Link href="/onboarding" asChild>
            <TouchableOpacity style={styles.startButton}>
              <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.startButtonGradient}>
                <MaterialIcons name="play-arrow" size={24} color="white" />
                <Text style={styles.startButtonText}>Начать путь</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        </View>
      </LinearGradient>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['white', '#F8F9FA']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{t('home.title')}</Text>
            <Text style={styles.greeting}>{t('home.welcomeBack')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => setShowCrisisIntervention(true)}
          >
            <MaterialIcons name="emergency" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        {dailyQuote && (
          <View style={styles.motivationCard}>
            <LinearGradient colors={['#E8F5E8', '#F1F8F1']} style={styles.motivationGradient}>
              <MaterialIcons name="format-quote" size={32} color="#2E7D4A" style={styles.quoteIcon} />
              <Text style={styles.quoteText}>{dailyQuote.text}</Text>
              <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
            </LinearGradient>
          </View>
        )}

        {dailyTip && (
          <View style={styles.tipCard}>
            <LinearGradient colors={['#E0F2F1', '#F0F4F4']} style={styles.tipGradient}>
              <View style={styles.tipHeader}>
                <MaterialIcons name={dailyTip.icon as any} size={24} color="#00796B" />
                <Text style={styles.tipTitle}>Совет дня</Text>
              </View>
              <Text style={styles.tipSubtitle}>{dailyTip.title}</Text>
              <Text style={styles.tipContent}>{dailyTip.content}</Text>
            </LinearGradient>
          </View>
        )}

        <StatCard
          icon="timeline"
          number={soberDays}
          label={t('home.daysInJourney')}
          primary
          animatedStyle={pulseAnimatedStyle}
        />
        
        <View style={styles.secondaryStats}>
          <StatCard icon="local-fire-department" number={streakDays} label={t('home.streak')} />
          <StatCard icon="check-circle" number={totalSoberDays} label={t('home.totalSober')} />
        </View>

        {weeklyRoadmap && (
          <Link href="/ai-coach" asChild>
            <TouchableOpacity style={styles.roadmapWidget}>
              <LinearGradient colors={['#F0F7F0', '#FFFFFF']} style={styles.roadmapWidgetGradient}>
                <View style={styles.roadmapWidgetHeader}>
                  <MaterialIcons name="event-note" size={20} color="#2E7D4A" />
                  <Text style={styles.roadmapWidgetTitle}>План на неделю {weeklyRoadmap.weekNumber}</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#2E7D4A" />
                </View>
                <View style={styles.roadmapWidgetProgress}>
                  <View style={styles.roadmapProgressBar}>
                    <View
                      style={[
                        styles.roadmapProgressFill,
                        {
                          width: `${(weeklyRoadmap.tasks.filter(t => t.completed).length / weeklyRoadmap.tasks.length) * 100}%`
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.roadmapProgressText}>
                    {weeklyRoadmap.tasks.filter(t => t.completed).length} из {weeklyRoadmap.tasks.length} выполнено
                  </Text>
                </View>
                <View style={styles.roadmapTasksPreview}>
                  {weeklyRoadmap.tasks.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.roadmapTaskPreviewItem}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleTask(task.id);
                      }}
                    >
                      <MaterialIcons
                        name={task.completed ? "check-circle" : "radio-button-unchecked"}
                        size={18}
                        color={task.completed ? "#2E7D4A" : "#CCC"}
                      />
                      <Text
                        style={[
                          styles.roadmapTaskPreviewText,
                          task.completed && styles.roadmapTaskPreviewCompleted
                        ]}
                        numberOfLines={1}
                      >
                        {task.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        )}

        {moodChartData && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Тренд настроения</Text>
              <View style={[styles.trendBadge, { backgroundColor: getMoodTrend() === 'improving' ? '#E8F5E8' : '#FFF3E0' }]}>
                <MaterialIcons
                  name={getMoodTrend() === 'improving' ? 'trending-up' : getMoodTrend() === 'declining' ? 'trending-down' : 'trending-flat'}
                  size={16}
                  color={getMoodTrend() === 'improving' ? '#2E7D4A' : '#EF6C00'}
                />
                <Text style={[styles.trendText, { color: getMoodTrend() === 'improving' ? '#2E7D4A' : '#EF6C00' }]}>
                  {getMoodTrend() === 'improving' ? 'Улучшается' : 'Стабильно'}
                </Text>
              </View>
            </View>
            <LineChart
              data={moodChartData}
              width={screenWidth - 80}
              height={120}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(46, 125, 74, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", strokeWidth: "2", stroke: "#2E7D4A" },
                propsForBackgroundLines: { strokeDasharray: "" }
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={false}
            />
          </View>
        )}
      </View>

      {healthMetrics.length > 0 && (
        <View style={styles.healthContainer}>
          <View style={styles.healthHeader}>
            <Text style={styles.sectionTitle}>💚 {t('home.healthAchievements')}</Text>
            <MaterialIcons name="touch-app" size={16} color="#666" />
            <Text style={styles.tapHintText}>{t('home.tapForDetails')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.healthMetrics}>
              {healthMetrics.map((metric, index) => (
                <MemoizedHealthMetric 
                  key={index} 
                  metric={metric} 
                  onPress={() => setSelectedHealthMetric(metric.type)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>⚡ {t('home.quickActions')}</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[
              styles.quickAction, 
              { backgroundColor: todayStatus === 'no-entry' ? '#2E7D4A' : '#666' }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (todayStatus === 'no-entry') {
                setShowMoodSelector(true);
              } else {
                showWebAlert('День отмечен', 'Вы уже отметили этот день');
              }
            }}
            disabled={todayStatus !== 'no-entry'}
          >
            <MaterialIcons 
              name={todayStatus === 'no-entry' ? 'add-circle' : 'check-circle'} 
              size={28} 
              color="white" 
            />
            <Text style={styles.quickActionText}>
              {todayStatus === 'no-entry' ? t('home.logDay') : t('home.dayLogged')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: '#FF6B6B' }]}
            onPress={() => setShowCrisisIntervention(true)}
          >
            <MaterialIcons name="emergency" size={28} color="white" />
            <Text style={styles.quickActionText}>{t('home.needHelp')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: '#007AFF' }]}
            onPress={() => setShowCalendar(true)}
          >
            <MaterialIcons name="calendar-month" size={28} color="white" />
            <Text style={styles.quickActionText}>{t('home.calendar')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <React.Suspense fallback={
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D4A" />
        </View>
      }>
        <AchievementSystem />
      </React.Suspense>

      {/* Health Info Modal */}
      <Modal visible={selectedHealthMetric !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedHealthMetric && healthKnowledge[selectedHealthMetric] && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.healthModalHeader}>
              <TouchableOpacity onPress={() => setSelectedHealthMetric(null)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.healthModalTitle}>{healthKnowledge[selectedHealthMetric].title}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.healthModalContent}>
              <View style={styles.healthModalBody}>
                {healthKnowledge[selectedHealthMetric].content.split('\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return null;
                  const isBold = paragraph.startsWith('**') && paragraph.endsWith('**');
                  const cleanText = isBold ? paragraph.slice(2, -2) : paragraph;
                  
                  return (
                    <Text
                      key={index}
                      style={[
                        styles.healthModalParagraph,
                        isBold && styles.healthModalBold
                      ]}
                    >
                      {cleanText}
                    </Text>
                  );
                })}
              </View>

              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>✨ Ключевые преимущества:</Text>
                {healthKnowledge[selectedHealthMetric].benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal visible={showCalendar} animationType="slide">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Календарь прогресса</Text>
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Calendar
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={{
              ...calendarMarks,
              [selectedDate]: {
                ...calendarMarks[selectedDate],
                selected: true,
                selectedColor: '#2E7D4A'
              }
            }}
            theme={{
              selectedDayBackgroundColor: '#2E7D4A',
              todayTextColor: '#2E7D4A',
              arrowColor: '#2E7D4A',
              monthTextColor: '#2E7D4A',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold'
            }}
            markingType="custom"
          />
          
          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2E7D4A' }]} />
              <Text style={styles.legendText}>Трезвый день</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.legendText}>Срыв</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
              <Text style={styles.legendText}>Не отмечено</Text>
            </View>
          </View>

          {selectedDate && (
            <View style={styles.selectedDayInfo}>
              <Text style={styles.selectedDayTitle}>
                {new Date(selectedDate).toLocaleDateString(i18n.language, {
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={styles.selectedDayStatus}>
                Статус: {
                  getDayStatus(selectedDate) === 'sober' ? '✅ Трезвый день' :
                  getDayStatus(selectedDate) === 'relapse' ? '❌ Срыв' :
                  '⏳ Не отмечено'
                }
              </Text>
            </View>
          )}
        </View>
      </Modal>

      <Modal visible={showMoodSelector} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.moodModalContent}>
            <Text style={styles.modalTitle}>{t('home.howIsMood')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('home.chooseState', { date: new Date(selectedDate).toLocaleDateString(i18n.language) })}
            </Text>
            
            <View style={styles.moodContainer}>
              {[1, 2, 3, 4, 5].map((moodValue) => (
                <TouchableOpacity
                  key={moodValue}
                  style={[
                    styles.moodButton,
                    mood === moodValue && styles.selectedMood
                  ]}
                  onPress={() => setMood(moodValue as 1 | 2 | 3 | 4 | 5)}
                >
                  <Text style={styles.moodEmoji}>
                    {moodValue === 1 ? '😢' : moodValue === 2 ? '😕' : 
                     moodValue === 3 ? '😐' : moodValue === 4 ? '😊' : '😄'}
                  </Text>
                  <Text style={[
                    styles.moodLabel,
                    mood === moodValue && styles.selectedMoodLabel
                  ]}>
                    {moodValue === 1 ? t('home.mood.bad') : moodValue === 2 ? t('home.mood.sad') :
                     moodValue === 3 ? t('home.mood.neutral') : moodValue === 4 ? t('home.mood.good') : t('home.mood.great')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowMoodSelector(false)}
              >
                <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleLogDay('sober')}
              >
                <MaterialIcons name="check" size={20} color="white" />
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>{t('home.soberDay')}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.relapseButton}
              onPress={() => handleLogDay('relapse')}
            >
              <Text style={styles.relapseButtonText}>{t('home.relapse')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

      {showCrisisIntervention && (
        <React.Suspense fallback={
          <Modal visible={showCrisisIntervention} transparent>
            <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#2E7D4A" />
            </View>
          </Modal>
        }>
          <CrisisIntervention 
            visible={showCrisisIntervention}
            onClose={() => setShowCrisisIntervention(false)}
          />
        </React.Suspense>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    fontSize: 18,
    color: '#2E7D4A',
    marginTop: 15,
    fontWeight: '500'
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
    color: '#2E7D4A'
  },
  welcomeSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4CAF50',
    marginBottom: 20,
    fontWeight: '500'
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20
  },
  startButton: {
    borderRadius: 30,
    shadowColor: '#2E7D4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginTop: 4
  },
  emergencyButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#FFE6E6'
  },
  statsContainer: {
    padding: 20,
    gap: 15
  },
  motivationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  motivationGradient: {
    padding: 20,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    opacity: 0.2,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#1B4D2E',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#2E7D4A',
    textAlign: 'right',
    marginTop: 10,
    fontWeight: '600',
  },
  tipCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipGradient: {
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00796B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tipContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: 15
  },
  healthContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8
  },
  tapHintText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  healthMetrics: {
    flexDirection: 'row',
    gap: 12
  },
  quickActionsContainer: {
    margin: 20
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginTop: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -20
  },
  roadmapWidget: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roadmapWidgetGradient: {
    padding: 15,
  },
  roadmapWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  roadmapWidgetTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
  },
  roadmapWidgetProgress: {
    gap: 8,
  },
  roadmapProgressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  roadmapProgressFill: {
    height: '100%',
    backgroundColor: '#2E7D4A',
  },
  roadmapProgressText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  roadmapTasksPreview: {
    marginTop: 10,
    gap: 6,
  },
  roadmapTaskPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roadmapTaskPreviewText: {
    fontSize: 13,
    color: '#444',
    flex: 1,
  },
  roadmapTaskPreviewCompleted: {
    color: '#AAA',
    textDecorationLine: 'line-through',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  healthModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  healthModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    flex: 1,
    textAlign: 'center'
  },
  healthModalContent: {
    flex: 1
  },
  healthModalBody: {
    padding: 20
  },
  healthModalParagraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12
  },
  healthModalBold: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#2E7D4A',
    marginTop: 12,
    marginBottom: 8
  },
  benefitsSection: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    marginTop: 10
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#F8F9FA'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  selectedDayInfo: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center'
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8
  },
  selectedDayStatus: {
    fontSize: 14,
    color: '#666'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  moodModalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    width: screenWidth * 0.9,
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2E7D4A'
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    color: '#666'
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    minWidth: 60,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedMood: {
    backgroundColor: '#E8F5E8',
    borderColor: '#2E7D4A'
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 6
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666'
  },
  selectedMoodLabel: {
    color: '#2E7D4A',
    fontWeight: 'bold'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    gap: 6
  },
  confirmButton: {
    backgroundColor: '#2E7D4A'
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  confirmButtonText: {
    color: 'white'
  },
  relapseButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B6B'
  },
  relapseButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600'
  },
  webAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  webAlertContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    minWidth: 300,
    maxWidth: '90%'
  },
  webAlertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  webAlertMessage: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
    color: '#666'
  },
  webAlertButton: {
    backgroundColor: '#2E7D4A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  webAlertButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default React.memo(HomePage);
