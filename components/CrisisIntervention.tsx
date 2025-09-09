import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CrisisInterventionProps {
  visible: boolean;
  onClose: () => void;
}

const crisisLevels = [
  {
    level: 1,
    title: 'Легкое желание',
    color: '#FFC107',
    interventions: [
      'Сделайте 10 глубоких вдохов',
      'Выпейте стакан воды медленными глотками',
      'Включите любимую музыку',
      'Прогуляйтесь 5 минут'
    ]
  },
  {
    level: 2,
    title: 'Умеренное желание',
    color: '#FF9800',
    interventions: [
      'Техника 5-4-3-2-1 заземления',
      'Холодный душ или умывание',
      'Позвоните другу или близкому',
      'Сделайте физические упражнения'
    ]
  },
  {
    level: 3,
    title: 'Сильное желание',
    color: '#FF5722',
    interventions: [
      'Немедленно смените обстановку',
      'Активируйте план экстренных действий',
      'Используйте техники НЛП из приложения',
      'Обратитесь за профессиональной помощью'
    ]
  },
  {
    level: 4,
    title: 'Критическое состояние',
    color: '#F44336',
    interventions: [
      'Немедленно позвоните на горячую линию',
      'Обратитесь в ближайший центр помощи',
      'Активируйте сеть экстренной поддержки',
      'Рассмотрите госпитализацию'
    ]
  }
];

const breathingExercises = [
  {
    name: 'Дыхание 4-7-8',
    steps: [
      'Вдох через нос на 4 счета',
      'Задержка дыхания на 7 счетов',
      'Выдох через рот на 8 счетов',
      'Повторить 4 цикла'
    ],
    duration: 90
  },
  {
    name: 'Квадратное дыхание',
    steps: [
      'Вдох на 4 счета',
      'Задержка на 4 счета',
      'Выдох на 4 счета',
      'Пауза на 4 счета'
    ],
    duration: 120
  }
];

