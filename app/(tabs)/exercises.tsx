import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { nlpExercises, NLPExercise, NLPCategory } from '../../services/recoveryService';

export default function ExercisesPage() {
  const insets = useSafeAreaInsets();
  const [selectedExercise, setSelectedExercise] = useState<NLPExercise | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const categoryIcons: Record<NLPCategory, string> = {
    anchoring: 'anchor',
    visualization: 'visibility',
    reframing: 'refresh',
    future_pacing: 'timeline'
  };

  const categoryNames: Record<NLPCategory, string> = {
    anchoring: 'Якорение',
    visualization: 'Визуализация',
    reframing: 'Рефрейминг',
    future_pacing: 'Планирование будущего'
  };

  const startExercise = (exercise: NLPExercise) => {
    setSelectedExercise(exercise);
    setCurrentStep(0);
    setIsExerciseActive(true);
  };

  const nextStep = () => {
    if (!selectedExercise) return;
    
    if (currentStep < selectedExercise.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeExercise();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeExercise = () => {
    setIsExerciseActive(false);
    setSelectedExercise(null);
    setCurrentStep(0);
  };

  const renderExerciseCard = (exercise: NLPExercise) => (
    <View key={exercise.id} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <MaterialIcons 
          name={categoryIcons[exercise.category] as any} 
          size={32} 
          color="#2E7D4A" 
        />
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          <Text style={styles.exerciseCategory}>
            {categoryNames[exercise.category]}
          </Text>
          <View style={styles.exerciseMeta}>
            <MaterialIcons name="schedule" size={16} color="#999" />
            <Text style={styles.exerciseDuration}>{exercise.duration} мин</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.exerciseDescription}>
        {exercise.description}
      </Text>
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => startExercise(exercise)}
      >
        <MaterialIcons name="play-arrow" size={20} color="white" />
        <Text style={styles.startButtonText}>Начать упражнение</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>НЛП Упражнения</Text>
        <Text style={styles.subtitle}>
          Техники для укрепления мотивации и изменения привычек
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color="#2E7D4A" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>О НЛП упражнениях</Text>
            <Text style={styles.infoDescription}>
              Нейролингвистическое программирование помогает изменить восприятие и 
              создать новые положительные ассоциации. Выполняйте упражнения в спокойной 
              обстановке.
            </Text>
          </View>
        </View>

        {nlpExercises.map(renderExerciseCard)}
      </ScrollView>

      {/* Exercise Modal */}
      <Modal
        visible={isExerciseActive}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedExercise && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedExercise.title}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={completeExercise}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Шаг {currentStep + 1} из {selectedExercise.steps.length}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentStep + 1) / selectedExercise.steps.length) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            <ScrollView style={styles.stepContainer}>
              <Text style={styles.stepText}>
                {selectedExercise.steps[currentStep]}
              </Text>
            </ScrollView>

            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                style={[styles.navButton, currentStep === 0 && styles.disabledButton]}
                onPress={previousStep}
                disabled={currentStep === 0}
              >
                <MaterialIcons name="chevron-left" size={24} color={currentStep === 0 ? '#CCC' : '#2E7D4A'} />
                <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>
                  Назад
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.nextButton}
                onPress={nextStep}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === selectedExercise.steps.length - 1 ? 'Завершить' : 'Далее'}
                </Text>
                <MaterialIcons 
                  name={currentStep === selectedExercise.steps.length - 1 ? 'check' : 'chevron-right'} 
                  size={24} 
                  color="white" 
                />
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22
  },
  content: {
    padding: 20,
    gap: 20
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 12,
    gap: 12
  },
  infoText: {
    flex: 1
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  infoDescription: {
    fontSize: 14,
    color: '#4A6741',
    lineHeight: 20
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  exerciseHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15
  },
  exerciseInfo: {
    flex: 1
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#999'
  },
  exerciseDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 20
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D4A',
    padding: 12,
    borderRadius: 10,
    gap: 8
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    flex: 1
  },
  closeButton: {
    padding: 5
  },
  progressContainer: {
    padding: 20
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center'
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D4A'
  },
  stepContainer: {
    flex: 1,
    padding: 20
  },
  stepText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center'
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    gap: 4
  },
  disabledButton: {
    opacity: 0.5
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  disabledText: {
    color: '#CCC'
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D4A',
    padding: 12,
    borderRadius: 8,
    gap: 8
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});