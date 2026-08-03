import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  advancedNLPTechniques,
  additionalNLPTechniques,
  beliefWorkTechniques,
  integrativeNLPTechniques,
  mindfulnessExercises,
  MindfulnessExercise,
} from '../../services/enhancedNLPService';
import {
  microTechniques,
  MicroTechnique,
} from '../../services/therapeuticTechniques';
import { advancedCBTTechniques } from '../../services/PsychologyService';
import { traumaInformedTechniques } from '../../services/traumaTherapyService';
import { integrativeTherapyTechniques } from '../../services/integrativeTherapyService';
import { allExpandedTechniques } from '../../services/expandedNLPTechniques';

// ---------------------------------------------------------------------------
// Combined technique library (8 sources from enhanced-exercises)
// ---------------------------------------------------------------------------
const allTechniques: Technique[] = [
  ...advancedNLPTechniques.map((tech) => ({
    ...tech,
    category: 'НЛП Базовые',
    color: '#FF9800',
    difficulty: (tech as any).difficulty ?? 'intermediate',
  })),
  ...additionalNLPTechniques.map((tech) => ({
    ...tech,
    category: 'НЛП Продвинутые',
    color: '#FF5722',
    difficulty: (tech as any).difficulty ?? 'intermediate',
  })),
  ...beliefWorkTechniques.map((tech) => ({
    ...tech,
    category: 'Работа с убеждениями',
    color: '#E91E63',
    difficulty: (tech as any).difficulty ?? 'intermediate',
  })),
  ...integrativeNLPTechniques.map((tech) => ({
    ...tech,
    category: 'НЛП Интегративные',
    color: '#9C27B0',
    difficulty: (tech as any).difficulty ?? 'intermediate',
  })),
  ...advancedCBTTechniques.map((tech) => ({
    ...tech,
    category: 'КПТ',
    color: '#2196F3',
    difficulty: (tech as any).difficulty ?? 'intermediate',
  })),
  ...traumaInformedTechniques.map((tech) => ({
    ...tech,
    category: 'Работа с травмой',
    color: '#673AB7',
    difficulty: (tech as any).difficulty ?? 'intermediate',
  })),
  ...integrativeTherapyTechniques.map((tech) => ({
    ...tech,
    category: 'Интегративные методы',
    color: '#4CAF50',
    difficulty: (tech as any).difficulty ?? 'intermediate',
  })),
  ...allExpandedTechniques.map((tech) => ({
    ...tech,
    category: 'НЛП Расширенные',
    color: '#00BCD4',
    difficulty: (tech as any).difficulty ?? 'intermediate',
  })),
];

// ---------------------------------------------------------------------------
// Unified technique interface
// ---------------------------------------------------------------------------
interface Technique {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  duration: number;
  color: string;
  steps?: {
    title: string;
    instruction: string;
    duration?: number;
    tips?: string[];
    warnings?: string[];
    type?: string;
  }[];
  benefits?: string[];
  contraindications?: string[];
  precautions?: string[];
}

// ---------------------------------------------------------------------------
// Unified guided-step type
// ---------------------------------------------------------------------------
interface GuidedStep {
  title: string;
  instruction: string;
  durationSeconds: number;
  stepType: string;
  tips?: string[];
  warnings?: string[];
}

// ---------------------------------------------------------------------------
// Conversion helpers – build GuidedStep arrays from different types
// ---------------------------------------------------------------------------
const buildGuidedSteps = {
  generic: (t: Technique): GuidedStep[] =>
    (t.steps ?? []).map((s) => ({
      title: s.title,
      instruction: s.instruction,
      durationSeconds: (s.duration ?? 1) * 60,
      stepType: s.type ?? 'mental',
      tips: s.tips,
      warnings: s.warnings,
    })),
  mindfulness: (e: MindfulnessExercise): GuidedStep[] => {
    const dur = Math.ceil((e.duration * 60) / e.instructions.length);
    return e.instructions.map((inst, i) => ({
      title: `Шаг ${i + 1}`,
      instruction: inst,
      durationSeconds: dur,
      stepType: 'mental',
    }));
  },
  micro: (t: MicroTechnique): GuidedStep[] => {
    const dur = Math.ceil(t.duration / t.steps.length);
    return t.steps.map((s, i) => ({
      title: `Шаг ${i + 1}`,
      instruction: s,
      durationSeconds: dur,
      stepType: 'mental',
    }));
  },
};

