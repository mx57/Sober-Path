import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { microCoursesDatabase } from '../../services/microCoursesDatabase';

const { width: screenWidth } = Dimensions.get('window');

export default function MicroCoursesPage() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.header}>
        <Text style={styles.title}>Микро-курсы</Text>
        <Text style={styles.subtitle}>Короткие уроки для глубоких перемен</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {microCoursesDatabase.map((course) => (
          <View key={course.id} style={styles.courseCard}>
            <View style={styles.courseBadge}>
              <Text style={styles.badgeText}>{course.category}</Text>
            </View>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>

            <View style={styles.courseFooter}>
              <View style={styles.metaInfo}>
                <MaterialIcons name="menu-book" size={16} color="#666" />
                <Text style={styles.metaText}>{course.lessons.length} уроков</Text>
              </View>
              <View style={styles.metaInfo}>
                <MaterialIcons name="speed" size={16} color="#666" />
                <Text style={styles.metaText}>{course.difficulty}</Text>
              </View>
              <TouchableOpacity style={styles.startBtn}>
                <Text style={styles.startBtnText}>Начать</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
    paddingBottom: 30,
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
  content: {
    padding: 20,
    gap: 20
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12
  },
  badgeText: {
    color: '#2E7D4A',
    fontSize: 12,
    fontWeight: 'bold'
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 12,
    color: '#666'
  },
  startBtn: {
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  startBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
});
