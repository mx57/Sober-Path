import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import databases and services
import { MicroCoursesService, MicroCourse, Lesson } from '../../services/microCoursesService';
import { PsychologyService, AdvancedTherapy, TherapeuticSound, ModernTechnique } from '../../services/PsychologyService';
import { allExpandedTechniques } from '../../services/expandedNLPTechniques';
import { modernTherapeuticTechniques } from '../../services/therapeuticTechniques';

const { width: screenWidth } = Dimensions.get('window');

export default function CoursesPage() {
  const insets = useSafeAreaInsets();

  // Tabs: 'courses' | 'cbt' | 'deep' | 'sounds'
  const [activeTab, setActiveTab] = useState<'courses' | 'cbt' | 'deep' | 'sounds'>('courses');

  // Selection States
  const [selectedCourse, setSelectedCourse] = useState<MicroCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<any | null>(null);
  const [selectedTherapy, setSelectedTherapy] = useState<AdvancedTherapy | null>(null);
  const [selectedSound, setSelectedSound] = useState<TherapeuticSound | null>(null);

  // User input answers/reflections
  const [lessonReflection, setLessonReflection] = useState('');
  const [savedReflections, setSavedReflections] = useState<{ [key: string]: string }>({});

  // Interactive Playback State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [preIntensity, setPreIntensity] = useState<number | null>(null);
  const [postIntensity, setPostIntensity] = useState<number | null>(null);
  const [techniqueNotes, setTechniqueNotes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Sound Playback simulation
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.7);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimeLeft, setSleepTimeLeft] = useState(0);

  // Confetti / Celebration animation
  const [showConfetti, setShowConfetti] = useState(false);

  // Quiz States
  const [activeQuizCourse, setActiveQuizCourse] = useState<MicroCourse | null>(null);
  const [currentQuizQuestionIdx, setCurrentQuizQuestionIdx] = useState(0);
  const [selectedQuizOptionIdx, setSelectedQuizOptionIdx] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const confettiOpacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
    transform: [{ scale: confettiScale.value }]
  }));

  // Fetch saved reflections
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('sober_path_course_reflections');
        if (stored) {
          setSavedReflections(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading course reflections:', e);
      }
    };
    loadData();
  }, []);

  // Timer effect for interactive exercises
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            triggerHaptic(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  // Timer effect for sleep timer (sounds)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlayingSound && sleepTimer && sleepTimeLeft > 0) {
      interval = setInterval(() => {
        setSleepTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlayingSound(false);
            setSleepTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingSound, sleepTimer, sleepTimeLeft]);

  const triggerHaptic = (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(type);
    }
  };

  const triggerLightHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const saveReflection = async (key: string, value: string) => {
    try {
      const updated = { ...savedReflections, [key]: value };
      setSavedReflections(updated);
      await AsyncStorage.setItem('sober_path_course_reflections', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving reflection:', e);
    }
  };

  const showCelebration = () => {
    setShowConfetti(true);
    triggerHaptic();
    confettiOpacity.value = withTiming(1, { duration: 200 });
    confettiScale.value = withSequence(
      withSpring(1.2),
      withTiming(1, { duration: 300 })
    );
    setTimeout(() => {
      confettiOpacity.value = withTiming(0, { duration: 500 });
      confettiScale.value = withTiming(0, { duration: 500 });
      setTimeout(() => {
        setShowConfetti(false);
      }, 600);
    }, 2500);
  };

  const courses = useMemo(() => MicroCoursesService.getCourses(), []);
  const cbtTechniques = useMemo(() => [
    ...modernTherapeuticTechniques,
    ...allExpandedTechniques.filter(t => t.difficulty === 'beginner' || t.difficulty === 'intermediate').slice(0, 5)
  ], []);

  const handleStartQuiz = (course: MicroCourse) => {
    setActiveQuizCourse(course);
    setCurrentQuizQuestionIdx(0);
    setSelectedQuizOptionIdx(null);
    setQuizScore(0);
    setShowQuizResult(false);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  };

  const handleQuizOptionPress = (optionIdx: number) => {
    if (selectedQuizOptionIdx !== null || !activeQuizCourse?.quiz) return;
    setSelectedQuizOptionIdx(optionIdx);

    const question = activeQuizCourse.quiz[currentQuizQuestionIdx];
    const isCorrect = optionIdx === question.correctAnswerIndex;

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    } else {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    }

    setTimeout(() => {
      if (currentQuizQuestionIdx < activeQuizCourse.quiz!.length - 1) {
        setCurrentQuizQuestionIdx(prev => prev + 1);
        setSelectedQuizOptionIdx(null);
      } else {
        setShowQuizResult(true);
      }
    }, 2000);
  };

  const handleFinishQuiz = async () => {
    if (activeQuizCourse) {
      try {
        const { CommunityService } = require('../../services/communityService');
        await CommunityService.addKarmaPoints(50);
      } catch (err) {
        console.warn('Failed to award karma', err);
      }

      setShowConfetti(true);
      confettiOpacity.value = withTiming(1, { duration: 200 });
      confettiScale.value = withSequence(
        withSpring(1.2),
        withTiming(1, { duration: 300 })
      );

      setTimeout(() => {
        confettiOpacity.value = withTiming(0, { duration: 500 });
        confettiScale.value = withTiming(0, { duration: 500 });
        setTimeout(() => {
          setShowConfetti(false);
          setActiveQuizCourse(null);
          setSelectedCourse(null);
        }, 600);
      }, 2500);
    }
  };

  const deepTherapies = useMemo(() => {
    const res = PsychologyService.getTherapies();
    return res.success ? res.data : [];
  }, []);

  const sounds = useMemo(() => {
    const res = PsychologyService.getSounds();
    return res.success ? res.data : [];
  }, []);

  const startLesson = (lesson: Lesson) => {
    triggerLightHaptic();
    setSelectedLesson(lesson);
    setLessonReflection(savedReflections[lesson.id] || '');
  };

  const completeLesson = async () => {
    if (selectedLesson) {
      await saveReflection(selectedLesson.id, lessonReflection);
      showCelebration();
      setSelectedLesson(null);
    }
  };

  const startTechnique = (tech: any) => {
    triggerLightHaptic();
    setSelectedTechnique(tech);
    setCurrentStepIndex(0);
    setPreIntensity(5);
    setPostIntensity(null);
    setTechniqueNotes('');
    setTimerSeconds(tech.steps?.[0]?.duration ? tech.steps[0].duration * 60 : 60);
    setIsTimerActive(false);
  };

  const handleNextStep = () => {
    triggerLightHaptic();
    if (selectedTechnique && currentStepIndex < selectedTechnique.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStepDuration = selectedTechnique.steps[nextIndex]?.duration;
      setTimerSeconds(nextStepDuration ? nextStepDuration * 60 : 60);
      setIsTimerActive(false);
    } else {
      setPostIntensity(5);
    }
  };

  const completeTechnique = async () => {
    if (selectedTechnique) {
      const logKey = `tech_log_${selectedTechnique.id}_${Date.now()}`;
      const logValue = JSON.stringify({
        pre: preIntensity,
        post: postIntensity,
        notes: techniqueNotes,
        date: new Date().toISOString()
      });
      await AsyncStorage.setItem(logKey, logValue);
      showCelebration();
      setSelectedTechnique(null);
    }
  };

  const startSound = (sound: TherapeuticSound) => {
    triggerLightHaptic();
    setSelectedSound(sound);
    setIsPlayingSound(true);
    setSleepTimer(null);
    setSleepTimeLeft(0);
  };

  const toggleSoundPlay = () => {
    triggerLightHaptic();
    setIsPlayingSound(!isPlayingSound);
  };

  const applySleepTimer = (minutes: number) => {
    triggerLightHaptic();
    setSleepTimer(minutes);
    setSleepTimeLeft(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.header}>
        <Text style={styles.headerTitle}>Академия Трезвости</Text>
        <Text style={styles.headerSubtitle}>Интерактивные курсы, КПТ-практики и глубокая терапия</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'courses' && styles.activeTab]}
            onPress={() => { triggerLightHaptic(); setActiveTab('courses'); }}
          >
            <MaterialIcons name="school" size={18} color={activeTab === 'courses' ? '#2E7D4A' : '#666'} />
            <Text style={[styles.tabLabel, activeTab === 'courses' && styles.activeTabLabel]}>Обучение</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'cbt' && styles.activeTab]}
            onPress={() => { triggerLightHaptic(); setActiveTab('cbt'); }}
          >
            <MaterialIcons name="psychology" size={18} color={activeTab === 'cbt' ? '#2E7D4A' : '#666'} />
            <Text style={[styles.tabLabel, activeTab === 'cbt' && styles.activeTabLabel]}>КПТ и ДПТ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'deep' && styles.activeTab]}
            onPress={() => { triggerLightHaptic(); setActiveTab('deep'); }}
          >
            <MaterialIcons name="spa" size={18} color={activeTab === 'deep' ? '#2E7D4A' : '#666'} />
            <Text style={[styles.tabLabel, activeTab === 'deep' && styles.activeTabLabel]}>Глубокая терапия</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'sounds' && styles.activeTab]}
            onPress={() => { triggerLightHaptic(); setActiveTab('sounds'); }}
          >
            <MaterialIcons name="volume-up" size={18} color={activeTab === 'sounds' ? '#2E7D4A' : '#666'} />
            <Text style={[styles.tabLabel, activeTab === 'sounds' && styles.activeTabLabel]}>Звуковая терапия</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content Section */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'courses' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Мини-курсы по восстановлению</Text>
            {courses.map(course => (
              <TouchableOpacity key={course.id} style={styles.courseCard} onPress={() => setSelectedCourse(course)}>
                <View style={styles.courseCardInner}>
                  <View style={[styles.courseIconBadge, { backgroundColor: course.color + '20' }]}>
                    <MaterialIcons name={course.icon as any} size={28} color={course.color} />
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitleAlt}>{course.title}</Text>
                    <Text style={styles.courseDescText} numberOfLines={2}>{course.description}</Text>
                    <View style={styles.courseMetaRow}>
                      <MaterialIcons name="menu-book" size={14} color="#666" />
                      <Text style={styles.courseMetaAlt}>{course.lessons.length} уроков</Text>
                      <View style={styles.metaDot} />
                      <MaterialIcons name="access-time" size={14} color="#666" />
                      <Text style={styles.courseMetaAlt}>~{course.lessons.reduce((s, l) => s + l.duration, 0)} мин</Text>
                    </View>
                  </View>
                  <MaterialIcons name="arrow-forward-ios" size={16} color="#CCC" />
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {activeTab === 'cbt' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Техники КПТ / ДБТ и НЛП</Text>
            <Text style={styles.sectionSubtitleText}>Снижайте уровень дискомфорта и убирайте навязчивые мысли о алкоголе</Text>
            {cbtTechniques.map((tech, idx) => (
              <TouchableOpacity key={tech.id || idx} style={styles.techniqueCard} onPress={() => startTechnique(tech)}>
                <View style={styles.techCardHeader}>
                  <View style={styles.techIconContainer}>
                    <MaterialIcons name="psychology" size={24} color="#2E7D4A" />
                  </View>
                  <View style={styles.techInfo}>
                    <Text style={styles.techName}>{tech.name}</Text>
                    <Text style={styles.techDesc} numberOfLines={2}>{tech.description}</Text>
                  </View>
                </View>
                <View style={styles.techFooter}>
                  <View style={styles.techBadge}>
                    <Text style={styles.techBadgeText}>
                      {tech.difficulty === 'beginner' ? 'Новичок' : tech.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                    </Text>
                  </View>
                  <View style={styles.techDurationRow}>
                    <MaterialIcons name="timer" size={14} color="#666" />
                    <Text style={styles.techDurationText}>{tech.duration} мин</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {activeTab === 'deep' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Глубокая терапия (IFS, EMDR, EFT)</Text>
            <Text style={styles.sectionSubtitleText}>Профессиональные психотерапевтические методы для проработки первопричин зависимостей</Text>
            {deepTherapies.map((therapy: any) => (
              <TouchableOpacity key={therapy.id} style={styles.therapyCard} onPress={() => startTechnique(therapy)}>
                <View style={styles.therapyHeader}>
                  <MaterialIcons name="spa" size={30} color="#9C27B0" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.therapyTitle}>{therapy.name}</Text>
                    <Text style={styles.therapyMethod}>{therapy.method.toUpperCase()} метод</Text>
                  </View>
                </View>
                <Text style={styles.therapyDesc}>{therapy.description}</Text>
                <View style={styles.therapyFooter}>
                  <Text style={styles.therapyDifficulty}>Сложность: Продвинутая</Text>
                  <View style={styles.startTherapyBtn}>
                    <Text style={styles.startTherapyBtnText}>Начать сессию</Text>
                    <MaterialIcons name="play-arrow" size={16} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {activeTab === 'sounds' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Звуковая терапия</Text>
            <Text style={styles.sectionSubtitleText}>Исцеляющие частоты Сольфеджио и альфа-волны для расслабления и сна</Text>
            {sounds.map((sound: any) => (
              <TouchableOpacity key={sound.id} style={styles.soundCard} onPress={() => startSound(sound)}>
                <LinearGradient colors={['#3F51B5', '#5C6BC0']} style={styles.soundGradient}>
                  <View style={styles.soundHeaderRow}>
                    <MaterialIcons name="music-note" size={28} color="white" />
                    <View style={styles.soundInfo}>
                      <Text style={styles.soundTitleText}>{sound.name}</Text>
                      <Text style={styles.soundPurpose}>{sound.purpose}</Text>
                    </View>
                    <View style={styles.soundPlayIcon}>
                      <MaterialIcons name="play-circle-fill" size={36} color="white" />
                    </View>
                  </View>
                  {sound.frequency && (
                    <View style={styles.frequencyTag}>
                      <Text style={styles.frequencyTagText}>{sound.frequency}</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* --- MODALS --- */}

      {/* Course lessons view */}
      <Modal visible={!!selectedCourse && !selectedLesson} animationType="slide" onRequestClose={() => setSelectedCourse(null)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedCourse(null)}>
              <MaterialIcons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>{selectedCourse?.title}</Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedCourse && (
              <View style={styles.courseDetailHeader}>
                <View style={[styles.courseIconLarge, { backgroundColor: selectedCourse.color }]}>
                  <MaterialIcons name={selectedCourse.icon as any} size={48} color="white" />
                </View>
                <Text style={styles.courseDetailTitle}>{selectedCourse.title}</Text>
                <Text style={styles.courseDetailDesc}>{selectedCourse.description}</Text>
              </View>
            )}

            {activeQuizCourse ? (
              <View style={styles.quizContainer}>
                {showQuizResult ? (
                  <View style={styles.quizResultBox}>
                    <MaterialIcons name="emoji-events" size={64} color="#2E7D4A" />
                    <Text style={styles.quizResultTitle}>Тест пройден!</Text>
                    <Text style={styles.quizResultScore}>
                      Ваш результат: {quizScore} из {activeQuizCourse.quiz?.length}
                    </Text>
                    <Text style={styles.quizResultBonus}>+50 очков Кармы начислено!</Text>
                    <TouchableOpacity style={styles.quizFinishButton} onPress={handleFinishQuiz}>
                      <Text style={styles.quizFinishButtonText}>Завершить и забрать награду</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <View style={styles.quizHeader}>
                      <Text style={styles.quizProgressText}>
                        Вопрос {currentQuizQuestionIdx + 1} из {activeQuizCourse.quiz?.length}
                      </Text>
                      <View style={styles.quizProgressBar}>
                        <View
                          style={[
                            styles.quizProgressFill,
                            { width: `${((currentQuizQuestionIdx + 1) / (activeQuizCourse.quiz?.length || 1)) * 100}%` }
                          ]}
                        />
                      </View>
                    </View>

                    {activeQuizCourse.quiz && (
                      <View>
                        <Text style={styles.quizQuestionText}>
                          {activeQuizCourse.quiz[currentQuizQuestionIdx].question}
                        </Text>
                        <View style={styles.quizOptionsList}>
                          {activeQuizCourse.quiz[currentQuizQuestionIdx].options.map((option, idx) => {
                            const isSelected = selectedQuizOptionIdx === idx;
                            const isCorrect = idx === activeQuizCourse.quiz![currentQuizQuestionIdx].correctAnswerIndex;
                            const showCorrect = selectedQuizOptionIdx !== null && isCorrect;
                            const showWrong = isSelected && !isCorrect;

                            return (
                              <TouchableOpacity
                                key={idx}
                                style={[
                                  styles.quizOptionButton,
                                  showCorrect && styles.quizCorrectOption,
                                  showWrong && styles.quizWrongOption
                                ]}
                                onPress={() => handleQuizOptionPress(idx)}
                                disabled={selectedQuizOptionIdx !== null}
                              >
                                <Text
                                  style={[
                                    styles.quizOptionText,
                                    (showCorrect || showWrong) && styles.selectedQuizOptionText
                                  ]}
                                >
                                  {option}
                                </Text>
                                {showCorrect && <MaterialIcons name="check" size={20} color="white" />}
                                {showWrong && <MaterialIcons name="close" size={20} color="white" />}
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {selectedQuizOptionIdx !== null && (
                          <View style={styles.quizExplanationBox}>
                            <Text style={styles.quizExplanationTitle}>Пояснение:</Text>
                            <Text style={styles.quizExplanationText}>
                              {activeQuizCourse.quiz[currentQuizQuestionIdx].explanation}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.lessonsTitle}>Уроки:</Text>
                {selectedCourse?.lessons.map((lesson, idx) => (
                  <TouchableOpacity key={lesson.id} style={styles.lessonItem} onPress={() => setSelectedLesson(lesson)}>
                    <View style={styles.lessonNumber}>
                      <Text style={styles.lessonNumberText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonDuration}>{lesson.duration} минут</Text>
                    </View>
                    <MaterialIcons name="play-circle-fill" size={32} color="#2E7D4A" />
                  </TouchableOpacity>
                ))}

                {selectedCourse?.quiz && selectedCourse.quiz.length > 0 && (
                  <TouchableOpacity
                    style={[styles.startQuizButton, { backgroundColor: selectedCourse.color }]}
                    onPress={() => handleStartQuiz(selectedCourse)}
                  >
                    <MaterialIcons name="assignment-turned-in" size={20} color="white" />
                    <Text style={styles.startQuizButtonText}>Пройти интерактивный тест</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Lesson detailed play & Task Reflection input */}
      <Modal visible={!!selectedLesson} animationType="fade" onRequestClose={() => setSelectedLesson(null)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedLesson(null)}>
              <MaterialIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>{selectedLesson?.title}</Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.lessonBodyText}>{selectedLesson?.content}</Text>
            {selectedLesson?.task && (
              <View style={styles.taskContainer}>
                <View style={styles.taskHeader}>
                  <MaterialIcons name="assignment" size={20} color="#2E7D4A" />
                  <Text style={styles.taskTitle}>Практическое задание:</Text>
                </View>
                <Text style={styles.taskText}>{selectedLesson.task}</Text>
                <TextInput
                  style={styles.reflectionInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Запишите свой ответ или наблюдения для закрепления материала..."
                  value={lessonReflection}
                  onChangeText={setLessonReflection}
                />
              </View>
            )}
          </ScrollView>
          <View style={styles.lessonFooter}>
            <TouchableOpacity style={styles.completeLessonButton} onPress={completeLesson}>
              <Text style={styles.completeLessonText}>Я выполнил задание и усвоил урок</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Technique Interactive Player (CBT, DBT, EMDR, IFS) */}
      <Modal visible={!!selectedTechnique} animationType="slide" onRequestClose={() => setSelectedTechnique(null)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedTechnique(null)}>
              <MaterialIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>{selectedTechnique?.name || selectedTechnique?.title}</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Step-by-step progress */}
            {selectedTechnique?.steps && selectedTechnique.steps.length > 0 ? (
              <View>
                <View style={styles.stepProgressBar}>
                  {selectedTechnique.steps.map((_: any, idx: number) => (
                    <View
                      key={idx}
                      style={[
                        styles.stepProgressDot,
                        idx <= currentStepIndex && { backgroundColor: '#2E7D4A' },
                        idx === currentStepIndex && { transform: [{ scale: 1.2 }] }
                      ]}
                    />
                  ))}
                </View>

                {/* Pre-intensity rating (shown only at the beginning) */}
                {currentStepIndex === 0 && preIntensity !== null && postIntensity === null && (
                  <View style={styles.intensitySection}>
                    <Text style={styles.intensityLabel}>Оцените текущую тягу / дискомфорт (1-10):</Text>
                    <View style={styles.intensityRow}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <TouchableOpacity
                          key={num}
                          style={[styles.intensityBtn, preIntensity === num && styles.intensityBtnActive]}
                          onPress={() => setPreIntensity(num)}
                        >
                          <Text style={[styles.intensityBtnText, preIntensity === num && { color: 'white' }]}>{num}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Main Instruction Card */}
                <View style={styles.stepCard}>
                  <Text style={styles.stepTitle}>Шаг {currentStepIndex + 1}: {selectedTechnique.steps[currentStepIndex].title}</Text>
                  <Text style={styles.stepInstructionText}>{selectedTechnique.steps[currentStepIndex].instruction}</Text>

                  {/* EMDR Visual bilateral simulation simulation if EMDR */}
                  {selectedTechnique.approach === 'EMDR' && selectedTechnique.steps[currentStepIndex].id === 'tapping' && (
                    <View style={styles.emdrBilateralAnimation}>
                      <Animated.View style={styles.emdrBall} />
                      <Text style={styles.emdrHelpText}>Поочередно похлопывайте руками по плечам в такт пульсации</Text>
                    </View>
                  )}
                </View>

                {/* Countdown Timer with start button */}
                <View style={styles.timerSection}>
                  <Text style={styles.timerTitleText}>Таймер шага:</Text>
                  <View style={styles.timerContainerRow}>
                    <Text style={styles.timerCountdown}>{formatTime(timerSeconds)}</Text>
                    <TouchableOpacity
                      style={[styles.timerToggleBtn, isTimerActive && { backgroundColor: '#FF8A80' }]}
                      onPress={() => setIsTimerActive(!isTimerActive)}
                    >
                      <MaterialIcons name={isTimerActive ? "pause" : "play-arrow"} size={20} color="white" />
                      <Text style={styles.timerToggleBtnText}>{isTimerActive ? "Пауза" : "Старт"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Post-intensity rating & reflections (shown at the end) */}
                {postIntensity !== null && (
                  <View style={styles.intensitySection}>
                    <Text style={styles.intensityLabel}>Сессия завершена! Оцените дискомфорт после практики (1-10):</Text>
                    <View style={styles.intensityRow}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <TouchableOpacity
                          key={num}
                          style={[styles.intensityBtn, postIntensity === num && styles.intensityBtnActive]}
                          onPress={() => setPostIntensity(num)}
                        >
                          <Text style={[styles.intensityBtnText, postIntensity === num && { color: 'white' }]}>{num}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.intensityLabel}>Запишите свои инсайты и чувства:</Text>
                    <TextInput
                      style={styles.reflectionInput}
                      multiline
                      numberOfLines={3}
                      placeholder="Напишите, что вы заметили или осознали во время этой практики..."
                      value={techniqueNotes}
                      onChangeText={setTechniqueNotes}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.stepCard}>
                <Text style={styles.stepInstructionText}>{selectedTechnique?.description}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer actions */}
          <View style={styles.lessonFooter}>
            {postIntensity === null ? (
              <TouchableOpacity style={styles.completeLessonButton} onPress={handleNextStep}>
                <Text style={styles.completeLessonText}>
                  {currentStepIndex === (selectedTechnique?.steps?.length - 1) ? 'Завершить практику' : 'Следующий шаг'}
                </Text>
                <MaterialIcons name="arrow-forward" size={18} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.completeLessonButton, { backgroundColor: '#9C27B0' }]} onPress={completeTechnique}>
                <Text style={styles.completeLessonText}>Сохранить результаты сессии</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Sound Therapy Detailed Player */}
      <Modal visible={!!selectedSound} animationType="slide" onRequestClose={() => setSelectedSound(null)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top, backgroundColor: '#1A1C1E' }]}>
          <View style={[styles.modalHeader, { backgroundColor: '#1A1C1E', borderBottomColor: '#333' }]}>
            <TouchableOpacity onPress={() => setSelectedSound(null)}>
              <MaterialIcons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: 'white' }]}>Звуковой плеер</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedSound && (
              <View style={styles.soundPlayerContent}>
                <View style={styles.soundDiscContainer}>
                  <MaterialIcons name="graphic-eq" size={100} color="#3F51B5" />
                </View>
                <Text style={styles.soundPlayerTitle}>{selectedSound.name}</Text>
                <Text style={styles.soundPlayerDesc}>{selectedSound.purpose}</Text>

                {/* Frequency Indicator */}
                {selectedSound.frequency && (
                  <View style={styles.soundPlayerFreqTag}>
                    <Text style={styles.soundPlayerFreqText}>{selectedSound.frequency}</Text>
                  </View>
                )}

                {/* Control Buttons */}
                <View style={styles.playerControlsRow}>
                  <TouchableOpacity style={styles.playerPlayBtn} onPress={toggleSoundPlay}>
                    <MaterialIcons name={isPlayingSound ? "pause-circle-filled" : "play-circle-fill"} size={72} color="#3F51B5" />
                  </TouchableOpacity>
                </View>

                {/* Sleep Timer Section */}
                <View style={styles.sleepTimerSection}>
                  <Text style={styles.sleepTimerTitle}>Таймер сна (минут):</Text>
                  <View style={styles.sleepTimerRow}>
                    {[5, 15, 30, 45, 60].map((mins) => (
                      <TouchableOpacity
                        key={mins}
                        style={[styles.sleepTimerBtn, sleepTimer === mins && styles.sleepTimerBtnActive]}
                        onPress={() => applySleepTimer(mins)}
                      >
                        <Text style={[styles.sleepTimerBtnText, sleepTimer === mins && { color: 'white' }]}>{mins}м</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {sleepTimer && sleepTimeLeft > 0 && (
                    <Text style={styles.sleepTimerCountdown}>До выключения осталось: {formatTime(sleepTimeLeft)}</Text>
                  )}
                </View>

                {/* Audio instructions */}
                <View style={styles.soundInstructionsCard}>
                  <Text style={styles.soundInstructionsTitle}>Инструкции для наилучшего эффекта:</Text>
                  <Text style={styles.soundInstructionsText}>{selectedSound.instructions}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Confetti Container */}
      {showConfetti && (
        <Animated.View style={[styles.confettiContainer, confettiStyle]} pointerEvents="none">
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationText}>Задание выполнено!</Text>
            <Text style={styles.celebrationSub}>Отличная работа на пути к свободе!</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 25, paddingBottom: 35, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: '500' },
  tabBar: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  tabsScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#F5F5F5', gap: 6 },
  activeTab: { backgroundColor: '#E8F5E9', borderColor: '#2E7D4A' },
  tabLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  activeTabLabel: { color: '#2E7D4A' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 15 },
  tabContent: { gap: 18 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1A1C1E', marginBottom: 2, letterSpacing: -0.5 },
  sectionSubtitleText: { fontSize: 14, color: '#666', marginBottom: 10 },
  courseCard: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  courseCardInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  courseIconBadge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  courseInfo: { flex: 1 },
  courseTitleAlt: { fontSize: 17, fontWeight: '700', color: '#1A1C1E', marginBottom: 4 },
  courseDescText: { fontSize: 13, color: '#666', marginBottom: 8 },
  courseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  courseMetaAlt: { fontSize: 13, color: '#666', fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CCC', marginHorizontal: 4 },
  techniqueCard: { backgroundColor: 'white', padding: 16, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  techCardHeader: { flexDirection: 'row', gap: 12 },
  techIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  techInfo: { flex: 1 },
  techName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  techDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  techFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  techBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  techBadgeText: { fontSize: 12, color: '#2E7D4A', fontWeight: '600' },
  techDurationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  techDurationText: { fontSize: 13, color: '#666' },
  therapyCard: { backgroundColor: 'white', padding: 18, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, borderWidth: 1, borderColor: '#F0F0F0' },
  therapyHeader: { flexDirection: 'row', alignItems: 'center' },
  therapyTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  therapyMethod: { fontSize: 12, color: '#9C27B0', fontWeight: '700', marginTop: 2 },
  therapyDesc: { fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 },
  therapyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  therapyDifficulty: { fontSize: 13, color: '#999' },
  startTherapyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#9C27B0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 4 },
  startTherapyBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },
  soundCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 12, elevation: 2 },
  soundGradient: { padding: 16 },
  soundHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  soundTitleText: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  soundPurpose: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2, flex: 1 },
  soundInfo: { flex: 1 },
  soundPlayIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  frequencyTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
  frequencyTagText: { fontSize: 12, color: 'white', fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  modalContent: { flex: 1, padding: 20 },
  courseDetailHeader: { alignItems: 'center', marginBottom: 30 },
  courseIconLarge: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  courseDetailTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  courseDetailDesc: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  lessonsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  lessonItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 16, gap: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0' },
  lessonNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F5E8', alignItems: 'center', justifyContent: 'center' },
  lessonNumberText: { fontSize: 14, fontWeight: 'bold', color: '#2E7D4A' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  lessonDuration: { fontSize: 12, color: '#999', marginTop: 2 },
  lessonBodyText: { fontSize: 16, lineHeight: 26, color: '#444', marginBottom: 20 },
  taskContainer: { backgroundColor: '#E8F5E8', padding: 18, borderRadius: 20, borderLeftWidth: 4, borderLeftColor: '#2E7D4A', marginTop: 10 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D4A' },
  taskText: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 12 },
  reflectionInput: { backgroundColor: 'white', borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, fontSize: 15, textAlignVertical: 'top', marginTop: 8 },
  lessonFooter: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  completeLessonButton: { backgroundColor: '#2E7D4A', padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  completeLessonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  stepItem: { marginBottom: 10 },
  stepText: { fontSize: 15, color: '#555', lineHeight: 20 },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  celebrationCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8,
  },
  celebrationSub: {
    fontSize: 16,
    color: '#666',
  },
  startQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  startQuizButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  quizContainer: {
    paddingVertical: 10,
  },
  quizResultBox: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#F9FBF9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  quizResultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginTop: 15,
    marginBottom: 6,
  },
  quizResultScore: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  quizResultBonus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 20,
  },
  quizFinishButton: {
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  quizFinishButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quizHeader: {
    marginBottom: 16,
  },
  quizProgressText: {
    fontSize: 13,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  quizProgressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: '#2E7D4A',
  },
  quizQuestionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  quizOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  quizOptionButton: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  quizOptionText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
    marginRight: 10,
  },
  quizCorrectOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  quizWrongOption: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  selectedQuizOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quizExplanationBox: {
    backgroundColor: '#FFFDE7',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  quizExplanationTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 4,
  },
  quizExplanationText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
  }
});
