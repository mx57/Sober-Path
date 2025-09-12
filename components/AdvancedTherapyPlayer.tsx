import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdvancedTherapy, advancedTherapies } from '../services/advancedPsychologyService';

interface AdvancedTherapyPlayerProps {
  visible: boolean;
  onClose: () => void;
  therapy?: AdvancedTherapy;
}

export default function AdvancedTherapyPlayer({ visible, onClose, therapy }: AdvancedTherapyPlayerProps) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intensity, setIntensity] = useState(5);
  const [sessionNotes, setSessionNotes] = useState('');

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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsActive(false);
            completeStep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer]);

  const startStep = () => {
    if (!therapy) return;
    
    // Проверка противопоказаний
    if (therapy.contraindications.length > 0) {
      showWebAlert(
        'Важная информация',
        `Противопоказания:\n${therapy.contraindications.join('\n')}\n\nВы уверены, что хотите продолжить?`,
        () => {
          setTimer(180); // 3 минуты на шаг
          setIsActive(true);
        }
      );
    } else {
      setTimer(180);
      setIsActive(true);
    }
  };

  const completeStep = () => {
    if (!therapy) return;
    
    if (currentStep < therapy.instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
      showWebAlert('Шаг завершен', 'Переходим к следующему этапу техники');
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    showWebAlert(
      'Сессия завершена',
      'Отлично! Вы прошли полную сессию. Как вы себя чувствуете?',
      () => {
        setCurrentStep(0);
        setIsActive(false);
        onClose();
      }
    );
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resumeSession = () => {
    setIsActive(true);
  };

  const resetSession = () => {
    setCurrentStep(0);
    setIsActive(false);
    setTimer(0);
    setIntensity(5);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#666';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Начальный';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return 'Неизвестно';
    }
  };

  if (!therapy) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{therapy.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Информация о технике */}
          <View style={styles.infoSection}>
            <Text style={styles.description}>{therapy.description}</Text>
            
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={20} color="#666" />
                <Text style={styles.metaText}>{therapy.duration} мин</Text>
              </View>
              
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(therapy.difficulty) }]}>
                <Text style={styles.difficultyText}>{getDifficultyText(therapy.difficulty)}</Text>
              </View>
            </View>

            {/* Преимущества */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Преимущества:</Text>
              {therapy.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Противопоказания */}
            {therapy.contraindications.length > 0 && (
              <View style={styles.warningSection}>
                <MaterialIcons name="warning" size={20} color="#FF6B6B" />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Противопоказания:</Text>
                  {therapy.contraindications.map((item, index) => (
                    <Text key={index} style={styles.warningText}>• {item}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Прогресс сессии */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>
              Шаг {currentStep + 1} из {therapy.instructions.length}
            </Text>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / therapy.instructions.length) * 100}%` }
                ]} 
              />
            </View>

            {/* Таймер */}
            {isActive && (
              <View style={styles.timerSection}>
                <MaterialIcons name="timer" size={24} color="#2E7D4A" />
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
              </View>
            )}
          </View>

          {/* Текущая инструкция */}
          <View style={styles.instructionSection}>
            <Text style={styles.instructionText}>
              {therapy.instructions[currentStep]}
            </Text>
          </View>

          {/* Оценка интенсивности */}
          <View style={styles.intensitySection}>
            <Text style={styles.intensityTitle}>Уровень дискомфорта (1-10):</Text>
            <View style={styles.intensityScale}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.intensityButton,
                    intensity === value && styles.selectedIntensity,
                    { backgroundColor: value <= 3 ? '#4CAF50' : value <= 6 ? '#FF9800' : '#FF6B6B' }
                  ]}
                  onPress={() => setIntensity(value)}
                >
                  <Text style={[
                    styles.intensityButtonText,
                    intensity === value && styles.selectedIntensityText
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Элементы управления */}
          <View style={styles.controlsSection}>
            {!isActive ? (
              <TouchableOpacity style={styles.startButton} onPress={startStep}>
                <MaterialIcons name="play-arrow" size={24} color="white" />
                <Text style={styles.startButtonText}>Начать шаг</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.activeControls}>
                <TouchableOpacity style={styles.pauseButton} onPress={pauseSession}>
                  <MaterialIcons name="pause" size={24} color="#FF9800" />
                  <Text style={styles.pauseButtonText}>Пауза</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.nextButton} onPress={completeStep}>
                  <MaterialIcons name="skip-next" size={24} color="white" />
                  <Text style={styles.nextButtonText}>Далее</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.resetButton} onPress={resetSession}>
              <MaterialIcons name="refresh" size={20} color="#666" />
              <Text style={styles.resetButtonText}>Сначала</Text>
            </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    flex: 1,
    marginRight: 10
  },
  closeButton: {
    padding: 5
  },
  content: {
    padding: 20,
    gap: 20
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  metaText: {
    fontSize: 14,
    color: '#666'
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold'
  },
  benefitsSection: {
    marginBottom: 20
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    flex: 1
  },
  warningSection: {
    flexDirection: 'row',
    backgroundColor: '#FFE6E6',
    padding: 15,
    borderRadius: 10,
    gap: 10
  },
  warningContent: {
    flex: 1
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#CC0000',
    marginBottom: 5
  },
  warningText: {
    fontSize: 12,
    color: '#990000',
    lineHeight: 18
  },
  progressSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center'
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D4A'
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  instructionSection: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 15
  },
  instructionText: {
    fontSize: 18,
    color: '#2E7D4A',
    lineHeight: 28,
    textAlign: 'center'
  },
  intensitySection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15
  },
  intensityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  intensityScale: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  intensityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7
  },
  selectedIntensity: {
    opacity: 1,
    transform: [{ scale: 1.2 }]
  },
  intensityButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white'
  },
  selectedIntensityText: {
    fontSize: 14
  },
  controlsSection: {
    gap: 15
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D4A',
    padding: 15,
    borderRadius: 12,
    gap: 8
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  activeControls: {
    flexDirection: 'row',
    gap: 15
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 12,
    gap: 8
  },
  pauseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D4A',
    padding: 15,
    borderRadius: 12,
    gap: 8
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 10,
    gap: 6
  },
  resetButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  }
});