
// Расширенная страница НЛП техник и упражнений с новым контентом

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  interpolate
} from 'react-native-reanimated';
import { 
  advancedNLPTechniques, 
  additionalNLPTechniques, 
  beliefWorkTechniques, 
  integrativeNLPTechniques
} from '../../services/enhancedNLPService';
import { advancedCBTTechniques } from '../../services/PsychologyService';
import { traumaInformedTechniques } from '../../services/traumaTherapyService';
import { integrativeTherapyTechniques } from '../../services/integrativeTherapyService';
import { allExpandedTechniques } from '../../services/expandedNLPTechniques';


// Объединенная библиотека всех техник
const allTechniques = [
  ...advancedNLPTechniques.map(tech => ({ ...tech, category: 'НЛП Базовые', color: '#FF9800', difficulty: (tech as any).difficulty ?? 'intermediate' })),
  ...additionalNLPTechniques.map(tech => ({ ...tech, category: 'НЛП Продвинутые', color: '#FF5722', difficulty: (tech as any).difficulty ?? 'intermediate' })),
  ...beliefWorkTechniques.map(tech => ({ ...tech, category: 'Работа с убеждениями', color: '#E91E63', difficulty: (tech as any).difficulty ?? 'intermediate' })),
  ...integrativeNLPTechniques.map(tech => ({ ...tech, category: 'НЛП Интегративные', color: '#9C27B0', difficulty: (tech as any).difficulty ?? 'intermediate' })),
  ...advancedCBTTechniques.map(tech => ({ ...tech, category: 'КПТ', color: '#2196F3', difficulty: (tech as any).difficulty ?? 'intermediate' })),
  ...traumaInformedTechniques.map(tech => ({ ...tech, category: 'Работа с травмой', color: '#673AB7', difficulty: (tech as any).difficulty ?? 'intermediate' })),
  ...integrativeTherapyTechniques.map(tech => ({ ...tech, category: 'Интегративные методы', color: '#4CAF50', difficulty: (tech as any).difficulty ?? 'intermediate' })),
  ...allExpandedTechniques.map(tech => ({ ...tech, category: 'НЛП Расширенные', color: '#00BCD4', difficulty: (tech as any).difficulty ?? 'intermediate' }))
];

interface Technique {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  duration: number;
  color: string;
  steps?: { title: string; instruction: string; duration?: number; tips?: string[]; type?: string }[];
  benefits?: string[];
  contraindications?: string[];
  precautions?: string[];
}

// ==========================================
// Компонент дыхательного круга анимации
// ==========================================
const BreathingCircle: React.FC = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 4000 }),
        withTiming(1, { duration: 4000 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 4000 }),
        withTiming(0.5, { duration: 4000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const innerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [1, 1.6], [1.4, 0.9]) }],
    opacity: interpolate(opacity.value, [0.5, 0.9], [0.9, 0.4]),
  }));

  return (
    <View style={breathingStyles.container}>
      <Animated.View style={[breathingStyles.outerCircle, animatedStyle]} />
      <Animated.View style={[breathingStyles.innerCircle, innerAnimatedStyle]} />
      <Text style={breathingStyles.breathText}>🌬️ Дышите...</Text>
    </View>
  );
};

const breathingStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginVertical: 20,
  },
  outerCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
  },
  innerCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 152, 0, 0.5)',
  },
  breathText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    zIndex: 1,
  },
});

// Мемоизированные компоненты
const MemoizedTechniqueCard = React.memo(({ technique, onPress }: {
  technique: Technique;
  onPress: () => void;
}) => {
  const scaleValue = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.96, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#FF5722';
      case 'expert': return '#9C27B0';
      default: return '#666';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      case 'expert': return 'Эксперт';
      default: return difficulty;
    }
  };

  return (
    <Animated.View style={[styles.techniqueCard, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.techniqueContent}>
        <View style={styles.techniqueHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: technique.color }]}>
            <Text style={styles.categoryText}>{technique.category}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(technique.difficulty) }]}>
            <Text style={styles.difficultyText}>{getDifficultyText(technique.difficulty)}</Text>
          </View>
        </View>
        
        <Text style={styles.techniqueName}>{technique.name}</Text>
        <Text style={styles.techniqueDescription} numberOfLines={2}>
          {technique.description}
        </Text>
        
        <View style={styles.techniqueFooter}>
          <View style={styles.durationContainer}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.durationText}>{technique.duration} мин</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});
