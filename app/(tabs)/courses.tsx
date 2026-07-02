
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
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useAppTheme } from '../../contexts/ThemeContext';
import { MicroCoursesService, MicroCourse, Lesson } from '../../services/microCoursesService';
import { allExpandedTechniques } from '../../services/expandedNLPTechniques';
import { modernTherapeuticTechniques, microTechniques } from '../../services/therapeuticTechniques';

const { width: screenWidth } = Dimensions.get('window');

const CourseCard = ({ course, onPress }: { course: MicroCourse, onPress: () => void }) => (
  <TouchableOpacity style={styles.courseCard} onPress={onPress}>
    <LinearGradient colors={[course.color, course.color + 'CC']} style={styles.courseGradient}>
      <MaterialIcons name={course.icon as any} size={32} color="white" />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseMeta}>{course.lessons.length} уроков • {course.lessons.reduce((s, l) => s + l.duration, 0)} мин</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="white" />
    </LinearGradient>
  </TouchableOpacity>
);

const TechniqueItem = ({ technique, onPress, colors }: { technique: any, onPress: () => void, colors: any }) => (
  <TouchableOpacity style={styles.techniqueItem} onPress={onPress}>
    <View style={[styles.techIconContainer, { backgroundColor: colors.primary + '15' }]}>
      <MaterialIcons name="psychology" size={24} color={colors.primary} />
    </View>
    <View style={styles.techInfo}>
      <Text style={styles.techName}>{technique.name}</Text>
      <Text style={styles.techDesc} numberOfLines={1}>{technique.description}</Text>
    </View>
    <MaterialIcons name="play-circle-outline" size={24} color={colors.primary} />
  </TouchableOpacity>
);

export default function CoursesPage() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const dynamicStyles = useMemo(() => StyleSheet.create({
    activeTab: { backgroundColor: colors.primary },
    tabLabel: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
    lessonNumberText: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
    taskContainer: { backgroundColor: '#E8F5E8', padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: colors.primary },
    taskTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
    completeLessonButton: { backgroundColor: colors.primary, padding: 18, borderRadius: 15, alignItems: 'center' }
  }), [colors]);

  const [activeTab, setActiveTab] = useState<'courses' | 'techniques'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<MicroCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<any | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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
        <TechniqueItem key={tech.id || idx} technique={tech} onPress={() => setSelectedTechnique(tech)} colors={colors} />
      ))}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.headerGradient} style={styles.header}>
        <Text style={styles.headerTitle}>Курсы и Техники</Text>
        <Text style={styles.headerSubtitle}>Ваш путь к самопознанию и свободе</Text>
      </LinearGradient>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'courses' && dynamicStyles.activeTab]}
          onPress={() => setActiveTab('courses')}
        >
          <Text style={[styles.tabLabel, activeTab === 'courses' ? { color: 'white' } : { color: colors.primary }]}>Курсы</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'techniques' && dynamicStyles.activeTab]}
          onPress={() => setActiveTab('techniques')}
        >
          <Text style={[styles.tabLabel, activeTab === 'techniques' ? { color: 'white' } : { color: colors.primary }]}>Техники</Text>
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
                  <Text style={dynamicStyles.lessonNumberText}>{idx + 1}</Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDuration}>{lesson.duration} минут</Text>
                </View>
                <MaterialIcons name="play-circle-fill" size={32} color={colors.primary} />
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
                <View style={dynamicStyles.taskContainer}>
                  <View style={styles.taskHeader}>
                    <MaterialIcons name="assignment" size={20} color={colors.primary} />
                    <Text style={dynamicStyles.taskTitle}>Практическое задание:</Text>
                  </View>
                  <Text style={styles.taskText}>{selectedLesson.task}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.lessonFooter}>
            <TouchableOpacity
              style={dynamicStyles.completeLessonButton}
              onPress={() => {
                setShowConfetti(true);
                setTimeout(() => {
                  setShowConfetti(false);
                  setSelectedLesson(null);
                }, 2500);
              }}
            >
              <Text style={styles.completeLessonText}>Я выполнил задание</Text>
            </TouchableOpacity>
          </View>

          {showConfetti && (
            <View style={styles.confettiContainer} pointerEvents="none">
              <LottieView
                source={require('../../assets/lottie/celebration.json')}
                autoPlay
                loop={false}
                style={styles.confetti}
              />
            </View>
          )}
        </View>
      </Modal>

      {/* Technique Modal */}
      <Modal
        visible={!!selectedTechnique}
        animationType="slide"
        onRequestClose={() => setSelectedTechnique(null)}
      >
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
          <View style={styles.lessonFooter}>
            <TouchableOpacity
              style={dynamicStyles.completeLessonButton}
              onPress={() => {
                setShowConfetti(true);
                setTimeout(() => {
                  setShowConfetti(false);
                  setSelectedTechnique(null);
                }, 2500);
              }}
            >
              <Text style={styles.completeLessonText}>Завершить практику</Text>
            </TouchableOpacity>
          </View>
          {showConfetti && (
            <View style={styles.confettiContainer} pointerEvents="none">
              <LottieView
                source={require('../../assets/lottie/celebration.json')}
                autoPlay
                loop={false}
                style={styles.confetti}
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, paddingBottom: 25, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: 'white', margin: 15, borderRadius: 12, padding: 4, elevation: 2 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabLabel: { fontSize: 14, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 40 },
  tabContent: { gap: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  courseCard: { borderRadius: 16, overflow: 'hidden', elevation: 3 },
  courseGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
  courseInfo: { flex: 1 },
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
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  lessonDuration: { fontSize: 12, color: '#999', marginTop: 2 },
  lessonBody: { gap: 20 },
  lessonText: { fontSize: 17, lineHeight: 26, color: '#444' },
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  taskText: { fontSize: 15, color: '#333', lineHeight: 22 },
  lessonFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  completeLessonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  stepItem: { marginBottom: 10 },
  stepText: { fontSize: 15, color: '#555', lineHeight: 20 },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    width: screenWidth,
    height: screenWidth,
  }
});
