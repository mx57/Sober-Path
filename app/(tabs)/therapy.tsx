import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { modernTechniques, ModernTechnique, mindfulnessExercises } from '../../services/modernPsychologyService';

export default function TherapyPage() {
  const insets = useSafeAreaInsets();
  const [selectedTechnique, setSelectedTechnique] = useState<ModernTechnique | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const categoryIcons: Record<string, string> = {
    cbt: 'psychology',
    dbt: 'favorite',
    act: 'self-improvement',
    mindfulness: 'spa',
    emdr: 'visibility',
    somatic: 'accessibility-new'
  };

  const categoryNames: Record<string, string> = {
    cbt: 'Когнитивно-поведенческая терапия',
    dbt: 'Диалектическая поведенческая терапия',
    act: 'Терапия принятия и ответственности',
    mindfulness: 'Осознанность',
    emdr: 'EMDR терапия',
    somatic: 'Соматическая терапия'
  };

  const difficultyColors = {
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#F44336'
  };

  const startTechnique = (technique: ModernTechnique) => {
    setSelectedTechnique(technique);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (!selectedTechnique) return;
    
    if (currentStep < selectedTechnique.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTechnique();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTechnique = () => {
    setIsActive(false);
    setSelectedTechnique(null);
    setCurrentStep(0);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Современная терапия</Text>
        <Text style={styles.subtitle}>
          Научно-обоснованные методы психотерапии
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <MaterialIcons name="school" size={24} color="#2E7D4A" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Профессиональные техники</Text>
            <Text style={styles.infoDescription}>
              Используйте методы, применяемые ведущими психотерапевтами мира. 
              Все техники адаптированы для самостоятельной работы.
            </Text>
          </View>
        </View>

        {modernTechniques.map((technique) => (
          <View key={technique.id} style={styles.techniqueCard}>
            <View style={styles.techniqueHeader}>
              <MaterialIcons 
                name={categoryIcons[technique.category] as any} 
                size={32} 
                color="#2E7D4A" 
              />
              <View style={styles.techniqueInfo}>
                <Text style={styles.techniqueTitle}>{technique.title}</Text>
                <Text style={styles.categoryText}>
                  {categoryNames[technique.category]}
                </Text>
                <View style={styles.meta}>
                  <View style={styles.metaItem}>
                    <MaterialIcons name="schedule" size={16} color="#999" />
                    <Text style={styles.metaText}>{technique.duration} мин</Text>
                  </View>
                  <View style={[
                    styles.difficultyBadge, 
                    { backgroundColor: difficultyColors[technique.difficulty] }
                  ]}>
                    <Text style={styles.difficultyText}>
                      {technique.difficulty === 'beginner' && 'Начальный'}
                      {technique.difficulty === 'intermediate' && 'Средний'}
                      {technique.difficulty === 'advanced' && 'Продвинутый'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.description}>{technique.description}</Text>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Польза:</Text>
              {technique.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => startTechnique(technique)}
            >
              <MaterialIcons name="play-circle-filled" size={20} color="white" />
              <Text style={styles.startButtonText}>Начать технику</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.mindfulnessSection}>
          <Text style={styles.sectionTitle}>Практики осознанности</Text>
          
          {mindfulnessExercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.mindfulnessCard}>
              <MaterialIcons name="spa" size={24} color="#2E7D4A" />
              <View style={styles.mindfulnessContent}>
                <Text style={styles.mindfulnessTitle}>{exercise.title}</Text>
                <Text style={styles.mindfulnessDescription}>
                  {exercise.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Technique Modal */}
      <Modal
        visible={isActive}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedTechnique && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTechnique.title}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={completeTechnique}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Шаг {currentStep + 1} из {selectedTechnique.instructions.length}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentStep + 1) / selectedTechnique.instructions.length) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            <ScrollView style={styles.stepContainer}>
              <Text style={styles.stepText}>
                {selectedTechnique.instructions[currentStep]}
              </Text>

              {selectedTechnique.category === 'mindfulness' && (
                <View style={styles.mindfulnessTip}>
                  <MaterialIcons name="lightbulb" size={20} color="#FF9800" />
                  <Text style={styles.tipText}>
                    Не переживайте, если ум отвлекается. Это нормально. 
                    Мягко возвращайте внимание к упражнению.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                style={[styles.navButton, currentStep === 0 && styles.disabledButton]}
                onPress={previousStep}
                disabled={currentStep === 0}
              >
                <MaterialIcons 
                  name="chevron-left" 
                  size={24} 
                  color={currentStep === 0 ? '#CCC' : '#2E7D4A'} 
                />
                <Text style={[
                  styles.navButtonText, 
                  currentStep === 0 && styles.disabledText
                ]}>
                  Назад
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.nextButton}
                onPress={nextStep}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === selectedTechnique.instructions.length - 1 ? 'Завершить' : 'Далее'}
                </Text>
                <MaterialIcons 
                  name={currentStep === selectedTechnique.instructions.length - 1 ? 'check' : 'chevron-right'} 
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
    backgroundColor: '#E3F2FD',
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
    color: '#1976D2',
    marginBottom: 5
  },
  infoDescription: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20
  },
  techniqueCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  techniqueHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15
  },
  techniqueInfo: {
    flex: 1
  },
  techniqueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 14,
    color: '#999'
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold'
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 15
  },
  benefitsContainer: {
    marginBottom: 20
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    flex: 1
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
  mindfulnessSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
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
  mindfulnessCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#F1F8E9',
    borderRadius: 10,
    marginBottom: 10,
    gap: 12
  },
  mindfulnessContent: {
    flex: 1
  },
  mindfulnessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#33691E',
    marginBottom: 5
  },
  mindfulnessDescription: {
    fontSize: 14,
    color: '#558B2F',
    lineHeight: 20
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
    textAlign: 'center',
    marginBottom: 20
  },
  mindfulnessTip: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 10,
    gap: 10
  },
  tipText: {
    fontSize: 14,
    color: '#F57F17',
    flex: 1,
    lineHeight: 20
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