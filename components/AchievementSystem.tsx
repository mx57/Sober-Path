import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRecovery } from '../hooks/useRecovery';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (soberDays: number, streakDays: number, completedExercises: number) => boolean;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'milestone' | 'streak' | 'learning' | 'dedication';
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'Первый шаг',
    description: 'Создали профиль и начали свой путь',
    icon: 'emoji-events',
    condition: () => true,
    unlocked: false,
    category: 'milestone'
  },
  {
    id: '2',
    title: 'Неделя силы',
    description: '7 дней трезвости подряд',
    icon: 'local-fire-department',
    condition: (_, streak) => streak >= 7,
    unlocked: false,
    category: 'streak'
  },
  {
    id: '3',
    title: 'Месяц побед',
    description: '30 дней трезвости подряд',
    icon: 'military-tech',
    condition: (_, streak) => streak >= 30,
    unlocked: false,
    category: 'streak'
  },
  {
    id: '4',
    title: 'Исследователь НЛП',
    description: 'Завершили 5 НЛП упражнений',
    icon: 'psychology',
    condition: (_, __, exercises) => exercises >= 5,
    unlocked: false,
    category: 'learning'
  },
  {
    id: '5',
    title: 'Мастер медитации',
    description: 'Использовали аудиотерапию 10 раз',
    icon: 'spa',
    condition: () => false, // Будет связано с аудио счетчиком
    unlocked: false,
    category: 'dedication'
  },
  {
    id: '6',
    title: 'Сто дней свободы',
    description: '100 дней трезвости подряд',
    icon: 'workspace-premium',
    condition: (_, streak) => streak >= 100,
    unlocked: false,
    category: 'streak'
  }
];

export default function AchievementSystem() {
  const { soberDays, getStreakDays } = useRecovery();
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(achievements);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  useEffect(() => {
    checkAchievements();
  }, [soberDays, getStreakDays()]);

  const checkAchievements = () => {
    const streakDays = getStreakDays();
    const completedExercises = 0; // Это будет связано с реальным счетчиком

    const updatedAchievements = userAchievements.map(achievement => {
      if (!achievement.unlocked && achievement.condition(soberDays, streakDays, completedExercises)) {
        const newAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        
        // Показать уведомление о новом достижении
        showAchievementUnlocked(newAchievement);
        
        return newAchievement;
      }
      return achievement;
    });

    setUserAchievements(updatedAchievements);
  };

  const showAchievementUnlocked = (achievement: Achievement) => {
    setNewAchievement(achievement);
    setShowModal(true);
    
    // Анимация появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.back(1.5),
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowModal(false);
      setNewAchievement(null);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
    });
  };

  const categoryColors = {
    milestone: '#4CAF50',
    streak: '#FF9800',
    learning: '#2196F3',
    dedication: '#9C27B0'
  };

  const categoryNames = {
    milestone: 'Этапы',
    streak: 'Серии',
    learning: 'Обучение',
    dedication: 'Посвященность'
  };

  const unlockedCount = userAchievements.filter(a => a.unlocked).length;
  const totalCount = userAchievements.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Достижения</Text>
        <Text style={styles.progress}>{unlockedCount}/{totalCount}</Text>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(unlockedCount / totalCount) * 100}%` }
          ]} 
        />
      </View>

      <View style={styles.achievementsList}>
        {userAchievements.map((achievement) => (
          <View 
            key={achievement.id} 
            style={[
              styles.achievementCard,
              achievement.unlocked ? styles.unlockedCard : styles.lockedCard
            ]}
          >
            <View style={[
              styles.iconContainer,
              { backgroundColor: achievement.unlocked ? categoryColors[achievement.category] : '#E0E0E0' }
            ]}>
              <MaterialIcons 
                name={achievement.icon as any} 
                size={24} 
                color={achievement.unlocked ? 'white' : '#999'} 
              />
            </View>
            
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementTitle,
                !achievement.unlocked && styles.lockedText
              ]}>
                {achievement.title}
              </Text>
              <Text style={[
                styles.achievementDescription,
                !achievement.unlocked && styles.lockedText
              ]}>
                {achievement.description}
              </Text>
              {achievement.unlocked && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Получено: {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
                </Text>
              )}
            </View>

            {achievement.unlocked && (
              <MaterialIcons name="check-circle" size={20} color={categoryColors[achievement.category]} />
            )}
          </View>
        ))}
      </View>

      {/* Achievement Unlocked Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.achievementModal,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.celebrationHeader}>
              <MaterialIcons name="celebration" size={40} color="#FFD700" />
              <Text style={styles.celebrationTitle}>Новое достижение!</Text>
            </View>

            {newAchievement && (
              <>
                <View style={[
                  styles.newAchievementIcon,
                  { backgroundColor: categoryColors[newAchievement.category] }
                ]}>
                  <MaterialIcons 
                    name={newAchievement.icon as any} 
                    size={48} 
                    color="white" 
                  />
                </View>

                <Text style={styles.newAchievementTitle}>
                  {newAchievement.title}
                </Text>
                <Text style={styles.newAchievementDescription}>
                  {newAchievement.description}
                </Text>

                <Text style={styles.categoryBadge}>
                  {categoryNames[newAchievement.category]}
                </Text>
              </>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Отлично!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  progress: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50'
  },
  achievementsList: {
    gap: 12
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 15
  },
  unlockedCard: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8F5E8'
  },
  lockedCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  achievementInfo: {
    flex: 1
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 4
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  lockedText: {
    color: '#999'
  },
  unlockedDate: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontStyle: 'italic'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  achievementModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: '85%'
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginTop: 10
  },
  newAchievementIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  newAchievementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    textAlign: 'center',
    marginBottom: 10
  },
  newAchievementDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15
  },
  categoryBadge: {
    backgroundColor: '#E8F5E8',
    color: '#2E7D4A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20
  },
  closeButton: {
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});