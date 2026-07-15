
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated';

import { MicroCoursesService, MicroCourse, Lesson } from '../../services/microCoursesService';
import { allExpandedTechniques } from '../../services/expandedNLPTechniques';
import { modernTherapeuticTechniques, microTechniques } from '../../services/therapeuticTechniques';

const { width: screenWidth } = Dimensions.get('window');

const CourseCard = ({ course, onPress }: { course: MicroCourse, onPress: () => void }) => (
  <TouchableOpacity style={styles.courseCard} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.courseCardInner}>
      <View style={[styles.courseIconBadge, { backgroundColor: course.color + '20' }]}>
        <MaterialIcons name={course.icon as any} size={28} color={course.color} />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitleAlt}>{course.title}</Text>
        <View style={styles.courseMetaRow}>
          <MaterialIcons name="menu-book" size={14} color="#666" />
          <Text style={styles.courseMetaAlt}>{course.lessons.length} уроков</Text>
          <View style={styles.metaDot} />
          <MaterialIcons name="access-time" size={14} color="#666" />
          <Text style={styles.courseMetaAlt}>{course.lessons.reduce((s, l) => s + l.duration, 0)} мин</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { backgroundColor: course.color, width: '0%' }]} />
        </View>
      </View>
      <MaterialIcons name="arrow-forward-ios" size={16} color="#CCC" />
    </View>
  </TouchableOpacity>
);

const TechniqueItem = ({ technique, onPress }: { technique: any, onPress: () => void }) => (
  <TouchableOpacity style={styles.techniqueItem} onPress={onPress}>
    <View style={[styles.techIconContainer, { backgroundColor: '#E8F5E9' }]}>
      <MaterialIcons name="psychology" size={24} color="#2E7D4A" />
    </View>
    <View style={styles.techInfo}>
      <Text style={styles.techName}>{technique.name}</Text>
      <Text style={styles.techDesc} numberOfLines={1}>{technique.description}</Text>
    </View>
    <MaterialIcons name="play-circle-outline" size={24} color="#2E7D4A" />
  </TouchableOpacity>
);