// ---------------------------------------------------------------------------
// Format seconds → MM:SS
// ---------------------------------------------------------------------------
const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ---------------------------------------------------------------------------
// BreathingCircle – simple single-circle animation (from exercises.tsx)
// ---------------------------------------------------------------------------
const BreathingCircle: React.FC = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.45, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.breathingContainer}>
      <Animated.View style={[styles.breathingCircle, animatedStyle]} />
      <Text style={styles.breathingText}>🫁 Дышите глубоко…</Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// MemoizedTechniqueCard – spring animation on press
// ---------------------------------------------------------------------------
const MemoizedTechniqueCard = React.memo(
  ({
    technique,
    onPress,
  }: {
    technique: Technique;
    onPress: () => void;
  }) => {
    const scaleValue = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
    }));

    const handlePress = () => {
      scaleValue.value = withSpring(0.96, {}, () => {
        scaleValue.value = withSpring(1);
        runOnJS(onPress)();
      });
    };

    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'beginner':
          return '#4CAF50';
        case 'intermediate':
          return '#FF9800';
        case 'advanced':
          return '#FF5722';
        case 'expert':
          return '#9C27B0';
        default:
          return '#666';
      }
    };

    const getDifficultyText = (difficulty: string) => {
      switch (difficulty) {
        case 'beginner':
          return 'Начинающий';
        case 'intermediate':
          return 'Средний';
        case 'advanced':
          return 'Продвинутый';
        case 'expert':
          return 'Эксперт';
        default:
          return difficulty;
      }
    };

    return (
      <Animated.View style={[styles.enhancedCard, animatedStyle]}>
        <TouchableOpacity
          onPress={handlePress}
          style={styles.enhancedCardContent}
        >
          <View style={styles.enhancedCardHeader}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: technique.color },
              ]}
            >
              <Text style={styles.categoryText}>{technique.category}</Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(technique.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>
                {getDifficultyText(technique.difficulty)}
              </Text>
            </View>
          </View>

          <Text style={styles.enhancedCardName}>{technique.name}</Text>
          <Text style={styles.enhancedCardDesc} numberOfLines={2}>
            {technique.description}
          </Text>

          <View style={styles.enhancedCardFooter}>
            <View style={styles.metaRow}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.metaText}>{technique.duration} мин</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="format-list-numbered" size={16} color="#666" />
              <Text style={styles.metaText}>
                {technique.steps?.length ?? 0} шагов
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#999" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);
MemoizedTechniqueCard.displayName = 'MemoizedTechniqueCard';

