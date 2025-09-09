import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecovery } from '../../hooks/useRecovery';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Calendar } from 'react-native-calendars';
import AchievementSystem from '../../components/AchievementSystem';
import CrisisIntervention from '../../components/CrisisIntervention';

export default function ProgressPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { soberDays, getStreakDays, userProfile, progress, addProgressEntry } = useRecovery();
  const { addMoodEntry, getAverageMood, getMoodTrend } = useAnalytics();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showCrisisIntervention, setShowCrisisIntervention] = useState(false);

  // Web alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  if (!userProfile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.welcomeContainer}>
          <MaterialIcons name="local-bar" size={80} color="#2E7D4A" />
          <Text style={styles.welcomeTitle}>Добро пожаловать в Путь к трезвости</Text>
          <Text style={styles.welcomeText}>
            Начните свой путь к здоровой жизни без алкоголя
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => router.push('/onboarding' as any)}
          >
            <Text style={styles.startButtonText}>Начать путь</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const streakDays = getStreakDays();
  const progressMarks = progress.reduce((acc, entry) => {
    acc[entry.date] = {
      marked: true,
      dotColor: entry.status === 'sober' ? '#2E7D4A' : '#FF6B6B'
    };
    return acc;
  }, {} as any);

  const handleLogDay = async (status: 'sober' | 'relapse') => {
    await addProgressEntry({
      date: selectedDate,
      status,
      mood
    });

        // Также добавляем данные в аналитику
    await addMoodEntry({
      date: selectedDate,
      mood,
      cravingLevel: status === 'relapse' ? 5 : (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3 | 4 | 5,
      stressLevel: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
      sleepQuality: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5
    });

    if (status === 'relapse') {
      showWebAlert(
        'Не сдавайтесь!',
        'Срыв - это не конец пути. Каждый новый день - новая возможность. Посетите раздел экстренной помощи.',
        () => router.push('/emergency' as any)
      );
    } else {
      showWebAlert('Отлично!', 'Ещё один день трезвости записан. Продолжайте в том же духе!');
    }
    setShowMoodSelector(false);
  };

  // Calculate health improvements
  const getHealthMetrics = () => {
    if (soberDays === 0) return null;
    
    const metrics = [];
    if (soberDays >= 1) metrics.push({ icon: 'bedtime', text: 'Улучшение сна', color: '#4CAF50' });
    if (soberDays >= 3) metrics.push({ icon: 'energy-savings-leaf', text: 'Больше энергии', color: '#8BC34A' });
    if (soberDays >= 7) metrics.push({ icon: 'favorite', text: 'Здоровье сердца', color: '#FF5722' });
    if (soberDays >= 14) metrics.push({ icon: 'psychology', text: 'Ясность мышления', color: '#3F51B5' });
    if (soberDays >= 30) metrics.push({ icon: 'immune', text: 'Крепкий иммунитет', color: '#9C27B0' });
    
    return metrics;
  };

  const healthMetrics = getHealthMetrics();

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Ваш прогресс</Text>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => setShowCrisisIntervention(true)}
        >
          <MaterialIcons name="emergency" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="timeline" size={32} color="#2E7D4A" />
          <Text style={styles.statNumber}>{soberDays}</Text>
          <Text style={styles.statLabel}>Дней трезвости</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="local-fire-department" size={32} color="#FF9800" />
          <Text style={styles.statNumber}>{streakDays}</Text>
          <Text style={styles.statLabel}>Текущая серия</Text>
        </View>
      </View>

      {/* Health Improvements */}
      {healthMetrics && (
        <View style={styles.healthContainer}>
          <Text style={styles.sectionTitle}>Улучшения здоровья</Text>
          <View style={styles.healthMetrics}>
            {healthMetrics.map((metric, index) => (
              <View key={index} style={styles.healthMetric}>
                <MaterialIcons name={metric.icon as any} size={24} color={metric.color} />
                <Text style={styles.healthText}>{metric.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Mood Analytics Preview */}
      <View style={styles.moodPreview}>
        <View style={styles.moodHeader}>
          <Text style={styles.sectionTitle}>Настроение</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/analytics' as any)}>
            <Text style={styles.viewMore}>Подробнее →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.moodStats}>
          <View style={styles.moodStat}>
            <Text style={styles.moodNumber}>{getAverageMood(7).toFixed(1)}</Text>
            <Text style={styles.moodLabel}>Среднее за неделю</Text>
          </View>
          <View style={styles.moodStat}>
            <MaterialIcons 
              name={getMoodTrend() === 'improving' ? 'trending-up' : getMoodTrend() === 'declining' ? 'trending-down' : 'trending-flat'} 
              size={32} 
              color={getMoodTrend() === 'improving' ? '#4CAF50' : getMoodTrend() === 'declining' ? '#FF6B6B' : '#FF9800'} 
            />
            <Text style={styles.moodLabel}>
              {getMoodTrend() === 'improving' ? 'Улучшается' : getMoodTrend() === 'declining' ? 'Снижается' : 'Стабильно'}
            </Text>
          </View>
        </View>
      </View>

      {/* Achievement System */}
      <AchievementSystem />

      <View style={styles.calendarContainer}>
        <Text style={styles.sectionTitle}>Календарь трезвости</Text>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            ...progressMarks,
            [selectedDate]: {
              ...progressMarks[selectedDate],
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
        />
      </View>

      <View style={styles.actionContainer}>
        <Text style={styles.sectionTitle}>Отметить день</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.soberButton]}
            onPress={() => setShowMoodSelector(true)}
          >
            <MaterialIcons name="check-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Трезвый день</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.relapseButton]}
            onPress={() => handleLogDay('relapse')}
          >
            <MaterialIcons name="cancel" size={24} color="white" />
            <Text style={styles.actionButtonText}>Был срыв</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mood Selector Modal */}
      <Modal visible={showMoodSelector} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Как ваше настроение?</Text>
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
                    {moodValue === 1 ? '😢' : moodValue === 2 ? '😕' : moodValue === 3 ? '😐' : moodValue === 4 ? '😊' : '😄'}
                  </Text>
                  <Text style={styles.moodLabel}>
                    {moodValue === 1 ? 'Плохо' : moodValue === 2 ? 'Грустно' : moodValue === 3 ? 'Нормально' : moodValue === 4 ? 'Хорошо' : 'Отлично'}
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
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Подтвердить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, minWidth: 280 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{alertConfig.title}</Text>
              <Text style={{ fontSize: 16, marginBottom: 20 }}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#2E7D4A', padding: 10, borderRadius: 4, alignItems: 'center' }}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Crisis Intervention Modal */}
      <CrisisIntervention 
        visible={showCrisisIntervention}
        onClose={() => setShowCrisisIntervention(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#2E7D4A'
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    lineHeight: 22
  },
  startButton: {
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  emergencyButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFE6E6'
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginTop: 8
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center'
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
    flexWrap: 'wrap',
    gap: 12
  },
  healthMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  healthText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  calendarContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  actionContainer: {
    margin: 20
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8
  },
  soberButton: {
    backgroundColor: '#2E7D4A'
  },
  relapseButton: {
    backgroundColor: '#FF6B6B'
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2E7D4A'
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    minWidth: 60
  },
  selectedMood: {
    backgroundColor: '#2E7D4A'
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center'
  },
  confirmButton: {
    backgroundColor: '#2E7D4A'
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  confirmButtonText: {
    color: 'white'
  },
  moodPreview: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  viewMore: {
    fontSize: 14,
    color: '#2E7D4A',
    fontWeight: '500'
  },
  moodStats: {
    flexDirection: 'row',
    gap: 20
  },
  moodStat: {
    flex: 1,
    alignItems: 'center'
  },
  moodNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  }
});