export default function CoursesPage() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'courses' | 'techniques'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<MicroCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<any | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiOpacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
    transform: [{ scale: confettiScale.value }]
  }));

  const courses = useMemo(() => MicroCoursesService.getCourses(), []);
  const techniques = useMemo(() => [
    ...allExpandedTechniques.slice(0, 10),
    ...modernTherapeuticTechniques.slice(0, 5)
  ], []);

  const renderCourses = () => (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Обучающие программы</Text>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} onPress={() => setSelectedCourse(course)} />
      ))}

      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={20} color="#666" />
        <Text style={styles.infoBoxText}>Проходите курсы последовательно для лучшего результата.</Text>
      </View>
    </Animated.View>
  );

  const renderTechniques = () => (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Библиотека техник</Text>
      {techniques.map((tech, idx) => (
        <TechniqueItem key={tech.id || idx} technique={tech} onPress={() => setSelectedTechnique(tech)} />
      ))}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.header}>
        <Text style={styles.headerTitle}>Курсы и Техники</Text>
        <Text style={styles.headerSubtitle}>Ваш путь к самопознанию и свободе</Text>
      </LinearGradient>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'courses' && styles.activeTab]}
          onPress={() => setActiveTab('courses')}
        >
          <Text style={[styles.tabLabel, activeTab === 'courses' && styles.activeTabLabel]}>Курсы</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'techniques' && styles.activeTab]}
          onPress={() => setActiveTab('techniques')}
        >
          <Text style={[styles.tabLabel, activeTab === 'techniques' && styles.activeTabLabel]}>Техники</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'courses' ? renderCourses() : renderTechniques()}
      </ScrollView>

      {/* Course Details Modal */}
      <Modal visible={!!selectedCourse && !selectedLesson} animationType="slide">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedCourse(null)}>
              <MaterialIcons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Содержание курса</Text>
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
          </ScrollView>
        </View>
      </Modal>

      {/* Lesson View Modal */}
      <Modal visible={!!selectedLesson} animationType="fade">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedLesson(null)}>
              <MaterialIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>{selectedLesson?.title}</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.lessonBody}>
              <Text style={styles.lessonText}>{selectedLesson?.content}</Text>

              {selectedLesson?.task && (
                <View style={styles.taskContainer}>
                  <View style={styles.taskHeader}>
                    <MaterialIcons name="assignment" size={20} color="#2E7D4A" />
                    <Text style={styles.taskTitle}>Практическое задание:</Text>
                  </View>
                  <Text style={styles.taskText}>{selectedLesson.task}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.lessonFooter}>
            <TouchableOpacity
              style={styles.completeLessonButton}
              onPress={() => {
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
                    setSelectedLesson(null);
                  }, 600);
                }, 2000);
              }}
            >
              <Text style={styles.completeLessonText}>Я выполнил задание</Text>
            </TouchableOpacity>
          </View>

          {showConfetti && (
            <Animated.View style={[styles.confettiContainer, confettiStyle]} pointerEvents="none">
              <View style={styles.celebrationCard}>
                <Text style={styles.celebrationEmoji}>🎉</Text>
                <Text style={styles.celebrationText}>Задание выполнено!</Text>
                <Text style={styles.celebrationSub}>Отличная работа!</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>

      {/* Technique Modal Placeholder */}
      <Modal visible={!!selectedTechnique} animationType="slide">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedTechnique(null)}>
              <MaterialIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Техника</Text>
            <View style={{ width: 28 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.courseDetailTitle}>{selectedTechnique?.name || selectedTechnique?.title}</Text>
            <Text style={styles.lessonText}>{selectedTechnique?.description}</Text>
            {selectedTechnique?.steps && (
               <View style={{ marginTop: 20 }}>
                  <Text style={styles.lessonsTitle}>Шаги выполнения:</Text>
                  {Array.isArray(selectedTechnique.steps) && selectedTechnique.steps.map((step: any, i: number) => (
                    <View key={i} style={styles.stepItem}>
                        <Text style={styles.stepText}>{i+1}. {typeof step === 'string' ? step : step.title}</Text>
                    </View>
                  ))}
               </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 25, paddingBottom: 35, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: '500' },
  tabBar: { flexDirection: 'row', backgroundColor: '#EEE', marginHorizontal: 20, marginTop: -20, borderRadius: 16, padding: 4, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14 },
  activeTab: { backgroundColor: 'white', elevation: 2 },
  tabLabel: { fontSize: 15, fontWeight: '700', color: '#666' },
  activeTabLabel: { color: '#2E7D4A' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 15 },
  tabContent: { gap: 18 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1A1C1E', marginBottom: 5, letterSpacing: -0.5 },
  courseCard: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  courseCardInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  courseIconBadge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  courseInfo: { flex: 1 },
  courseTitleAlt: { fontSize: 17, fontWeight: '700', color: '#1A1C1E', marginBottom: 4 },
  courseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  courseMetaAlt: { fontSize: 13, color: '#666', fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CCC', marginHorizontal: 4 },
  progressBarBg: { height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  courseTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  courseMeta: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  techniqueItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 16, gap: 12, elevation: 1 },
  techIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  techInfo: { flex: 1 },
  techName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  techDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0E0E0', padding: 12, borderRadius: 12, gap: 10, marginTop: 10 },
  infoBoxText: { flex: 1, fontSize: 12, color: '#666' },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  modalContent: { flex: 1, padding: 20 },
  courseDetailHeader: { alignItems: 'center', marginBottom: 30 },
  courseIconLarge: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  courseDetailTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  courseDetailDesc: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  lessonsTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  lessonItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, gap: 12, marginBottom: 10 },
  lessonNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F5E8', alignItems: 'center', justifyContent: 'center' },
  lessonNumberText: { fontSize: 14, fontWeight: 'bold', color: '#2E7D4A' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  lessonDuration: { fontSize: 12, color: '#999', marginTop: 2 },
  lessonBody: { gap: 20 },
  lessonText: { fontSize: 17, lineHeight: 26, color: '#444' },
  taskContainer: { backgroundColor: '#E8F5E8', padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#2E7D4A' },
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D4A' },
  taskText: { fontSize: 15, color: '#333', lineHeight: 22 },
  lessonFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  completeLessonButton: { backgroundColor: '#2E7D4A', padding: 18, borderRadius: 15, alignItems: 'center' },
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
  }
});