MemoizedTechniqueCard.displayName = 'MemoizedTechniqueCard';

const MemoizedFilterChip = React.memo(({ label, selected, onPress, color }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color: string;
}) => {
  const scaleValue = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          selected && { backgroundColor: color },
          selected && styles.selectedChip
        ]}
        onPress={handlePress}
      >
        <Text style={[
          styles.filterChipText,
          selected && styles.selectedChipText
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});
MemoizedFilterChip.displayName = 'MemoizedFilterChip';

export default function EnhancedExercisesPage() {
  const insets = useSafeAreaInsets();
  
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Все');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Новые состояния для таймера обратного отсчёта
  const [countdownTimer, setCountdownTimer] = useState(0);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Состояния для экрана завершения
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Состояние для модального окна напоминаний
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Анимации
  const fadeInValue = useSharedValue(0);
  const slideValue = useSharedValue(30);

  const fadeInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: slideValue.value }]
  }));

  React.useEffect(() => {
    fadeInValue.value = withTiming(1, { duration: 800 });
    slideValue.value = withTiming(0, { duration: 800 });
  }, []);

  // ==========================================
  // Таймер обратного отсчёта
  // ==========================================
  useEffect(() => {
    if (isCountdownRunning && countdownTimer > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdownTimer(prev => {
          if (prev <= 1) {
            // Таймер достиг 0 — автопереход к следующему шагу
            runOnJS(autoAdvanceStep)();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isCountdownRunning, countdownTimer, currentStep, selectedTechnique]);

  // Автопереход к следующему шагу
  const autoAdvanceStep = useCallback(() => {
    setIsCountdownRunning(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    handleNextStep();
  }, []);

  // Запуск таймера для текущего шага
  const startCountdownForStep = useCallback((durationMinutes: number) => {
    const totalSeconds = durationMinutes * 60;
    setCountdownTimer(totalSeconds);
    setIsCountdownRunning(true);
  }, []);

  // Пауза/возобновление таймера
  const toggleCountdown = useCallback(() => {
    if (isCountdownRunning) {
      setIsCountdownRunning(false);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    } else if (countdownTimer > 0) {
      setIsCountdownRunning(true);
    }
  }, [isCountdownRunning, countdownTimer]);

  // Форматирование таймера в MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Фильтры
  const categories = useMemo(() => {
    const cats = ['Все', ...new Set(allTechniques.map(tech => tech.category))];
    return cats;
  }, []);

  const difficulties = useMemo(() => {
    const diffs = ['Все', ...new Set(allTechniques.map(tech => tech.difficulty))];
    return diffs;
  }, []);

  // Фильтрация техник (с учётом поиска)
  const filteredTechniques = useMemo(() => {
    return allTechniques.filter(tech => {
      const categoryMatch = selectedCategory === 'Все' || tech.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === 'Все' || tech.difficulty === selectedDifficulty;
      const searchMatch = searchQuery === '' || 
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.category.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && difficultyMatch && searchMatch;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  // Вычисляемое общее время сессии и время шага
  const getStepTimerMinutes = useCallback(() => {
    if (!selectedTechnique?.steps?.[currentStep]) return 0;
    return selectedTechnique.steps[currentStep].duration ?? 1;
  }, [selectedTechnique, currentStep]);

  // ==========================================
  // Обработчики
  // ==========================================
  const handleTechniquePress = useCallback((technique: Technique) => {
    setSelectedTechnique(technique);
    setCurrentStep(0);
    setIsSessionActive(false);
    setSessionTimer(0);
    setIsCountdownRunning(false);
    setCountdownTimer(0);
    setSelectedMood(null);
    setShowCompletionModal(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleStartSession = useCallback(() => {
    if (!selectedTechnique?.steps || selectedTechnique.steps.length === 0) {
      // Пустое состояние вместо alert
      return;
    }
    
    setIsSessionActive(true);
    setCurrentStep(0);
    setSessionTimer(0);
    setSessionStartTime(Date.now());
    setSelectedMood(null);
    setShowCompletionModal(false);

    // Запускаем таймер для первого шага
    const firstStepDuration = selectedTechnique.steps[0].duration ?? 1;
    startCountdownForStep(firstStepDuration);
  }, [selectedTechnique, startCountdownForStep]);

  const handleNextStep = useCallback(() => {
    if (!selectedTechnique?.steps) return;
    
    // Останавливаем таймер перед переходом
    setIsCountdownRunning(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (currentStep < selectedTechnique.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Запускаем таймер для следующего шага
      const nextStepDuration = selectedTechnique.steps[nextStep].duration ?? 1;
      startCountdownForStep(nextStepDuration);
    } else {
      // Упражнение завершено — показываем экран завершения
      setIsSessionActive(false);
      setShowCompletionModal(true);
    }
  }, [selectedTechnique, currentStep, startCountdownForStep]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setIsCountdownRunning(false);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCurrentStep(currentStep - 1);
      // Запускаем таймер для предыдущего шага
      const prevStepDuration = selectedTechnique?.steps?.[currentStep - 1]?.duration ?? 1;
      startCountdownForStep(prevStepDuration);
    }
  }, [currentStep, selectedTechnique, startCountdownForStep]);

  const handleSaveToJournal = useCallback(() => {
    const elapsed = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;
    const stepsCompleted = (selectedTechnique?.steps?.length ?? 0);
    const moodText = selectedMood === 'good' ? 'Хорошо' : selectedMood === 'neutral' ? 'Нормально' : selectedMood === 'bad' ? 'Трудно' : 'Не указано';

    if (Platform.OS === 'web') {
      alert(`✅ Сессия сохранена в дневник!\n\nТехника: ${selectedTechnique?.name}\nВремя: ${formatTimer(elapsed)}\nШагов: ${stepsCompleted}\nНастроение: ${moodText}`);
    } else {
      Alert.alert(
        '✅ Сохранено в дневник',
        `Техника: ${selectedTechnique?.name}\nВремя: ${formatTimer(elapsed)}\nШагов: ${stepsCompleted}\nНастроение: ${moodText}`
      );
    }
    setShowCompletionModal(false);
    setSelectedTechnique(null);
  }, [selectedMood, sessionStartTime, selectedTechnique]);

  const handleCloseCompletionModal = useCallback(() => {
    setShowCompletionModal(false);
    setSelectedTechnique(null);
    setSelectedMood(null);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'НЛП Базовые': return '#FF9800';
      case 'НЛП Продвинутые': return '#FF5722';
      case 'Работа с убеждениями': return '#E91E63';
      case 'НЛП Интегративные': return '#9C27B0';
      case 'КПТ': return '#2196F3';
      case 'Работа с травмой': return '#673AB7';
      case 'Интегративные методы': return '#4CAF50';
      default: return '#666';
    }
  };

  // Определяем, нужно ли показать дыхательный круг
  const currentStepData = selectedTechnique?.steps?.[currentStep];
  const showBreathing = currentStepData?.type === 'breathing' || currentStepData?.type === 'preparation';

  // Общее количество шагов
  const totalSteps = selectedTechnique?.steps?.length ?? 0;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="self-improvement" size={32} color="white" />
          <Text style={styles.headerTitle}>Техники и упражнения</Text>
          <Text style={styles.headerSubtitle}>
            {allTechniques.length}+ проверенных методов восстановления • Полная библиотека НЛП техник
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, fadeInAnimatedStyle]}>
        {/* Статистика */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{allTechniques.length}</Text>
            <Text style={styles.statLabel}>Техник</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{categories.length - 1}</Text>
            <Text style={styles.statLabel}>Категорий</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(allTechniques.reduce((sum, tech) => sum + tech.duration, 0) / allTechniques.length)}
            </Text>
            <Text style={styles.statLabel}>мин среднее</Text>
          </View>
        </View>

        {/* Кнопка напоминания */}
        <TouchableOpacity
          style={styles.reminderButton}
          onPress={() => setShowReminderModal(true)}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.reminderGradient}
          >
            <MaterialIcons name="notifications-active" size={22} color="white" />
            <Text style={styles.reminderText}>Напоминание практики</Text>
            <MaterialIcons name="chevron-right" size={22} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Поиск */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={22} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск техник..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={22} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Фильтры по категориям */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Категории</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {categories.map((category) => {
                const categoryKey = `category-${category}`;
                return (
                  <MemoizedFilterChip
                    key={categoryKey}
                    label={category}
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                    color={getCategoryColor(category)}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Фильтры по сложности */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Уровень сложности</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {difficulties.map((difficulty) => {
                const difficultyColors: { [key: string]: string } = {
                  'Все': '#666',
                  'beginner': '#4CAF50',
                  'intermediate': '#FF9800',
                  'advanced': '#FF5722',
                  'expert': '#9C27B0'
                };
                const difficultyKey = `difficulty-${difficulty}`;
                return (
                  <MemoizedFilterChip
                    key={difficultyKey}
                    label={difficulty === 'Все' ? 'Все' : 
                           difficulty === 'beginner' ? 'Начинающий' :
                           difficulty === 'intermediate' ? 'Средний' :
                           difficulty === 'advanced' ? 'Продвинутый' : 'Эксперт'}
                    selected={selectedDifficulty === difficulty}
                    onPress={() => setSelectedDifficulty(difficulty)}
                    color={difficultyColors[difficulty] || '#666'}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Список техник */}
        <View style={styles.techniquesContainer}>
          <Text style={styles.sectionTitle}>
            📚 Техники ({filteredTechniques.length})
          </Text>
          {filteredTechniques.length > 0 ? (
            <View style={styles.techniquesList}>
              {filteredTechniques.map((technique) => (
                <MemoizedTechniqueCard
                  key={technique.id}
                  technique={technique}
                  onPress={() => handleTechniquePress(technique)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>Техники не найдены</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Попробуйте изменить фильтры'}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* ==========================================
          Модальное окно с деталями техники
          ========================================== */}
      <Modal
        visible={selectedTechnique !== null && !showCompletionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedTechnique && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            {/* Шапка модального окна */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTechnique(null);
                  setIsCountdownRunning(false);
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                  }
                }}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedTechnique.name}
              </Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {!isSessionActive ? (
                <View>
                  {/* Информация о технике */}
                  <View style={styles.techniqueInfo}>
                    <View style={styles.techniqueBadges}>
                      <View style={[styles.categoryBadge, { backgroundColor: selectedTechnique.color }]}>
                        <Text style={styles.categoryText}>{selectedTechnique.category}</Text>
                      </View>
                      <View style={styles.durationBadge}>
                        <MaterialIcons name="schedule" size={16} color="#666" />
                        <Text style={styles.durationText}>{selectedTechnique.duration} мин</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.techniqueDescriptionFull}>
                      {selectedTechnique.description}
                    </Text>

                    {/* Преимущества */}
                    {selectedTechnique.benefits && selectedTechnique.benefits.length > 0 && (
                      <View style={styles.benefitsSection}>
                        <Text style={styles.sectionSubtitle}>✨ Преимущества:</Text>
                        {selectedTechnique.benefits.map((benefit, index) => (
                          <Text key={`benefit-${selectedTechnique.id}-${index}`} style={styles.benefitItem}>
                            • {benefit}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Предосторожности */}
                    {selectedTechnique.precautions && selectedTechnique.precautions.length > 0 && (
                      <View style={styles.warningsSection}>
                        <Text style={styles.sectionSubtitle}>⚠️ Предосторожности:</Text>
                        {selectedTechnique.precautions.map((precaution, index) => (
                          <Text key={`precaution-${selectedTechnique.id}-${index}`} style={styles.warningItem}>
                            • {precaution}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Противопоказания */}
                    {selectedTechnique.contraindications && selectedTechnique.contraindications.length > 0 && (
                      <View style={styles.contraindicationsSection}>
                        <Text style={styles.sectionSubtitle}>🚫 Противопоказания:</Text>
                        {selectedTechnique.contraindications.map((contraindication, index) => (
                          <Text key={`contraindication-${selectedTechnique.id}-${index}`} style={styles.contraindicationItem}>
                            • {contraindication}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Пустое состояние — нет шагов */}
                  {(!selectedTechnique.steps || selectedTechnique.steps.length === 0) ? (
                    <View style={styles.noStepsContainer}>
                      <MaterialIcons name="info-outline" size={48} color="#CCC" />
                      <Text style={styles.noStepsTitle}>Нет интерактивных шагов</Text>
                      <Text style={styles.noStepsText}>
                        Эта техника пока не имеет пошагового руководства. {'\n'}
                        Вы можете прочитать описание и попробовать применить самостоятельно.
                      </Text>
                    </View>
                  ) : (
                    /* Кнопка начала сессии */
                    <TouchableOpacity
                      style={styles.startSessionButton}
                      onPress={handleStartSession}
                    >
                      <LinearGradient
                        colors={[selectedTechnique.color, selectedTechnique.color + '80']}
                        style={styles.startSessionGradient}
                      >
                        <MaterialIcons name="play-arrow" size={24} color="white" />
                        <Text style={styles.startSessionText}>Начать упражнение</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View>
                  {/* ==========================================
                      Активная сессия
                      ========================================== */}
                  <View style={styles.sessionContainer}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionStep}>
                        Шаг {currentStep + 1} из {totalSteps}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setIsSessionActive(false);
                          setIsCountdownRunning(false);
                          if (countdownIntervalRef.current) {
                            clearInterval(countdownIntervalRef.current);
                            countdownIntervalRef.current = null;
                          }
                        }}
                        style={styles.exitSessionButton}
                      >
                        <MaterialIcons name="exit-to-app" size={20} color="#FF6B6B" />
                        <Text style={styles.exitSessionText}>Выйти</Text>
                      </TouchableOpacity>
                    </View>

                    {/* ==========================================
                        Таймер обратного отсчёта
                        ========================================== */}
                    <View style={styles.countdownContainer}>
                      <Text style={styles.countdownLabel}>Осталось:</Text>
                      <Text style={styles.countdownTime}>{formatTimer(countdownTimer)}</Text>
                      <TouchableOpacity
                        style={styles.countdownToggleButton}
                        onPress={toggleCountdown}
                      >
                        <MaterialIcons
                          name={isCountdownRunning ? 'pause' : 'play-arrow'}
                          size={28}
                          color="#FF9800"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* ==========================================
                        Дыхательный круг
                        ========================================== */}
                    {showBreathing && <BreathingCircle />}

                    {selectedTechnique.steps && selectedTechnique.steps[currentStep] && (
                      <View style={styles.currentStepContainer}>
                        <Text style={styles.stepTitle}>
                          {selectedTechnique.steps[currentStep].title}
                        </Text>
                        <Text style={styles.stepInstruction}>
                          {selectedTechnique.steps[currentStep].instruction}
                        </Text>
                        
                        {selectedTechnique.steps[currentStep].duration && (
                          <View style={styles.stepDuration}>
                            <MaterialIcons name="timer" size={16} color="#666" />
                            <Text style={styles.stepDurationText}>
                              Рекомендуемое время: {selectedTechnique.steps[currentStep].duration} мин
                            </Text>
                          </View>
                        )}

                        {selectedTechnique.steps[currentStep].tips && (
                          <View style={styles.tipsSection}>
                            <Text style={styles.tipsTitle}>💡 Советы:</Text>
                            {selectedTechnique.steps[currentStep].tips.map((tip: string, index: number) => (
                              <Text key={`tip-${selectedTechnique.id}-${currentStep}-${index}`} style={styles.tipItem}>• {tip}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    {/* ==========================================
                        Прогресс-точки шагов
                        ========================================== */}
                    <View style={styles.progressDotsContainer}>
                      {selectedTechnique.steps?.map((_, index) => (
                        <View
                          key={`dot-${index}`}
                          style={[
                            styles.progressDot,
                            index === currentStep && styles.progressDotActive,
                            index < currentStep && styles.progressDotCompleted,
                          ]}
                        />
                      ))}
                    </View>

                    {/* Навигация по шагам */}
                    <View style={styles.stepNavigation}>
                      <TouchableOpacity
                        style={[styles.navButton, currentStep === 0 && styles.disabledButton]}
                        onPress={handlePreviousStep}
                        disabled={currentStep === 0}
                      >
                        <MaterialIcons name="chevron-left" size={24} color={currentStep === 0 ? '#CCC' : '#666'} />
                        <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>
                          Назад
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.navButton}
                        onPress={handleNextStep}
                      >
                        <Text style={styles.navButtonText}>
                          {currentStep === (selectedTechnique.steps?.length || 0) - 1 ? 'Завершить' : 'Далее'}
                        </Text>
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ==========================================
          Модальное окно завершения сессии
          ========================================== */}
      <Modal
        visible={showCompletionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCloseCompletionModal}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Упражнение завершено</Text>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.completionContent}>
            {/* Праздничное сообщение */}
            <Text style={styles.completionEmoji}>🎉🎊✨</Text>
            <Text style={styles.completionTitle}>Поздравляем!</Text>
            <Text style={styles.completionSubtitle}>
              Вы успешно завершили упражнение «{selectedTechnique?.name}»
            </Text>

            {/* Статистика */}
            <View style={styles.completionStats}>
              <View style={styles.completionStatItem}>
                <MaterialIcons name="timer" size={28} color="#FF9800" />
                <Text style={styles.completionStatNumber}>
                  {sessionStartTime ? formatTimer(Math.round((Date.now() - sessionStartTime) / 1000)) : '00:00'}
                </Text>
                <Text style={styles.completionStatLabel}>Общее время</Text>
              </View>
              <View style={styles.completionStatItem}>
                <MaterialIcons name="check-circle" size={28} color="#4CAF50" />
                <Text style={styles.completionStatNumber}>{totalSteps}</Text>
                <Text style={styles.completionStatLabel}>Шагов выполнено</Text>
              </View>
            </View>

            {/* Выбор настроения */}
            <Text style={styles.moodTitle}>Как вы себя чувствуете?</Text>
            <View style={styles.moodSelector}>
              <TouchableOpacity
                style={[
                  styles.moodButton,
                  selectedMood === 'good' && styles.moodButtonSelected
                ]}
                onPress={() => setSelectedMood('good')}
              >
                <Text style={styles.moodEmoji}>😊</Text>
                <Text style={styles.moodLabel}>Хорошо</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.moodButton,
                  selectedMood === 'neutral' && styles.moodButtonSelected
                ]}
                onPress={() => setSelectedMood('neutral')}
              >
                <Text style={styles.moodEmoji}>😐</Text>
                <Text style={styles.moodLabel}>Нормально</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.moodButton,
                  selectedMood === 'bad' && styles.moodButtonSelected
                ]}
                onPress={() => setSelectedMood('bad')}
              >
                <Text style={styles.moodEmoji}>😔</Text>
                <Text style={styles.moodLabel}>Трудно</Text>
              </TouchableOpacity>
            </View>

            {/* Кнопка сохранения в дневник */}
            <TouchableOpacity
              style={styles.saveJournalButton}
              onPress={handleSaveToJournal}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.saveJournalGradient}
              >
                <MaterialIcons name="book" size={22} color="white" />
                <Text style={styles.saveJournalText}>Сохранить в дневник</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Закрыть */}
            <TouchableOpacity
              style={styles.closeCompletionButton}
              onPress={handleCloseCompletionModal}
            >
              <Text style={styles.closeCompletionText}>Закрыть</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ==========================================
          Модальное окно напоминаний
          ========================================== */}
      <Modal
        visible={showReminderModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowReminderModal(false)}
      >
        <View style={styles.reminderModalOverlay}>
          <View style={styles.reminderModalContent}>
            <View style={styles.reminderModalHeader}>
              <MaterialIcons name="notifications-active" size={32} color="#FF9800" />
              <Text style={styles.reminderModalTitle}>Напоминание практики</Text>
            </View>
            <Text style={styles.reminderModalText}>
              Чтобы установить напоминание о ежедневной практике, перейдите в раздел «Настройки» приложения и включите(push-уведомления).{'\n\n'}
              Рекомендуемое время для практики:{'\n'}
              🌅 Утро (7:00-9:00) — для энергичного начала дня{'\n'}
              🌙 Вечер (20:00-22:00) — для расслабления перед сном{'\n\n'}
              Регулярная практика значительно повышает эффективность техник!
            </Text>
            <TouchableOpacity
              style={styles.reminderCloseButton}
              onPress={() => setShowReminderModal(false)}
            >
              <Text style={styles.reminderCloseButtonText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    padding: 20,
    alignItems: 'center'
  },
  headerContent: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4
  },
  content: {
    padding: 20
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800'
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },

  // Поиск
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },

  // Кнопка напоминания
  reminderButton: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  },
  reminderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12
  },
  reminderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },

  filtersSection: {
    marginBottom: 20
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedChip: {
    borderColor: 'rgba(255,255,255,0.3)'
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  selectedChipText: {
    color: 'white'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 16
  },
  techniquesContainer: {
    marginBottom: 20
  },
  techniquesList: {
    gap: 12
  },
  techniqueCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  techniqueContent: {
    padding: 16
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  difficultyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold'
  },
  techniqueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  techniqueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  emptyState: {
    alignItems: 'center',
    padding: 40
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600'
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  closeButton: {
    padding: 8,
    marginRight: 12
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  modalContent: {
    flex: 1
  },
  techniqueInfo: {
    padding: 20
  },
  techniqueBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4
  },
  techniqueDescriptionFull: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  benefitsSection: {
    marginBottom: 20
  },
  benefitItem: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
    lineHeight: 20
  },
  warningsSection: {
    marginBottom: 20
  },
  warningItem: {
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 4,
    lineHeight: 20
  },
  contraindicationsSection: {
    marginBottom: 20
  },
  contraindicationItem: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 4,
    lineHeight: 20
  },

  // Пустое состояние для шагов
  noStepsContainer: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  noStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noStepsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },

  startSessionButton: {
    margin: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  startSessionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    gap: 8
  },
  startSessionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  sessionContainer: {
    padding: 20
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  sessionStep: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800'
  },
  exitSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  exitSessionText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600'
  },

  // Таймер обратного отсчёта
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: 12,
  },
  countdownLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  countdownTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    fontVariant: ['tabular-nums'],
  },
  countdownToggleButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 20,
  },

  currentStepContainer: {
    marginBottom: 20
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  stepInstruction: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16
  },
  stepDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6
  },
  stepDurationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  tipsSection: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50'
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20
  },

  // Прогресс-точки
  progressDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#FF9800',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  progressDotCompleted: {
    backgroundColor: '#4CAF50',
  },

  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    gap: 4
  },
  disabledButton: {
    backgroundColor: '#F8F8F8'
  },
  navButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600'
  },
  disabledText: {
    color: '#CCC'
  },

  // ==========================================
  // Стили экрана завершения
  // ==========================================
  completionContent: {
    alignItems: 'center',
    padding: 30,
  },
  completionEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  completionStats: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    gap: 20,
  },
  completionStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  completionStatNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  completionStatLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },

  // Выбор настроения
  moodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodSelector: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  moodButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 90,
  },
  moodButtonSelected: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  // Кнопка сохранения
  saveJournalButton: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveJournalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  saveJournalText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  closeCompletionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeCompletionText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },

  // ==========================================
  // Стили модального окна напоминаний
  // ==========================================
  reminderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  reminderModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  reminderModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  reminderModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  reminderModalText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  reminderCloseButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reminderCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
