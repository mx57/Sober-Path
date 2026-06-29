import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, FlatList, Modal, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import { microCoursesDatabase } from '../../services/microCoursesDatabase';
import { MicroCourse, MicroLesson, UserCourseProgress } from '../../services/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');
const PROGRESS_KEY = 'sober_path_course_progress';

export default function MicroCoursesPage() {
  const insets = useSafeAreaInsets();
  const [selectedCourse, setSelectedCourse] = useState<MicroCourse | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLessonModalVisible, setIsLessonModalVisible] = useState(false);
  const [courseProgress, setCourseProgress] = useState<Record<string, UserCourseProgress>>({});

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      if (stored) {
        setCourseProgress(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    }
  };

  const saveProgress = async (newProgress: Record<string, UserCourseProgress>) => {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      setCourseProgress(newProgress);
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  };

  const startCourse = (course: MicroCourse) => {
    setSelectedCourse(course);
    const progress = courseProgress[course.id];
    if (progress && progress.completedLessons.length < course.lessons.length) {
      setCurrentLessonIndex(progress.completedLessons.length);
    } else {
      setCurrentLessonIndex(0);
    }
    setIsLessonModalVisible(true);
  };

  const completeLesson = async () => {
    if (!selectedCourse) return;

    const lesson = selectedCourse.lessons[currentLessonIndex];
    const progress = courseProgress[selectedCourse.id] || {
      courseId: selectedCourse.id,
      completedLessons: [],
      isCompleted: false,
      lastAccessed: new Date().toISOString()
    };

    if (!progress.completedLessons.includes(lesson.id)) {
      progress.completedLessons.push(lesson.id);
    }

    if (progress.completedLessons.length === selectedCourse.lessons.length) {
      progress.isCompleted = true;
    }

    const newProgress = { ...courseProgress, [selectedCourse.id]: progress };
    await saveProgress(newProgress);

    if (currentLessonIndex < selectedCourse.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      setIsLessonModalVisible(false);
      Alert.alert('Поздравляем!', `Вы завершили курс "${selectedCourse.title}"!`);
    }
  };

  const renderCourseCard = ({ item }: { item: MicroCourse }) => {
    const progress = courseProgress[item.id];
    const completedCount = progress?.completedLessons.length || 0;
    const percent = Math.round((completedCount / item.lessons.length) * 100);

    return (
      <Animated.View entering={FadeInUp.delay(200)}>
        <TouchableOpacity
          style={styles.courseCard}
          onPress={() => startCourse(item)}
        >
          <View style={styles.courseIconContainer}>
            <MaterialIcons name={item.icon as any} size={32} color="#2E7D4A" />
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${percent}%` }]} />
            </View>
            <View style={styles.courseFooter}>
              <Text style={styles.lessonCount}>{item.lessons.length} уроков</Text>
              <Text style={styles.progressPercent}>{percent}% завершено</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.header}>
        <Text style={styles.title}>Микро-курсы</Text>
        <Text style={styles.subtitle}>Маленькие шаги к большой цели</Text>
      </LinearGradient>

      <FlatList
        data={microCoursesDatabase}
        renderItem={renderCourseCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={isLessonModalVisible}
        animationType="slide"
        onRequestClose={() => setIsLessonModalVisible(false)}
      >
        {selectedCourse && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsLessonModalVisible(false)}>
                <MaterialIcons name="close" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedCourse.title}</Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.lessonProgress}>
              <Text style={styles.lessonStep}>Урок {currentLessonIndex + 1} из {selectedCourse.lessons.length}</Text>
              <View style={styles.modalProgressBarContainer}>
                <View style={[styles.modalProgressBar, { width: `${((currentLessonIndex + 1) / selectedCourse.lessons.length) * 100}%` }]} />
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.lessonContent}>
              <Animated.View entering={FadeInRight} key={currentLessonIndex}>
                <Text style={styles.lessonTitle}>{selectedCourse.lessons[currentLessonIndex].title}</Text>
                <View style={styles.lessonTypeBadge}>
                  <MaterialIcons
                    name={selectedCourse.lessons[currentLessonIndex].type === 'exercise' ? 'fitness-center' : 'book'}
                    size={16}
                    color="#2E7D4A"
                  />
                  <Text style={styles.lessonTypeText}>
                    {selectedCourse.lessons[currentLessonIndex].type === 'exercise' ? 'Упражнение' : 'Теория'}
                  </Text>
                  <Text style={styles.lessonDuration}>• {selectedCourse.lessons[currentLessonIndex].duration} мин</Text>
                </View>
                <Text style={styles.lessonText}>{selectedCourse.lessons[currentLessonIndex].content}</Text>

                {selectedCourse.lessons[currentLessonIndex].type === 'exercise' && (
                  <View style={styles.exerciseBox}>
                    <MaterialIcons name="lightbulb-outline" size={24} color="#2E7D4A" />
                    <Text style={styles.exerciseText}>Это практическое задание. Попробуйте выполнить его прямо сейчас.</Text>
                  </View>
                )}
              </Animated.View>
            </ScrollView>

            <View style={[styles.modalFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <TouchableOpacity style={styles.completeButton} onPress={completeLesson}>
                <Text style={styles.completeButtonText}>
                  {currentLessonIndex === selectedCourse.lessons.length - 1 ? 'Завершить курс' : 'Следующий урок'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    padding: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  courseInfo: {
    flex: 1
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  courseDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 8
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2E7D4A',
    borderRadius: 3
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  lessonCount: {
    fontSize: 12,
    color: '#999'
  },
  progressPercent: {
    fontSize: 12,
    color: '#2E7D4A',
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10
  },
  lessonProgress: {
    padding: 20,
    backgroundColor: '#F8F9FA'
  },
  lessonStep: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  modalProgressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2
  },
  modalProgressBar: {
    height: 4,
    backgroundColor: '#2E7D4A',
    borderRadius: 2
  },
  lessonContent: {
    padding: 20
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  lessonTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  lessonTypeText: {
    fontSize: 12,
    color: '#2E7D4A',
    fontWeight: 'bold',
    marginLeft: 4
  },
  lessonDuration: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6
  },
  lessonText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26
  },
  exerciseBox: {
    marginTop: 25,
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  exerciseText: {
    fontSize: 14,
    color: '#856404',
    flex: 1
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  completeButton: {
    backgroundColor: '#2E7D4A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
