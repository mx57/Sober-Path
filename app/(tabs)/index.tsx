
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  Alert, Platform, Modal, Dimensions, ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { useRecovery } from '../../hooks/useRecovery';
import { useAnalytics } from '../../hooks/useAnalytics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withRepeat,
  runOnJS 
} from 'react-native-reanimated';

// Ленивые компоненты для улучшения производительности
const AchievementSystem = React.lazy(() => import('../../components/AchievementSystem'));
const CrisisIntervention = React.lazy(() => import('../../components/CrisisIntervention'));

const { width: screenWidth } = Dimensions.get('window');

// Мемоизированные компоненты для оптимизации
const MemoizedHealthMetric = React.memo(({ metric, index }: { metric: any; index: number }) => (
  <View key={index} style={[styles.healthMetric, { borderColor: metric.color }]}>
    <MaterialIcons name={metric.icon} size={24} color={metric.color} />
    <Text style={styles.healthText}>{metric.text}</Text>
    <Text style={styles.healthDays}>День {metric.days}+</Text>
  </View>
));

const MemoizedNavCard = React.memo(({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.navCard} onPress={onPress}>
    <View style={[styles.navIcon, { backgroundColor: item.color }]}>
      <MaterialIcons name={item.icon} size={28} color="white" />
      {item.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
    </View>
    <View style={styles.navContent}>
      <Text style={styles.navTitle}>{item.title}</Text>
      <Text style={styles.navDescription}>{item.description}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#999" />
  </TouchableOpacity>
));

function HomePage() {
  // Все хуки должны быть в самом начале компонента
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    soberDays, 
    getStreakDays, 
    getTotalSoberDays,
    userProfile, 
    progress, 
    addProgressEntry,
    getDayStatus,
    getCalendarMarks,
    loading 
  } = useRecovery();
  const { addMoodEntry } = useAnalytics();
  
  // Все useState хуки
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showCrisisIntervention, setShowCrisisIntervention] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  // Анимации - ВСЕ анимационные хуки должны быть здесь
  const pulseValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  
  // Анимированные стили - ОБЯЗАТЕЛЬНО здесь, до любых условий
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulseValue.value * 0.05 }]
  }));

  // useEffect хуки
  useEffect(() => {
    // Анимация пульсации для статистики
    pulseValue.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  // Мемоизированные функции для оптимизации
  const showWebAlert = useCallback((title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  }, []);

  const handleNavigation = useCallback((route: string) => {
    scaleValue.value = withSpring(0.98, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(router.push)(route as any);
    });
  }, [router, scaleValue]);

  // Условные рендеры только после всех хуков
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <MaterialIcons name="hourglass-empty" size={50} color="#2E7D4A" />
        <Text style={styles.loadingText}>Загрузка...</Text>
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
          <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
            <MaterialIcons name="eco" size={100} color="#2E7D4A" />
          </Animated.View>
          <Text style={styles.welcomeTitle}>Путь к Трезвости</Text>
          <Text style={styles.welcomeSubtitle}>Ваш персональный помощник</Text>
          <Text style={styles.welcomeText}>
            Начните свой путь к здоровой жизни без алкоголя. 
            Получите поддержку, отслеживайте прогресс и достигайте целей.
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => {
              scaleValue.value = withSpring(0.95, {}, () => {
                scaleValue.value = withSpring(1);
              });
              router.push('/onboarding' as any);
            }}
          >
            <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.startButtonGradient}>
              <MaterialIcons name="play-arrow" size={24} color="white" />
              <Text style={styles.startButtonText}>Начать путь</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }


  // Мемоизированные вычисления - ДОЛЖНЫ БЫТЬ ПЕРЕД handleLogDay
  const streakDays = useMemo(() => getStreakDays(), [getStreakDays]);
  const totalSoberDays = useMemo(() => getTotalSoberDays(), [getTotalSoberDays]);
  const todayStatus = useMemo(() => getDayStatus(selectedDate), [getDayStatus, selectedDate]);
  const calendarMarks = useMemo(() => getCalendarMarks(), [getCalendarMarks]);

  const handleLogDay = useCallback(async (status: 'sober' | 'relapse') => {
    try {
      // Проверяем, можем ли отметить день (только один раз в день)
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
        showWebAlert(
          '💪 Не сдавайтесь!',
          'Срыв - это не конец пути, а новый урок. Каждый новый день - новая возможность стать сильнее.',
          () => setShowCrisisIntervention(true)
        );
      } else {
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

  // Мемоизированные навигационные элементы
  const navigationItems = useMemo(() => [
    {
      title: 'AI-Коуч',
      description: 'Персональный помощник 24/7',
      icon: 'psychology',
      color: '#6A1B9A',
      route: '/(tabs)/ai-coach',
      isNew: true
    },
    {
      title: 'Терапевтические звуки',
      description: 'Расслабление и медитация',
      icon: 'headphones',
      color: '#2196F3',
      route: '/(tabs)/sounds'
    },
    {
      title: 'НЛП упражнения',
      description: 'Техники изменения поведения',
      icon: 'self-improvement',
      color: '#FF9800',
      route: '/(tabs)/exercises'
    },
    {
      title: 'Психологические советы',
      description: 'Профессиональные рекомендации',
      icon: 'lightbulb',
      color: '#3F51B5',
      route: '/(tabs)/psychology'
    },
    {
      title: 'Сообщество',
      description: 'Поддержка единомышленников',
      icon: 'group',
      color: '#4CAF50',
      route: '/(tabs)/community'
    },
    {
      title: 'Достижения',
      description: 'Награды и мотивация',
      icon: 'emoji-events',
      color: '#FF6B6B',
      route: '/(tabs)/gamification'
    }
  ], []);

  // Мемоизированные метрики здоровья
  const getHealthMetrics = useCallback(() => {
    const metrics = [];
    if (soberDays >= 1) metrics.push({ icon: 'bedtime', text: 'Сон улучшается', color: '#4CAF50', days: 1 });
    if (soberDays >= 3) metrics.push({ icon: 'fitness-center', text: 'Больше энергии', color: '#FF9800', days: 3 });
    if (soberDays >= 7) metrics.push({ icon: 'favorite', text: 'Здоровье сердца', color: '#F44336', days: 7 });
    if (soberDays >= 14) metrics.push({ icon: 'psychology', text: 'Ясность мышления', color: '#9C27B0', days: 14 });
    if (soberDays >= 30) metrics.push({ icon: 'shield', text: 'Сильный иммунитет', color: '#607D8B', days: 30 });
    if (soberDays >= 90) metrics.push({ icon: 'auto-awesome', text: 'Новая жизнь!', color: '#E91E63', days: 90 });
    return metrics;
  }, [soberDays]);

  const healthMetrics = useMemo(() => getHealthMetrics(), [getHealthMetrics]);



  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['white', '#F8F9FA']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Главная</Text>
            <Text style={styles.greeting}>Добро пожаловать назад!</Text>
          </View>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => setShowCrisisIntervention(true)}
          >
            <MaterialIcons name="emergency" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Статистика прогресса */}
      <View style={styles.statsContainer}>
        <Animated.View style={[styles.statCard, styles.primaryStatCard, pulseAnimatedStyle]}>
          <MaterialIcons name="timeline" size={40} color="white" />
          <Text style={styles.statNumberPrimary}>{soberDays}</Text>
          <Text style={styles.statLabelPrimary}>Дней в пути</Text>
        </Animated.View>
        
        <View style={styles.secondaryStats}>
          <View style={styles.statCard}>
            <MaterialIcons name="local-fire-department" size={28} color="#FF9800" />
            <Text style={styles.statNumber}>{streakDays}</Text>
            <Text style={styles.statLabel}>Серия дней</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={28} color="#4CAF50" />
            <Text style={styles.statNumber}>{totalSoberDays}</Text>
            <Text style={styles.statLabel}>Трезвых дней</Text>
          </View>
        </View>
      </View>

      {/* Метрики здоровья */}
      {healthMetrics.length > 0 && (
        <View style={styles.healthContainer}>
          <Text style={styles.sectionTitle}>💚 Ваши достижения в здоровье</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.healthMetrics}>
              {healthMetrics.map((metric, index) => (
                <MemoizedHealthMetric key={index} metric={metric} index={index} />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Быстрые действия */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>⚡ Быстрые действия</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[
              styles.quickAction, 
              { backgroundColor: todayStatus === 'no-entry' ? '#2E7D4A' : '#666' }
            ]}
            onPress={() => {
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
              {todayStatus === 'no-entry' ? 'Отметить день' : 'День отмечен'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: '#FF6B6B' }]}
            onPress={() => setShowCrisisIntervention(true)}
          >
            <MaterialIcons name="emergency" size={28} color="white" />
            <Text style={styles.quickActionText}>Нужна помощь</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: '#007AFF' }]}
            onPress={() => setShowCalendar(true)}
          >
            <MaterialIcons name="calendar-month" size={28} color="white" />
            <Text style={styles.quickActionText}>Календарь</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Навигация по инструментам */}
      <View style={styles.navigationContainer}>
        <Text style={styles.sectionTitle}>🛠 Инструменты восстановления</Text>
        <View style={styles.navigationGrid}>
          {navigationItems.map((item, index) => (
            <MemoizedNavCard 
              key={index} 
              item={item} 
              onPress={() => handleNavigation(item.route)}
            />
          ))}
        </View>
      </View>

      {/* Система достижений с ленивой загрузкой */}
      <React.Suspense fallback={
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D4A" />
          <Text style={styles.loadingText}>Загрузка достижений...</Text>
        </View>
      }>
        <AchievementSystem />
      </React.Suspense>

      {/* Calendar Modal */}
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
                {new Date(selectedDate).toLocaleDateString('ru', { 
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

      {/* Mood Selector Modal */}
      <Modal visible={showMoodSelector} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.moodModalContent}>
            <Text style={styles.modalTitle}>Как ваше настроение?</Text>
            <Text style={styles.modalSubtitle}>
              Выберите ваше состояние для {new Date(selectedDate).toLocaleDateString('ru')}
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
                    {moodValue === 1 ? 'Плохо' : moodValue === 2 ? 'Грустно' : 
                     moodValue === 3 ? 'Нормально' : moodValue === 4 ? 'Хорошо' : 'Отлично'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowMoodSelector(false)}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleLogDay('sober')}
              >
                <MaterialIcons name="check" size={20} color="white" />
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Трезвый день</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.relapseButton}
              onPress={() => handleLogDay('relapse')}
            >
              <Text style={styles.relapseButtonText}>Отметить срыв</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

      {/* Crisis Intervention Modal с ленивой загрузкой */}
      {showCrisisIntervention && (
        <React.Suspense fallback={
          <Modal visible={showCrisisIntervention} transparent>
            <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#2E7D4A" />
              <Text style={[styles.loadingText, { color: 'white' }]}>Загрузка помощи...</Text>
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
    justifyContent: 'center',
    alignItems: 'center'
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
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
  primaryStatCard: {
    backgroundColor: '#2E7D4A',
    alignItems: 'center',
    padding: 25
  },
  statNumberPrimary: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10
  },
  statLabelPrimary: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    fontWeight: '500'
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: 15
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginTop: 8
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500'
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
  healthMetrics: {
    flexDirection: 'row',
    gap: 12
  },
  healthMetric: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 120
  },
  healthText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center'
  },
  healthDays: {
    fontSize: 11,
    color: '#666',
    marginTop: 2
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
  navigationContainer: {
    margin: 20
  },
  navigationGrid: {
    gap: 12
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  navIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative'
  },
  newBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  newBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold'
  },
  navContent: {
    flex: 1
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  navDescription: {
    fontSize: 14,
    color: '#666'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
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

// Экспорт с мемоизацией
export default React.memo(HomePage);
