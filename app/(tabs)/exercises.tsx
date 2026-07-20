import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Platform, Modal, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat,
  withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  advancedNLPTechniques, mindfulnessExercises,
  NLPTechnique, MindfulnessExercise,
} from '../../services/enhancedNLPService';
import {
  modernTherapeuticTechniques, microTechniques,
  TherapeuticTechnique, MicroTechnique,
} from '../../services/therapeuticTechniques';

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
// BreathingCircle – animated with reanimated
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
// Conversion helpers
// ---------------------------------------------------------------------------
const buildGuidedSteps = {
  nlp: (t: NLPTechnique): GuidedStep[] =>
    t.steps.map((s) => ({
      title: s.title,
      instruction: s.instruction,
      durationSeconds: (s.duration ?? 1) * 60,
      stepType: s.type,
      tips: s.tips,
      warnings: s.warnings,
    })),
  therapy: (t: TherapeuticTechnique): GuidedStep[] =>
    t.steps.map((s) => ({
      title: s.title,
      instruction: s.instruction,
      durationSeconds: (s.duration ?? 1) * 60,
      stepType: s.type,
      tips: s.tips,
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
// Main component
// ---------------------------------------------------------------------------
export default function ExercisesPage() {
  const insets = useSafeAreaInsets();

  // -- category & search
  const [activeCategory, setActiveCategory] = useState<string>('nlp');
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
  }, [timerSeconds, timerRunning, guidedVisible, showCompletion, guidedSteps.length]);

  // -- helpers
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
    setGuidedVisible(true);
  };

  const closeGuided = () => {
    setTimerRunning(false);
    setGuidedVisible(false);
    setShowCompletion(false);
    setSelectedMood(null);
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

  // -- category metadata
  const categoryIcons: Record<string, string> = {
    nlp: 'psychology',
    therapy: 'healing',
    mindfulness: 'spa',
    micro: 'flash-on',
  };

  const categoryNames: Record<string, string> = {
    nlp: 'НЛП техники',
    therapy: 'Терапия',
    mindfulness: 'Осознанность',
    micro: 'Экспресс',
  };

  const difficultyColors: Record<string, string> = {
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#F44336',
    expert: '#9C27B0',
  };

  const difficultyNames: Record<string, string> = {
    beginner: 'Новичок',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
    expert: 'Эксперт',
  };

  const nlpCategoryColors: Record<string, string> = {
    anchoring: '#2196F3',
    reframing: '#4CAF50',
    timeline: '#9C27B0',
    submodalities: '#FF9800',
    swish: '#F44336',
    phobia: '#795548',
    belief_change: '#607D8B',
    parts_integration: '#00BCD4',
    meta_program: '#E91E63',
    perceptual_positions: '#FF9800',
  };

  const nlpCategoryNames: Record<string, string> = {
    anchoring: 'Якорение',
    reframing: 'Рефрейминг',
    timeline: 'Временная линия',
    submodalities: 'Субмодальности',
    swish: 'Свиш-паттерн',
    phobia: 'Работа с фобиями',
    belief_change: 'Изменение убеждений',
    parts_integration: 'Интеграция частей',
    meta_program: 'Мета-программы',
    perceptual_positions: 'Позиции восприятия',
  };

  // -- filtering
  const q = searchQuery.toLowerCase();

  const filteredNLP = advancedNLPTechniques.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      nlpCategoryNames[t.category]?.toLowerCase().includes(q),
  );

  const filteredTherapy = modernTherapeuticTechniques.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.approach.toLowerCase().includes(q),
  );

  const filteredMindfulness = mindfulnessExercises.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.instructions.some((i) => i.toLowerCase().includes(q)),
  );

  const filteredMicro = microTechniques.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.situation.toLowerCase().includes(q),
  );

  // ======================================================================
  // Render helpers
  // ======================================================================
  const renderNLPTechniques = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Продвинутые НЛП техники</Text>
      <Text style={styles.sectionDescription}>
        Нейролингвистическое программирование для изменения поведенческих
        паттернов
      </Text>

      {filteredNLP.map((technique) => (
        <View key={technique.id} style={styles.techniqueCard}>
          <View style={styles.techniqueHeader}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: nlpCategoryColors[technique.category] },
              ]}
            >
              <Text style={styles.categoryBadgeText}>
                {nlpCategoryNames[technique.category]}
              </Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: difficultyColors[technique.difficulty] },
              ]}
            >
              <Text style={styles.difficultyText}>
                {difficultyNames[technique.difficulty]}
              </Text>
            </View>
          </View>

          <Text style={styles.techniqueTitle}>{technique.name}</Text>
          <Text style={styles.techniqueDescription}>
            {technique.description}
          </Text>

          <View style={styles.techniqueMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.metaText}>{technique.duration} мин</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="format-list-numbered" size={16} color="#666" />
              <Text style={styles.metaText}>{technique.steps.length} шагов</Text>
            </View>
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Преимущества:</Text>
            <View style={styles.benefitsList}>
              {technique.benefits.slice(0, 3).map((benefit, idx) => (
                <Text key={idx} style={styles.benefitItem}>
                  • {benefit}
                </Text>
              ))}
            </View>
          </View>

          {technique.contraindications && (
            <View style={styles.warningBox}>
              <MaterialIcons name="warning" size={16} color="#FF9800" />
              <Text style={styles.warningText}>
                Противопоказания:{' '}
                {technique.contraindications.join(', ')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              openGuided(technique.name, buildGuidedSteps.nlp(technique))
            }
          >
            <MaterialIcons name="play-arrow" size={20} color="white" />
            <Text style={styles.startButtonText}>Начать технику</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderTherapyTechniques = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Современные терапевтические техники</Text>
      <Text style={styles.sectionDescription}>
        CBT, DBT, ACT, EMDR, IFS, соматические техники и другие подходы
      </Text>

      {filteredTherapy.map((technique) => (
        <View key={technique.id} style={styles.techniqueCard}>
          <View style={styles.techniqueHeader}>
            <View style={styles.approachBadge}>
              <Text style={styles.approachText}>{technique.approach}</Text>
            </View>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: difficultyColors[technique.difficulty] },
              ]}
            >
              <Text style={styles.difficultyText}>
                {difficultyNames[technique.difficulty]}
              </Text>
            </View>
          </View>

          <Text style={styles.techniqueTitle}>{technique.name}</Text>
          <Text style={styles.techniqueDescription}>
            {technique.description}
          </Text>

          <View style={styles.techniqueMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.metaText}>{technique.duration} мин</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="format-list-numbered" size={16} color="#666" />
              <Text style={styles.metaText}>{technique.steps.length} шагов</Text>
            </View>
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Преимущества:</Text>
            <View style={styles.benefitsList}>
              {technique.benefits.slice(0, 3).map((benefit, idx) => (
                <Text key={idx} style={styles.benefitItem}>
                  • {benefit}
                </Text>
              ))}
            </View>
          </View>

          {technique.contraindications && (
            <View style={styles.warningBox}>
              <MaterialIcons name="warning" size={16} color="#FF9800" />
              <Text style={styles.warningText}>
                Противопоказания:{' '}
                {technique.contraindications.join(', ')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#6A1B9A' }]}
            onPress={() =>
              openGuided(technique.name, buildGuidedSteps.therapy(technique))
            }
          >
            <MaterialIcons name="healing" size={20} color="white" />
            <Text style={styles.startButtonText}>Начать терапию</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderMindfulnessTechniques = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Техники осознанности</Text>
      <Text style={styles.sectionDescription}>
        Упражнения для развития внимательности и присутствия в моменте
      </Text>

      {filteredMindfulness.map((exercise) => (
        <View key={exercise.id} style={styles.techniqueCard}>
          <Text style={styles.techniqueTitle}>{exercise.name}</Text>

          <View style={styles.techniqueMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.metaText}>{exercise.duration} мин</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="format-list-numbered" size={16} color="#666" />
              <Text style={styles.metaText}>
                {exercise.instructions.length} шагов
              </Text>
            </View>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Инструкции:</Text>
            {exercise.instructions.slice(0, 3).map((inst, idx) => (
              <Text key={idx} style={styles.instructionItem}>
                {idx + 1}. {inst}
              </Text>
            ))}
            {exercise.instructions.length > 3 && (
              <Text style={styles.moreInstructions}>
                и ещё {exercise.instructions.length - 3} шагов…
              </Text>
            )}
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Преимущества:</Text>
            <View style={styles.benefitsList}>
              {exercise.benefits.map((benefit, idx) => (
                <Text key={idx} style={styles.benefitItem}>
                  • {benefit}
                </Text>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#00BCD4' }]}
            onPress={() =>
              openGuided(
                exercise.name,
                buildGuidedSteps.mindfulness(exercise),
              )
            }
          >
            <MaterialIcons name="spa" size={20} color="white" />
            <Text style={styles.startButtonText}>Начать практику</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderMicroTechniques = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Экспресс-техники</Text>
      <Text style={styles.sectionDescription}>
        Быстрые техники для экстренных ситуаций (30 сек – 2 мин)
      </Text>

      {filteredMicro.map((technique) => (
        <View
          key={technique.id}
          style={[styles.techniqueCard, styles.microTechniqueCard]}
        >
          <View style={styles.microHeader}>
            <Text style={styles.techniqueTitle}>{technique.name}</Text>
            <View style={styles.durationBadge}>
              <MaterialIcons name="flash-on" size={16} color="#FF6B6B" />
              <Text style={styles.durationText}>{technique.duration}с</Text>
            </View>
          </View>

          <Text style={styles.techniqueDescription}>
            {technique.description}
          </Text>

          <Text style={styles.situationText}>
            <Text style={styles.situationLabel}>Когда использовать: </Text>
            {technique.situation}
          </Text>

          <View style={styles.quickStepsContainer}>
            <Text style={styles.quickStepsTitle}>Быстрые шаги:</Text>
            {technique.steps.slice(0, 2).map((step, idx) => (
              <Text key={idx} style={styles.quickStepItem}>
                {idx + 1}. {step}
              </Text>
            ))}
            {technique.steps.length > 2 && (
              <Text style={styles.moreSteps}>
                +{technique.steps.length - 2} шагов
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.startButton, styles.microStartButton]}
            onPress={() =>
              openGuided(
                technique.name,
                buildGuidedSteps.micro(technique),
                true,
              )
            }
          >
            <MaterialIcons name="flash-on" size={20} color="white" />
            <Text style={styles.startButtonText}>Быстрый старт</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'nlp':
        return renderNLPTechniques();
      case 'therapy':
        return renderTherapyTechniques();
      case 'mindfulness':
        return renderMindfulnessTechniques();
      case 'micro':
        return renderMicroTechniques();
      default:
        return renderNLPTechniques();
    }
  };

  // ======================================================================
  // Guided modal content
  // ======================================================================
  const progress =
    guidedSteps.length > 0
      ? ((currentStepIdx + 1) / guidedSteps.length) * 100
      : 0;

  const currentStepData = guidedSteps[currentStepIdx] ?? null;

  const renderGuidedContent = () => (
    <View style={styles.guidedBody}>
      {/* Close */}
      <TouchableOpacity style={styles.guidedCloseBtn} onPress={closeGuided}>
        <MaterialIcons name="close" size={24} color="#666" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.guidedTitle}>{guidedTitle}</Text>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Step counter */}
      <Text style={styles.stepCounter}>
        Шаг {currentStepIdx + 1} из {guidedSteps.length}
      </Text>

      {/* Micro mode big timer */}
      {isMicroMode && (
        <View style={styles.bigTimerContainer}>
          <Text style={styles.bigTimerText}>{formatTime(timerSeconds)}</Text>
          <Text style={styles.bigTimerLabel}>осталось</Text>
        </View>
      )}

      {/* Step title & instruction */}
      {currentStepData && (
        <View style={styles.stepCard}>
          <Text style={styles.currentStepTitle}>
            {currentStepData.title}
          </Text>
          <Text style={styles.currentStepInstruction}>
            {currentStepData.instruction}
          </Text>

          {/* Timer (non-micro) */}
          {!isMicroMode && (
            <View style={styles.timerRow}>
              <MaterialIcons name="timer" size={20} color="#2E7D4A" />
              <Text style={styles.timerText}>
                {formatTime(timerSeconds)}
              </Text>
            </View>
          )}

          {/* Breathing circle */}
          {currentStepData.stepType === 'breathing' && (
            <BreathingCircle key={`breath-${currentStepIdx}`} />
          )}

          {/* Tips */}
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

          {/* Warnings */}
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
      <View style={styles.dotsContainer}>
        {guidedSteps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentStepIdx && styles.activeDot,
              i < currentStepIdx && styles.completedDot,
            ]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.guidedNav}>
        {currentStepIdx > 0 && (
          <TouchableOpacity
            style={styles.prevBtn}
            onPress={() => goToStep(currentStepIdx - 1)}
          >
            <MaterialIcons name="arrow-back" size={18} color="#2E7D4A" />
            <Text style={styles.prevBtnText}>Назад</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />

        {currentStepIdx < guidedSteps.length - 1 ? (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => goToStep(currentStepIdx + 1)}
          >
            <Text style={styles.nextBtnText}>Далее</Text>
            <MaterialIcons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={completeExercise}
          >
            <MaterialIcons name="check" size={18} color="white" />
            <Text style={styles.doneBtnText}>Завершить</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // -- completion screen
  const renderCompletion = () => (
    <View style={styles.completionContainer}>
      <Text style={styles.completionEmoji}>🎉</Text>
      <Text style={styles.completionTitle}>Упражнение завершено!</Text>
      <Text style={styles.completionSubtitle}>
        Вы сделали ещё один шаг к выздоровлению
      </Text>

      <Text style={styles.moodPrompt}>Как вы себя чувствуете?</Text>
      <View style={styles.moodSelector}>
        {(
          [
            { key: 'good', emoji: '😊', label: 'Хорошо', color: '#4CAF50' },
            {
              key: 'normal',
              emoji: '😐',
              label: 'Нормально',
              color: '#FF9800',
            },
            { key: 'hard', emoji: '😔', label: 'Трудно', color: '#F44336' },
          ] as const
        ).map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.moodButton,
              { borderColor: m.color },
              selectedMood === m.key && {
                backgroundColor: m.color,
              },
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

      <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
        <MaterialIcons name="check-circle" size={20} color="white" />
        <Text style={styles.finishBtnText}>Завершить</Text>
      </TouchableOpacity>
    </View>
  );

  // ======================================================================
  // Main render
  // ======================================================================
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Психотехники и НЛП</Text>
        <Text style={styles.subtitle}>
          Современные техники для изменения поведения и мышления
        </Text>
        {completedCount > 0 && (
          <View style={styles.completedBadge}>
            <MaterialIcons name="check-circle" size={16} color="#2E7D4A" />
            <Text style={styles.completedText}>
              Выполнено: {completedCount}
            </Text>
          </View>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск техник…"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {(['nlp', 'therapy', 'mindfulness', 'micro'] as const).map(
          (cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                activeCategory === cat && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <MaterialIcons
                name={categoryIcons[cat] as any}
                size={20}
                color={activeCategory === cat ? 'white' : '#2E7D4A'}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  activeCategory === cat && styles.activeCategoryButtonText,
                ]}
              >
                {categoryNames[cat]}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </ScrollView>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {renderContent()}
      </ScrollView>

      {/* Guided Exercise Modal */}
      <Modal
        visible={guidedVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeGuided}
      >
        <View style={[styles.guidedContainer, { paddingTop: insets.top }]}>
          {showCompletion ? renderCompletion() : renderGuidedContent()}
        </View>
      </Modal>
    </View>
  );
}

// ===========================================================================
// Styles
// ===========================================================================
const styles = StyleSheet.create({
  /* ---- layout ---- */
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D4A', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', lineHeight: 22 },

  /* ---- completed badge ---- */
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  completedText: { fontSize: 13, fontWeight: '600', color: '#2E7D4A' },

  /* ---- search ---- */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 4 },

  /* ---- categories ---- */
  categoriesContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    gap: 6,
  },
  activeCategoryButton: { backgroundColor: '#2E7D4A' },
  categoryButtonText: { fontSize: 14, fontWeight: '500', color: '#2E7D4A' },
  activeCategoryButtonText: { color: 'white' },

  /* ---- content ---- */
  content: { padding: 20 },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },

  /* ---- technique card ---- */
  techniqueCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 20,
    marginBottom: 15,
  },
  microTechniqueCard: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: -10,
    marginVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderBottomWidth: 0,
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  microHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  approachBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approachText: { color: '#1976D2', fontSize: 12, fontWeight: 'bold' },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  durationText: { color: '#FF6B6B', fontSize: 12, fontWeight: 'bold' },
  techniqueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8,
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  techniqueMeta: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 14, color: '#666' },

  /* ---- benefits ---- */
  benefitsContainer: { marginBottom: 12 },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 6,
  },
  benefitsList: { gap: 2 },
  benefitItem: { fontSize: 13, color: '#555', lineHeight: 18 },

  /* ---- instructions ---- */
  instructionsContainer: { marginBottom: 12 },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 6,
  },
  instructionItem: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 2 },
  moreInstructions: { fontSize: 13, color: '#999', fontStyle: 'italic' },

  /* ---- situation ---- */
  situationText: { fontSize: 14, color: '#333', marginBottom: 10 },
  situationLabel: { fontWeight: 'bold', color: '#FF9800' },

  /* ---- quick steps ---- */
  quickStepsContainer: { marginBottom: 12 },
  quickStepsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 6,
  },
  quickStepItem: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 2 },
  moreSteps: { fontSize: 13, color: '#999', fontStyle: 'italic' },

  /* ---- warnings ---- */
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  warningText: { fontSize: 12, color: '#F57C00', flex: 1 },

  /* ---- start button ---- */
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    gap: 8,
  },
  microStartButton: { backgroundColor: '#FF6B6B' },
  startButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },

  /* ================================================================
     GUIDED EXERCISE MODAL
     ================================================================ */
  guidedContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  guidedBody: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  guidedCloseBtn: { alignSelf: 'flex-end', padding: 4 },
  guidedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D4A',
    textAlign: 'center',
    marginBottom: 14,
  },

  /* progress bar */
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2E7D4A',
    borderRadius: 3,
  },

  /* step counter */
  stepCounter: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },

  /* big timer (micro mode) */
  bigTimerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
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
  currentStepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  currentStepInstruction: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 14,
  },

  /* inline timer row */
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A',
    fontVariant: ['tabular-nums'],
  },

  /* tips box */
  tipsBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  tipsTitle: { fontSize: 14, fontWeight: 'bold', color: '#2E7D4A', marginBottom: 4 },
  tipItem: { fontSize: 13, color: '#555', lineHeight: 18 },

  /* warnings in modal */
  warningsBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 4,
  },
  warningItem: { fontSize: 13, color: '#555', lineHeight: 18 },

  /* dot indicators */
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  activeDot: { backgroundColor: '#2E7D4A', width: 20 },
  completedDot: { backgroundColor: '#81C784' },

  /* navigation buttons */
  guidedNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    gap: 6,
  },
  prevBtnText: { fontSize: 14, fontWeight: '600', color: '#2E7D4A' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D4A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 6,
  },
  nextBtnText: { fontSize: 14, fontWeight: '600', color: 'white' },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 6,
  },
  doneBtnText: { fontSize: 14, fontWeight: '600', color: 'white' },

  /* ================================================================
     BREATHING ANIMATION
     ================================================================ */
  breathingContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
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
  completionContainer: {
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
    marginBottom: 28,
    lineHeight: 22,
  },
  moodPrompt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 14,
  },
  moodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    minWidth: 85,
  },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
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
});