// ---------------------------------------------------------------------------
// MemoizedFilterChip – spring animation
// ---------------------------------------------------------------------------
const MemoizedFilterChip = React.memo(
  ({
    label,
    selected,
    onPress,
    color,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
    color: string;
  }) => {
    const scaleValue = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
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
            selected && styles.selectedChip,
          ]}
          onPress={handlePress}
        >
          <Text
            style={[
              styles.filterChipText,
              selected && styles.selectedChipText,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);
MemoizedFilterChip.displayName = 'MemoizedFilterChip';

// ===========================================================================
// Main component
// ===========================================================================
export default function ExercisesPage() {
  const insets = useSafeAreaInsets();

  // -- category tabs
  const [activeCategory, setActiveCategory] = useState<string>('all');
  // -- search
  const [searchQuery, setSearchQuery] = useState('');
  // -- completed counter
  const [completedCount, setCompletedCount] = useState(0);

  // -- guided modal state
  const [guidedVisible, setGuidedVisible] = useState(false);
  const [guidedTitle, setGuidedTitle] = useState('');
  const [guidedSteps, setGuidedSteps] = useState<GuidedStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStepRef = useRef(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isMicroMode, setIsMicroMode] = useState(false);
  const autoAdvancingRef = useRef(false);

  // -- completion stats
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // -- difficulty filter
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Все');

  // -- reminder modal
  const [showReminderModal, setShowReminderModal] = useState(false);

  // -- fade in animation
  const fadeInValue = useSharedValue(0);
  const slideValue = useSharedValue(30);
  const fadeInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: slideValue.value }],
  }));

  React.useEffect(() => {
    fadeInValue.value = withTiming(1, { duration: 800 });
    slideValue.value = withTiming(0, { duration: 800 });
  }, []);

  // -- load completed count
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem('completedExercisesCount');
        if (v) setCompletedCount(Number(v));
      } catch {}
    })();
  }, []);

  // -- sync ref
  useEffect(() => {
    currentStepRef.current = currentStepIdx;
  }, [currentStepIdx]);

  // -- timer tick
  useEffect(() => {
    if (!timerRunning || showCompletion) return;
    const id = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, showCompletion]);

  // -- auto-advance when timer hits 0
  useEffect(() => {
    if (
      timerSeconds === 0 &&
      !timerRunning &&
      guidedVisible &&
      !showCompletion &&
      guidedSteps.length > 0 &&
      !autoAdvancingRef.current
    ) {
      autoAdvancingRef.current = true;
      const t = setTimeout(() => {
        autoAdvancingRef.current = false;
        const idx = currentStepRef.current;
        if (idx < guidedSteps.length - 1) {
          startStep(idx + 1);
        } else {
          completeExercise();
        }
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [
    timerSeconds,
    timerRunning,
    guidedVisible,
    showCompletion,
    guidedSteps.length,
  ]);

  // -- step helpers
  const startStep = (idx: number) => {
    setCurrentStepIdx(idx);
    currentStepRef.current = idx;
    const dur = guidedSteps[idx]?.durationSeconds || 60;
    setTimerSeconds(dur);
    setTimerRunning(true);
  };

  const completeExercise = () => {
    setTimerRunning(false);
    setShowCompletion(true);
  };

  const openGuided = (
    name: string,
    steps: GuidedStep[],
    micro: boolean = false,
  ) => {
    setGuidedTitle(name);
    setGuidedSteps(steps);
    setCurrentStepIdx(0);
    currentStepRef.current = 0;
    setTimerSeconds(steps[0]?.durationSeconds || 60);
    setTimerRunning(true);
    setShowCompletion(false);
    setSelectedMood(null);
    setIsMicroMode(micro);
    setSessionStartTime(Date.now());
    setGuidedVisible(true);
  };

  const closeGuided = () => {
    setTimerRunning(false);
    setGuidedVisible(false);
    setShowCompletion(false);
    setSelectedMood(null);
    setSessionStartTime(null);
  };

  const handleFinish = async () => {
    try {
      const next = completedCount + 1;
      await AsyncStorage.setItem('completedExercisesCount', String(next));
      setCompletedCount(next);
    } catch {}
    closeGuided();
  };

  const goToStep = (idx: number) => {
    setCurrentStepIdx(idx);
    currentStepRef.current = idx;
    setTimerSeconds(guidedSteps[idx]?.durationSeconds || 60);
    setTimerRunning(true);
  };

  const toggleTimer = useCallback(() => {
    setTimerRunning((prev) => !prev);
  }, []);

  const handleSaveToJournal = useCallback(() => {
    const elapsed = sessionStartTime
      ? Math.round((Date.now() - sessionStartTime) / 1000)
      : 0;
    const stepsCompleted = guidedSteps.length;
    const moodText =
      selectedMood === 'good'
        ? 'Хорошо'
        : selectedMood === 'neutral'
        ? 'Нормально'
        : selectedMood === 'hard'
        ? 'Трудно'
        : 'Не указано';

    if (Platform.OS === 'web') {
      alert(
        `✅ Сессия сохранена в дневник!\n\nТехника: ${guidedTitle}\nВремя: ${formatTime(elapsed)}\nШагов: ${stepsCompleted}\nНастроение: ${moodText}`,
      );
    } else {
      Alert.alert(
        '✅ Сохранено в дневник',
        `Техника: ${guidedTitle}\nВремя: ${formatTime(elapsed)}\nШагов: ${stepsCompleted}\nНастроение: ${moodText}`,
      );
    }
    closeGuided();
  }, [selectedMood, sessionStartTime, guidedTitle, guidedSteps.length]);

  // -- category metadata
  const categoryIcons: Record<string, string> = {
    all: 'apps',
    nlp: 'psychology',
    therapy: 'healing',
    mindfulness: 'spa',
    micro: 'flash-on',
  };

  const categoryNames: Record<string, string> = {
    all: 'Все',
    nlp: 'НЛП',
    therapy: 'Терапия',
    mindfulness: 'Осознанность',
    micro: 'Экспресс',
  };

  // -- difficulty helpers
  const difficultyColors: Record<string, string> = {
    'Все': '#666',
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#FF5722',
    expert: '#9C27B0',
  };

  const difficultyDisplayNames: Record<string, string> = {
    'Все': 'Все',
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
    expert: 'Эксперт',
  };

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------
  const difficulties = useMemo(() => {
    const diffs = ['Все', ...new Set(allTechniques.map((t) => t.difficulty))];
    return diffs;
  }, []);

  const q = searchQuery.toLowerCase();

  const nlpCategories = [
    'НЛП Базовые',
    'НЛП Продвинутые',
    'Работа с убеждениями',
    'НЛП Интегративные',
    'НЛП Расширенные',
  ];
  const therapyCategories = ['КПТ', 'Работа с травмой', 'Интегративные методы'];

  const filteredNLP = useMemo(
    () =>
      allTechniques.filter(
        (t) =>
          nlpCategories.includes(t.category) &&
          (selectedDifficulty === 'Все' || t.difficulty === selectedDifficulty) &&
          (q === '' ||
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)),
      ),
    [selectedDifficulty, q],
  );

  const filteredTherapy = useMemo(
    () =>
      allTechniques.filter(
        (t) =>
          therapyCategories.includes(t.category) &&
          (selectedDifficulty === 'Все' || t.difficulty === selectedDifficulty) &&
          (q === '' ||
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)),
      ),
    [selectedDifficulty, q],
  );

  const filteredMindfulness = useMemo(
    () =>
      mindfulnessExercises.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.instructions.some((i) => i.toLowerCase().includes(q)),
      ),
    [q],
  );

  const filteredMicro = useMemo(
    () =>
      microTechniques.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.situation.toLowerCase().includes(q),
      ),
    [q],
  );

  // ===========================================================================
  // Inline card renderers for mindfulness and micro
  // ===========================================================================
  const renderMindfulnessCard = (exercise: MindfulnessExercise) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.enhancedCard}
      activeOpacity={0.8}
      onPress={() =>
        openGuided(exercise.name, buildGuidedSteps.mindfulness(exercise))
      }
    >
      <View style={styles.enhancedCardContent}>
        <View style={styles.enhancedCardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: '#00BCD4' }]}>
            <Text style={styles.categoryText}>Осознанность</Text>
          </View>
        </View>
        <Text style={styles.enhancedCardName}>{exercise.name}</Text>
        <Text style={styles.enhancedCardDesc} numberOfLines={2}>
          {exercise.instructions[0] ?? exercise.name}
        </Text>
        <View style={styles.enhancedCardFooter}>
          <View style={styles.metaRow}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.metaText}>{exercise.duration} мин</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="format-list-numbered" size={16} color="#666" />
            <Text style={styles.metaText}>
              {exercise.instructions.length} шагов
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#999" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMicroCard = (technique: MicroTechnique) => (
    <TouchableOpacity
      key={technique.id}
      style={styles.enhancedCard}
      activeOpacity={0.8}
      onPress={() =>
        openGuided(technique.name, buildGuidedSteps.micro(technique), true)
      }
    >
      <View style={styles.enhancedCardContent}>
        <View style={styles.enhancedCardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: '#FF6B6B' }]}>
            <Text style={styles.categoryText}>Экспресс</Text>
          </View>
          <View style={styles.flashBadge}>
            <MaterialIcons name="flash-on" size={16} color="#FF6B6B" />
            <Text style={styles.flashText}>{technique.duration}с</Text>
          </View>
        </View>
        <Text style={styles.enhancedCardName}>{technique.name}</Text>
        <Text style={styles.enhancedCardDesc} numberOfLines={2}>
          {technique.description}
        </Text>
        <Text style={styles.situationText}>
          <Text style={styles.situationLabel}>Когда использовать: </Text>
          {technique.situation}
        </Text>
        <View style={styles.enhancedCardFooter}>
          <View style={styles.metaRow}>
            <MaterialIcons name="flash-on" size={16} color="#FF6B6B" />
            <Text style={styles.metaText}>
              {technique.steps.length} шагов
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#999" />
        </View>
      </View>
    </TouchableOpacity>
  );

  // ===========================================================================
  // Render content based on active category
  // ===========================================================================
  const emptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="search-off" size={64} color="#CCC" />
      <Text style={styles.emptyStateText}>Техники не найдены</Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery
          ? 'Попробуйте изменить поисковый запрос'
          : 'Попробуйте изменить фильтры'}
      </Text>
    </View>
  );

  const renderAllContent = () => (
    <View style={styles.techniquesList}>
      {filteredNLP.map((technique) => (
        <MemoizedTechniqueCard
          key={technique.id}
          technique={technique}
          onPress={() =>
            openGuided(technique.name, buildGuidedSteps.generic(technique))
          }
        />
      ))}
      {filteredTherapy.map((technique) => (
        <MemoizedTechniqueCard
          key={technique.id}
          technique={technique}
          onPress={() =>
            openGuided(technique.name, buildGuidedSteps.generic(technique))
          }
        />
      ))}
      {filteredMindfulness.map((ex) => renderMindfulnessCard(ex))}
      {filteredMicro.map((t) => renderMicroCard(t))}
      {filteredNLP.length === 0 &&
        filteredTherapy.length === 0 &&
        filteredMindfulness.length === 0 &&
        filteredMicro.length === 0 &&
        emptyState()}
    </View>
  );

  const renderNLPContent = () => (
    <View style={styles.techniquesList}>
      {filteredNLP.length > 0 ? (
        filteredNLP.map((technique) => (
          <MemoizedTechniqueCard
            key={technique.id}
            technique={technique}
            onPress={() =>
              openGuided(technique.name, buildGuidedSteps.generic(technique))
            }
          />
        ))
      ) : (
        emptyState()
      )}
    </View>
  );

  const renderTherapyContent = () => (
    <View style={styles.techniquesList}>
      {filteredTherapy.length > 0 ? (
        filteredTherapy.map((technique) => (
          <MemoizedTechniqueCard
            key={technique.id}
            technique={technique}
            onPress={() =>
              openGuided(technique.name, buildGuidedSteps.generic(technique))
            }
          />
        ))
      ) : (
        emptyState()
      )}
    </View>
  );

  const renderMindfulnessContent = () => (
    <View style={styles.techniquesList}>
      {filteredMindfulness.length > 0 ? (
        filteredMindfulness.map((ex) => renderMindfulnessCard(ex))
      ) : (
        emptyState()
      )}
    </View>
  );

  const renderMicroContent = () => (
    <View style={styles.techniquesList}>
      {filteredMicro.length > 0 ? (
        filteredMicro.map((t) => renderMicroCard(t))
      ) : (
        emptyState()
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'nlp':
        return renderNLPContent();
      case 'therapy':
        return renderTherapyContent();
      case 'mindfulness':
        return renderMindfulnessContent();
      case 'micro':
        return renderMicroContent();
      case 'all':
      default:
        return renderAllContent();
    }
  };

  // ===========================================================================
  // Guided Exercise Modal
  // ===========================================================================
  const progress =
    guidedSteps.length > 0
      ? ((currentStepIdx + 1) / guidedSteps.length) * 100
      : 0;

  const currentStepData = guidedSteps[currentStepIdx] ?? null;

  const elapsedSeconds = sessionStartTime
    ? Math.round((Date.now() - sessionStartTime) / 1000)
    : 0;

  const renderGuidedContent = () => (
    <View style={styles.guidedBody}>
      {/* Close */}
      <TouchableOpacity style={styles.guidedCloseBtn} onPress={closeGuided}>
        <MaterialIcons name="close" size={24} color="#666" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.guidedTitle}>{guidedTitle}</Text>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      {/* Step counter */}
      <Text style={styles.stepCounter}>
        Шаг {currentStepIdx + 1} из {guidedSteps.length}
      </Text>

      {/* Countdown timer with pause/play */}
      <View style={styles.countdownBox}>
        <Text style={styles.countdownLabel}>Осталось:</Text>
        <Text style={styles.countdownTime}>{formatTime(timerSeconds)}</Text>
        <TouchableOpacity
          style={styles.countdownToggle}
          onPress={toggleTimer}
        >
          <MaterialIcons
            name={timerRunning ? 'pause' : 'play-arrow'}
            size={28}
            color="#FF9800"
          />
        </TouchableOpacity>
      </View>

      {/* Micro mode big timer */}
      {isMicroMode && (
        <View style={styles.bigTimerWrap}>
          <Text style={styles.bigTimerText}>{formatTime(timerSeconds)}</Text>
          <Text style={styles.bigTimerLabel}>осталось</Text>
        </View>
      )}

      {/* Step content */}
      {currentStepData && (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepInstruction}>
            {currentStepData.instruction}
          </Text>

          {currentStepData.stepType === 'breathing' && (
            <BreathingCircle key={`breath-${currentStepIdx}`} />
          )}

          {currentStepData.tips && currentStepData.tips.length > 0 && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Советы:</Text>
              {currentStepData.tips.map((tip, i) => (
                <Text key={i} style={styles.tipItem}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}

          {currentStepData.warnings &&
            currentStepData.warnings.length > 0 && (
              <View style={styles.warningsBox}>
                <Text style={styles.warningsTitle}>⚠️ Внимание:</Text>
                {currentStepData.warnings.map((w, i) => (
                  <Text key={i} style={styles.warningItem}>
                    • {w}
                  </Text>
                ))}
              </View>
            )}
        </View>
      )}

      {/* Dot indicators */}
      <View style={styles.dotsWrap}>
        {guidedSteps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentStepIdx && styles.dotActive,
              i < currentStepIdx && styles.dotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.guidedNav}>
        {currentStepIdx > 0 && (
          <TouchableOpacity
            style={styles.navPrevBtn}
            onPress={() => goToStep(currentStepIdx - 1)}
          >
            <MaterialIcons name="arrow-back" size={18} color="#2E7D4A" />
            <Text style={styles.navPrevText}>Назад</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />

        {currentStepIdx < guidedSteps.length - 1 ? (
          <TouchableOpacity
            style={styles.navNextBtn}
            onPress={() => goToStep(currentStepIdx + 1)}
          >
            <Text style={styles.navNextText}>Далее</Text>
            <MaterialIcons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navDoneBtn}
            onPress={completeExercise}
          >
            <MaterialIcons name="check" size={18} color="white" />
            <Text style={styles.navDoneText}>Завершить</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // -- completion screen
  const renderCompletion = () => (
    <View style={styles.completionWrap}>
      {/* Celebration */}
      <Text style={styles.completionEmoji}>🎉🎊✨</Text>
      <Text style={styles.completionTitle}>Поздравляем!</Text>
      <Text style={styles.completionSubtitle}>
        Вы сделали ещё один шаг к выздоровлению
      </Text>

      {/* Stats */}
      <View style={styles.completionStats}>
        <View style={styles.compStatItem}>
          <MaterialIcons name="timer" size={28} color="#FF9800" />
          <Text style={styles.compStatNum}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.compStatLabel}>Общее время</Text>
        </View>
        <View style={styles.compStatItem}>
          <MaterialIcons name="check-circle" size={28} color="#4CAF50" />
          <Text style={styles.compStatNum}>{guidedSteps.length}</Text>
          <Text style={styles.compStatLabel}>Шагов выполнено</Text>
        </View>
      </View>

      {/* Mood selector */}
      <Text style={styles.moodPrompt}>Как вы себя чувствуете?</Text>
      <View style={styles.moodRow}>
        {(
          [
            { key: 'good', emoji: '😊', label: 'Хорошо', color: '#4CAF50' },
            { key: 'neutral', emoji: '😐', label: 'Нормально', color: '#FF9800' },
            { key: 'hard', emoji: '😔', label: 'Трудно', color: '#F44336' },
          ] as const
        ).map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.moodBtn,
              { borderColor: m.color },
              selectedMood === m.key && { backgroundColor: m.color },
            ]}
            onPress={() => setSelectedMood(m.key)}
          >
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text
              style={[
                styles.moodLabel,
                selectedMood === m.key && { color: 'white' },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save to journal */}
      <TouchableOpacity
        style={styles.saveJournalBtn}
        onPress={handleSaveToJournal}
      >
        <LinearGradient
          colors={['#FF9800', '#F57C00']}
          style={styles.saveJournalGrad}
        >
          <MaterialIcons name="book" size={22} color="white" />
          <Text style={styles.saveJournalText}>Сохранить в дневник</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Finish */}
      <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
        <MaterialIcons name="check-circle" size={20} color="white" />
        <Text style={styles.finishBtnText}>Завершить</Text>
      </TouchableOpacity>
    </View>
  );

  // ===========================================================================
  // Main render
  // ===========================================================================
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ---- Header ---- */}
      <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.header}>
        <View style={styles.headerInner}>
          <MaterialIcons name="self-improvement" size={32} color="white" />
          <Text style={styles.headerTitle}>Психотехники и НЛП</Text>
          <Text style={styles.headerSubtitle}>
            {allTechniques.length +
              mindfulnessExercises.length +
              microTechniques.length}
            + проверенных методов •{' '}
            {new Set(allTechniques.map((t) => t.category)).size + 2} категорий
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.body, fadeInAnimatedStyle]}>
        {/* ---- Stats ---- */}
        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>
              {allTechniques.length +
                mindfulnessExercises.length +
                microTechniques.length}
            </Text>
            <Text style={styles.statLbl}>Техник</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>
              {new Set(allTechniques.map((t) => t.category)).size + 2}
            </Text>
            <Text style={styles.statLbl}>Категорий</Text>
          </View>
          {completedCount > 0 && (
            <View style={styles.statCell}>
              <Text style={styles.statNum}>{completedCount}</Text>
              <Text style={styles.statLbl}>Выполнено</Text>
            </View>
          )}
        </View>

        {/* ---- Reminder button ---- */}
        <TouchableOpacity
          style={styles.reminderBtn}
          onPress={() => setShowReminderModal(true)}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.reminderGrad}
          >
            <MaterialIcons name="notifications-active" size={22} color="white" />
            <Text style={styles.reminderText}>Напоминание практики</Text>
            <MaterialIcons name="chevron-right" size={22} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        {/* ---- Search ---- */}
        <View style={styles.searchBox}>
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

        {/* ---- Category tabs ---- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
        >
          <View style={styles.tabsRow}>
            {(
              ['all', 'nlp', 'therapy', 'mindfulness', 'micro'] as const
            ).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.tabBtn,
                  activeCategory === cat && styles.tabBtnActive,
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <MaterialIcons
                  name={categoryIcons[cat] as any}
                  size={18}
                  color={activeCategory === cat ? 'white' : '#2E7D4A'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeCategory === cat && styles.tabTextActive,
                  ]}
                >
                  {categoryNames[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ---- Difficulty chips ---- */}
        <View style={styles.chipsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipsRow}>
              {difficulties.map((diff) => (
                <MemoizedFilterChip
                  key={diff}
                  label={difficultyDisplayNames[diff] || diff}
                  selected={selectedDifficulty === diff}
                  onPress={() => setSelectedDifficulty(diff)}
                  color={difficultyColors[diff] || '#666'}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ---- Content ---- */}
        <ScrollView contentContainerStyle={styles.contentPad}>
          {renderContent()}
        </ScrollView>
      </Animated.View>

      {/* ================================================================
          GUIDED EXERCISE MODAL
          ================================================================ */}
      <Modal
        visible={guidedVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeGuided}
      >
        <View style={[styles.guidedWrap, { paddingTop: insets.top }]}>
          {showCompletion ? renderCompletion() : renderGuidedContent()}
        </View>
      </Modal>

      {/* ================================================================
          REMINDER MODAL
          ================================================================ */}
      <Modal
        visible={showReminderModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowReminderModal(false)}
      >
        <View style={styles.reminderOverlay}>
          <View style={styles.reminderContent}>
            <View style={styles.reminderHeader}>
              <MaterialIcons
                name="notifications-active"
                size={32}
                color="#FF9800"
              />
              <Text style={styles.reminderTitle}>Напоминание практики</Text>
            </View>
            <Text style={styles.reminderDesc}>
              Чтобы установить напоминание о ежедневной практике, перейдите в
              раздел «Настройки» приложения и включите push-уведомления.
              {'\n\n'}Рекомендуемое время для практики:{'\n'}🌅 Утро (7:00–9:00)
              — для энергичного начала дня{'\n'}🌙 Вечер (20:00–22:00) — для
              расслабления перед сном{'\n\n'}Регулярная практика значительно
              повышает эффективность техник!
            </Text>
            <TouchableOpacity
              style={styles.reminderCloseBtn}
              onPress={() => setShowReminderModal(false)}
            >
              <Text style={styles.reminderCloseText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ===========================================================================
// Styles — merged from both exercise files
// ===========================================================================
const styles = StyleSheet.create({
  /* ---- layout ---- */
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  /* ---- header ---- */
  header: { padding: 20, alignItems: 'center' },
  headerInner: { alignItems: 'center' },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },

  /* ---- body ---- */
  body: { flex: 1 },

  /* ---- stats ---- */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: 'bold', color: '#FF9800' },
  statLbl: { fontSize: 14, color: '#666', marginTop: 4 },

  /* ---- reminder ---- */
  reminderBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  reminderGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  reminderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  /* ---- search ---- */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 2 },

  /* ---- tabs ---- */
  tabsScroll: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabsRow: { flexDirection: 'row', gap: 8 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    gap: 6,
  },
  tabBtnActive: { backgroundColor: '#2E7D4A' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#2E7D4A' },
  tabTextActive: { color: 'white' },

  /* ---- chips ---- */
  chipsWrap: { marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedChip: { borderColor: 'rgba(255,255,255,0.3)' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  selectedChipText: { color: 'white' },

  /* ---- content ---- */
  contentPad: { padding: 16, paddingBottom: 40 },
  techniquesList: { gap: 12 },

  /* ---- enhanced technique card ---- */
  enhancedCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedCardContent: { padding: 16 },
  enhancedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  enhancedCardName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  enhancedCardDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  enhancedCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#666', fontWeight: '500' },

  /* ---- micro badges ---- */
  flashBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  flashText: { color: '#FF6B6B', fontSize: 12, fontWeight: 'bold' },
  situationText: { fontSize: 13, color: '#555', marginBottom: 10, lineHeight: 18 },
  situationLabel: { fontWeight: 'bold', color: '#FF9800' },

  /* ---- empty state ---- */
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { fontSize: 18, color: '#666', marginTop: 16, fontWeight: '600' },
  emptyStateSubtext: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },

  /* ================================================================
     GUIDED EXERCISE MODAL
     ================================================================ */
  guidedWrap: { flex: 1, backgroundColor: '#F8F9FA' },
  guidedBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  guidedCloseBtn: { alignSelf: 'flex-end', padding: 4 },
  guidedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D4A',
    textAlign: 'center',
    marginBottom: 14,
  },

  /* progress bar */
  progressBarBg: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: { height: 6, backgroundColor: '#2E7D4A', borderRadius: 3 },
  stepCounter: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },

  /* countdown */
  countdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: 10,
  },
  countdownLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  countdownTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF9800',
    fontVariant: ['tabular-nums'],
  },
  countdownToggle: {
    padding: 8,
    backgroundColor: 'rgba(255,152,0,0.1)',
    borderRadius: 20,
  },

  /* big timer micro */
  bigTimerWrap: { alignItems: 'center', marginBottom: 16 },
  bigTimerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#2E7D4A',
    fontVariant: ['tabular-nums'],
  },
  bigTimerLabel: { fontSize: 14, color: '#888', marginTop: 2 },

  /* step card */
  stepCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  stepInstruction: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 14,
  },

  /* tips & warnings */
  tipsBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  tipsTitle: { fontSize: 14, fontWeight: 'bold', color: '#2E7D4A', marginBottom: 4 },
  tipItem: { fontSize: 13, color: '#555', lineHeight: 18 },
  warningsBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  warningsTitle: { fontSize: 14, fontWeight: 'bold', color: '#F57C00', marginBottom: 4 },
  warningItem: { fontSize: 13, color: '#555', lineHeight: 18 },

  /* dots */
  dotsWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D0D0D0' },
  dotActive: { backgroundColor: '#2E7D4A', width: 20 },
  dotCompleted: { backgroundColor: '#81C784' },

  /* nav buttons */
  guidedNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  navPrevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    gap: 6,
  },
  navPrevText: { fontSize: 14, fontWeight: '600', color: '#2E7D4A' },
  navNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D4A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 6,
  },
  navNextText: { fontSize: 14, fontWeight: '600', color: 'white' },
  navDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 6,
  },
  navDoneText: { fontSize: 14, fontWeight: '600', color: 'white' },

  /* ================================================================
     BREATHING ANIMATION
     ================================================================ */
  breathingContainer: { alignItems: 'center', marginVertical: 18 },
  breathingCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(46,125,74,0.25)',
    borderWidth: 3,
    borderColor: '#2E7D4A',
  },
  breathingText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D4A',
  },

  /* ================================================================
     COMPLETION SCREEN
     ================================================================ */
  completionWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  completionEmoji: { fontSize: 72, marginBottom: 16 },
  completionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },

  completionStats: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    gap: 20,
  },
  compStatItem: { flex: 1, alignItems: 'center', gap: 6 },
  compStatNum: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  compStatLabel: { fontSize: 13, color: '#666', textAlign: 'center' },

  /* mood */
  moodPrompt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  moodRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  moodBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    minWidth: 85,
  },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: { fontSize: 13, fontWeight: '600', color: '#333' },

  /* save */
  saveJournalBtn: {
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
  saveJournalGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  saveJournalText: { color: 'white', fontSize: 17, fontWeight: 'bold' },

  /* finish */
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D4A',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    gap: 8,
  },
  finishBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  /* ================================================================
     REMINDER MODAL
     ================================================================ */
  reminderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  reminderContent: {
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
  reminderHeader: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  reminderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  reminderDesc: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  reminderCloseBtn: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reminderCloseText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