export default function CrisisIntervention({ visible, onClose }: CrisisInterventionProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

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

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isTimerActive && exerciseTimer > 0) {
      interval = setInterval(() => {
        setExerciseTimer(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            showWebAlert('Отлично!', 'Дыхательное упражнение завершено. Как вы себя чувствуете?');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, exerciseTimer]);

  const startBreathingExercise = (index: number) => {
    const exercise = breathingExercises[index];
    setActiveExercise(index);
    setExerciseTimer(exercise.duration);
    setIsTimerActive(true);
  };

  const stopExercise = () => {
    setIsTimerActive(false);
    setActiveExercise(null);
    setExerciseTimer(0);
  };

  const callHelpline = () => {
    showWebAlert(
      'Горячая линия помощи',
      'Бесплатная психологическая помощь:\n\n8-800-200-0-200\nКруглосуточно, анонимно\n\nТелефон доверия:\n8-800-2000-122\n\nЭкстренная психологическая помощь:\n051 (с мобильного)'
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Экстренная помощь</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Немедленные действия */}
          <View style={styles.immediateActions}>
            <Text style={styles.sectionTitle}>Немедленные действия</Text>
            
            <TouchableOpacity style={styles.emergencyButton} onPress={callHelpline}>
              <MaterialIcons name="phone" size={24} color="white" />
              <Text style={styles.emergencyButtonText}>Позвонить на горячую линию</Text>
            </TouchableOpacity>

            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction}>
                <MaterialIcons name="air" size={32} color="#2E7D4A" />
                <Text style={styles.quickActionText}>Дышите медленно</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction}>
                <MaterialIcons name="local-drink" size={32} color="#2196F3" />
                <Text style={styles.quickActionText}>Выпейте воды</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickAction}>
                <MaterialIcons name="nature" size={32} color="#4CAF50" />
                <Text style={styles.quickActionText}>Выйдите на воздух</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Оценка уровня кризиса */}
          <View style={styles.crisisAssessment}>
            <Text style={styles.sectionTitle}>Оцените интенсивность желания (1-4):</Text>
            
            <View style={styles.levelsContainer}>
              {crisisLevels.map((crisis, index) => (
                <TouchableOpacity
                  key={crisis.level}
                  style={[
                    styles.levelButton,
                    { borderColor: crisis.color },
                    selectedLevel === crisis.level && { backgroundColor: crisis.color }
                  ]}
                  onPress={() => setSelectedLevel(crisis.level)}
                >
                  <Text style={[
                    styles.levelNumber,
                    selectedLevel === crisis.level && styles.selectedLevelText
                  ]}>
                    {crisis.level}
                  </Text>
                  <Text style={[
                    styles.levelTitle,
                    selectedLevel === crisis.level && styles.selectedLevelText
                  ]}>
                    {crisis.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedLevel && (
              <View style={styles.interventions}>
                <Text style={styles.interventionsTitle}>
                  Рекомендуемые действия:
                </Text>
                {crisisLevels[selectedLevel - 1].interventions.map((intervention, index) => (
                  <View key={index} style={styles.interventionItem}>
                    <MaterialIcons name="check-circle" size={20} color="#2E7D4A" />
                    <Text style={styles.interventionText}>{intervention}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Дыхательные упражнения */}
          <View style={styles.breathingSection}>
            <Text style={styles.sectionTitle}>Дыхательные упражнения</Text>
            
            {activeExercise !== null && isTimerActive ? (
              <View style={styles.activeExercise}>
                <Text style={styles.exerciseName}>
                  {breathingExercises[activeExercise].name}
                </Text>
                <Text style={styles.timer}>{formatTime(exerciseTimer)}</Text>
                
                <View style={styles.exerciseSteps}>
                  {breathingExercises[activeExercise].steps.map((step, index) => (
                    <Text key={index} style={styles.stepText}>
                      {index + 1}. {step}
                    </Text>
                  ))}
                </View>

                <TouchableOpacity style={styles.stopButton} onPress={stopExercise}>
                  <MaterialIcons name="stop" size={20} color="#FF6B6B" />
                  <Text style={styles.stopButtonText}>Остановить</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.exercisesList}>
                {breathingExercises.map((exercise, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exerciseCard}
                    onPress={() => startBreathingExercise(index)}
                  >
                    <MaterialIcons name="spa" size={24} color="#2E7D4A" />
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseDuration}>
                        {Math.floor(exercise.duration / 60)} мин
                      </Text>
                    </View>
                    <MaterialIcons name="play-arrow" size={24} color="#2E7D4A" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Техники заземления */}
          <View style={styles.groundingSection}>
            <Text style={styles.sectionTitle}>Техника заземления 5-4-3-2-1</Text>
            
            <View style={styles.groundingSteps}>
              <View style={styles.groundingStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#F44336' }]}>
                  <Text style={styles.stepNumberText}>5</Text>
                </View>
                <Text style={styles.groundingText}>
                  Назовите 5 вещей, которые видите вокруг
                </Text>
              </View>

              <View style={styles.groundingStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#FF9800' }]}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.groundingText}>
                  4 вещи, которые можете потрогать
                </Text>
              </View>

              <View style={styles.groundingStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#FFC107' }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.groundingText}>
                  3 звука, которые слышите
                </Text>
              </View>

              <View style={styles.groundingStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.groundingText}>
                  2 запаха, которые чувствуете
                </Text>
              </View>

              <View style={styles.groundingStep}>
                <View style={[styles.stepNumber, { backgroundColor: '#2196F3' }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.groundingText}>
                  1 вкус во рту
                </Text>
              </View>
            </View>
          </View>

          {/* Контакты экстренной помощи */}
          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Экстренные контакты</Text>
            
            <View style={styles.contactItem}>
              <MaterialIcons name="phone" size={20} color="#2E7D4A" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Телефон доверия</Text>
                <Text style={styles.contactNumber}>8-800-200-0-200</Text>
                <Text style={styles.contactDescription}>Бесплатно, круглосуточно</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <MaterialIcons name="local-hospital" size={20} color="#FF6B6B" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Экстренная помощь</Text>
                <Text style={styles.contactNumber}>103</Text>
                <Text style={styles.contactDescription}>Скорая медицинская помощь</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Web Alert Modal */}
        {Platform.OS === 'web' && (
          <Modal visible={alertConfig.visible} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, minWidth: 280, maxWidth: '80%' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{alertConfig.title}</Text>
                <Text style={{ fontSize: 16, marginBottom: 20, lineHeight: 22 }}>{alertConfig.message}</Text>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B'
  },
  closeButton: {
    padding: 5
  },
  content: {
    padding: 20,
    gap: 25
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  immediateActions: {
    backgroundColor: '#FFE6E6',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B'
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    gap: 8
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  quickAction: {
    alignItems: 'center',
    padding: 10
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center'
  },
  crisisAssessment: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15
  },
  levelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  levelButton: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center'
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  levelTitle: {
    fontSize: 12,
    textAlign: 'center'
  },
  selectedLevelText: {
    color: 'white'
  },
  interventions: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10
  },
  interventionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  interventionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  interventionText: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  breathingSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15
  },
  activeExercise: {
    alignItems: 'center'
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 20
  },
  exerciseSteps: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'stretch'
  },
  stepText: {
    fontSize: 14,
    color: '#2E7D4A',
    marginBottom: 5
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    padding: 10,
    borderRadius: 8,
    gap: 5
  },
  stopButtonText: {
    color: '#FF6B6B',
    fontWeight: '500'
  },
  exercisesList: {
    gap: 10
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    gap: 12
  },
  exerciseInfo: {
    flex: 1
  },
  exerciseDuration: {
    fontSize: 12,
    color: '#666'
  },
  groundingSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15
  },
  groundingSteps: {
    gap: 15
  },
  groundingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  groundingText: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  contactsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 10,
    gap: 12
  },
  contactInfo: {
    flex: 1
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 2
  },
  contactDescription: {
    fontSize: 12,
    color: '#666'
  }
});