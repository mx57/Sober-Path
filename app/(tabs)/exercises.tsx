import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { advancedNLPTechniques, submodalityTechniques, mindfulnessExercises, NLPTechnique } from '../../services/enhancedNLPService';
import { modernTherapeuticTechniques, microTechniques } from '../../services/therapeuticTechniques';

export default function ExercisesPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('nlp');
  const [selectedTechnique, setSelectedTechnique] = useState<NLPTechnique | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  const categoryIcons: Record<string, string> = {
    nlp: 'psychology',
    therapy: 'healing',
    mindfulness: 'spa',
    micro: 'flash-on'
  };

  const categoryNames: Record<string, string> = {
    nlp: 'НЛП техники',
    therapy: 'Терапия',
    mindfulness: 'Осознанность',
    micro: 'Экспресс'
  };

  const difficultyColors = {
    beginner: '#4CAF50',
    intermediate: '#FF9800', 
    advanced: '#F44336',
    expert: '#9C27B0'
  };

  const difficultyNames = {
    beginner: 'Новичок',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
    expert: 'Эксперт'
  };

  const nlpCategoryColors = {
    anchoring: '#2196F3',
    reframing: '#4CAF50',
    timeline: '#9C27B0',
    submodalities: '#FF9800',
    swish: '#F44336',
    phobia: '#795548',
    belief_change: '#607D8B',
    parts_integration: '#00BCD4',
    meta_program: '#E91E63',
    perceptual_positions: '#FF9800'
  };

  const nlpCategoryNames = {
    anchoring: 'Якорение',
    reframing: 'Рефрейминг',
    timeline: 'Временная линия',
    submodalities: 'Субмодальности',
    swish: 'Свиш-паттерн',
    phobia: 'Работа с фобиями',
    belief_change: 'Изменение убеждений',
    parts_integration: 'Интеграция частей личности: согласование конфликтующих внутренних частей для достижения внутренней гармонии.',
    meta_program: 'Мета-программы: выявление и изменение глубинных ментальных шаблонов, влияющих на восприятие и поведение.',
    perceptual_positions: 'Позиции восприятия: взгляд на ситуацию с точки зрения себя, другого человека и наблюдателя для объективного понимания.'
  } as Record<string, string>;

  const startTechnique = (technique: NLPTechnique) => {
    setSelectedTechnique(technique);
    setShowDetailModal(true);
  };

  const startMicroTechnique = (technique: any) => {
    showWebAlert(
      technique.name,
      `Длительность: ${technique.duration} сек\n\nИспользуйте при: ${technique.situation}\n\nНачать выполнение?`,
      () => {
        // Здесь можно запустить таймер или гид по технике
        showWebAlert('Техника запущена', 'Следуйте инструкциям для выполнения упражнения');
      }
    );
  };

  const renderNLPTechniques = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Продвинутые НЛП техники</Text>
      <Text style={styles.sectionDescription}>
        Нейролингвистическое программирование для изменения поведенческих паттернов
      </Text>
      
      {advancedNLPTechniques.map((technique) => (
        <View key={technique.id} style={styles.techniqueCard}>
          <View style={styles.techniqueHeader}>
            <View style={[styles.categoryBadge, { 
              backgroundColor: nlpCategoryColors[technique.category] 
            }]}>
              <Text style={styles.categoryBadgeText}>
                {nlpCategoryNames[technique.category]}
              </Text>
            </View>
            <View style={[styles.difficultyBadge, { 
              backgroundColor: difficultyColors[technique.difficulty] 
            }]}>
              <Text style={styles.difficultyText}>
                {difficultyNames[technique.difficulty]}
              </Text>
            </View>
          </View>

          <Text style={styles.techniqueTitle}>{technique.name}</Text>
          <Text style={styles.techniqueDescription}>{technique.description}</Text>

          <View style={styles.techniqueMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.metaText}>{technique.duration} мин</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="format-list-numbered" size={16} color="#666" />
              <Text style={styles.metaText}>{technique.steps.length} шагов</Text>
            </View>
          </View>


          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Преимущества:</Text>
            <View style={styles.benefitsList}>
              {technique.benefits.slice(0, 3).map((benefit, index) => (
                <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
              ))}
            </View>
          </View>


          {technique.contraindications && (
            <View style={styles.warningBox}>
              <MaterialIcons name="warning" size={16} color="#FF9800" />
              <Text style={styles.warningText}>
                Противопоказания: {technique.contraindications.join(', ')}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => startTechnique(technique)}
          >
            <MaterialIcons name="play-arrow" size={20} color="white" />
            <Text style={styles.startButtonText}>Начать технику</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderTherapyTechniques = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Современные терапевтические техники</Text>
      <Text style={styles.sectionDescription}>
        CBT, DBT, ACT, EMDR, IFS, соматические техники и другие современные подходы
      </Text>
      
      {modernTherapeuticTechniques.map((technique) => (
        <View key={technique.id} style={styles.techniqueCard}>
          <View style={styles.techniqueHeader}>
            <View style={[styles.approachBadge]}>
              <Text style={styles.approachText}>{technique.approach}</Text>
            </View>
            <View style={[styles.difficultyBadge, { 
              backgroundColor: difficultyColors[technique.difficulty] 
            }]}>
              <Text style={styles.difficultyText}>
                {difficultyNames[technique.difficulty]}
              </Text>
            </View>
          </View>

          <Text style={styles.techniqueTitle}>{technique.name}</Text>
          <Text style={styles.techniqueDescription}>{technique.description}</Text>

          <View style={styles.techniqueMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.metaText}>{technique.duration} мин</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="format-list-numbered" size={16} color="#666" />
              <Text style={styles.metaText}>{technique.steps.length} шагов</Text>
            </View>
          </View>


          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Преимущества:</Text>
            <View style={styles.benefitsList}>
              {technique.benefits.slice(0, 3).map((benefit, index) => (
                <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
              ))}
            </View>
          </View>


          {technique.contraindications && (
            <View style={styles.warningBox}>
              <MaterialIcons name="warning" size={16} color="#FF9800" />
              <Text style={styles.warningText}>
                Противопоказания: {technique.contraindications.join(', ')}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: '#6A1B9A' }]}
            onPress={() => showWebAlert('Техника', `Запуск техники: ${technique.name}`)}
          >
            <MaterialIcons name="healing" size={20} color="white" />
            <Text style={styles.startButtonText}>Начать терапию</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderMindfulnessTechniques = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Техники осознанности</Text>
      <Text style={styles.sectionDescription}>
        Упражнения для развития внимательности и присутствия в моменте
      </Text>
      
      {mindfulnessExercises.map((exercise) => (
        <View key={exercise.id} style={styles.techniqueCard}>
          <Text style={styles.techniqueTitle}>{exercise.name}</Text>
          
          <View style={styles.techniqueMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color="#666" />
              <Text style={styles.metaText}>{exercise.duration} мин</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="format-list-numbered" size={16} color="#666" />
              <Text style={styles.metaText}>{exercise.instructions.length} шагов</Text>
            </View>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Инструкции:</Text>
            {exercise.instructions.slice(0, 3).map((instruction, index) => (
              <Text key={index} style={styles.instructionItem}>
                {index + 1}. {instruction}
              </Text>
            ))}
            {exercise.instructions.length > 3 && (
              <Text style={styles.moreInstructions}>
                и еще {exercise.instructions.length - 3} шагов...
              </Text>
            )}
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Преимущества:</Text>
            <View style={styles.benefitsList}>
              {exercise.benefits.map((benefit, index) => (
                <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: '#00BCD4' }]}
            onPress={() => showWebAlert('Осознанность', `Запуск упражнения: ${exercise.name}`)}
          >
            <MaterialIcons name="spa" size={20} color="white" />
            <Text style={styles.startButtonText}>Начать практику</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderMicroTechniques = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Экспресс-техники</Text>
      <Text style={styles.sectionDescription}>
        Быстрые техники для экстренных ситуаций (30 сек - 2 мин)
      </Text>
      
      {microTechniques.map((technique) => (
        <View key={technique.id} style={[styles.techniqueCard, styles.microTechniqueCard]}>
          <View style={styles.microHeader}>
            <Text style={styles.techniqueTitle}>{technique.name}</Text>
            <View style={styles.durationBadge}>
              <MaterialIcons name="flash-on" size={16} color="#FF6B6B" />
              <Text style={styles.durationText}>{technique.duration}с</Text>
            </View>
          </View>

          <Text style={styles.techniqueDescription}>{technique.description}</Text>
          
          <Text style={styles.situationText}>
            <Text style={styles.situationLabel}>Когда использовать: </Text>
            {technique.situation}
          </Text>

          <View style={styles.quickStepsContainer}>
            <Text style={styles.quickStepsTitle}>Быстрые шаги:</Text>
            {technique.steps.slice(0, 2).map((step, index) => (
              <Text key={index} style={styles.quickStepItem}>
                {index + 1}. {step}
              </Text>
            ))}
            {technique.steps.length > 2 && (
              <Text style={styles.moreSteps}>
                +{technique.steps.length - 2} шагов
              </Text>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.startButton, styles.microStartButton]}
            onPress={() => startMicroTechnique(technique)}
          >
            <MaterialIcons name="flash-on" size={20} color="white" />
            <Text style={styles.startButtonText}>Быстрый старт</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'nlp':
        return renderNLPTechniques();
      case 'therapy':
        return renderTherapyTechniques();
      case 'mindfulness':
        return renderMindfulnessTechniques();
      case 'micro':
        return renderMicroTechniques();
      default:
        return renderNLPTechniques();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Психотехники и НЛП</Text>
        <Text style={styles.subtitle}>
          Современные техники для изменения поведения и мышления
        </Text>
      </View>


      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {['nlp', 'therapy', 'mindfulness', 'micro'].map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, activeCategory === category && styles.activeCategoryButton]}
            onPress={() => setActiveCategory(category)}
          >
            <MaterialIcons 
              name={categoryIcons[category] as any} 
              size={20} 
              color={activeCategory === category ? 'white' : '#2E7D4A'} 
            />
            <Text style={[
              styles.categoryButtonText,
              activeCategory === category && styles.activeCategoryButtonText
            ]}>
              {categoryNames[category]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {renderContent()}
      </ScrollView>


      {selectedTechnique && (
        <Modal
          visible={showDetailModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowDetailModal(false)}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTechnique.name}</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalDescription}>{selectedTechnique.description}</Text>
              
              <View style={styles.modalSteps}>
                <Text style={styles.stepsTitle}>Пошаговое выполнение:</Text>
                {selectedTechnique.steps.map((step, index) => (
                  <View key={step.id} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepInstruction}>{step.instruction}</Text>
                      {step.duration && (
                        <Text style={styles.stepDuration}>Время: {step.duration} мин</Text>
                      )}
                      {step.tips && (
                        <View style={styles.tipsContainer}>
                          {step.tips.map((tip, tipIndex) => (
                            <Text key={tipIndex} style={styles.tipText}>💡 {tip}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}


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
  categoriesContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    gap: 6
  },
  activeCategoryButton: {
    backgroundColor: '#2E7D4A'
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D4A'
  },
  activeCategoryButtonText: {
    color: 'white'
  },
  content: {
    padding: 20
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20
  },
  techniqueCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 20,
    marginBottom: 15
  },
  microTechniqueCard: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: -10,
    marginVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderBottomWidth: 0
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  microHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  approachBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  approachText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: 'bold'
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  durationText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold'
  },
  techniqueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12
  },
  techniqueMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 14,
    color: '#666'
  },
  benefitsContainer: {
    marginBottom: 12
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 6
  },
  benefitsList: {
    gap: 2
  },
  benefitItem: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18
  },
  instructionsContainer: {
    marginBottom: 12
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 6
  },
  instructionItem: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 2
  },
  moreInstructions: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic'
  },
  situationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10
  },
  situationLabel: {
    fontWeight: 'bold',
    color: '#FF9800'
  },
  quickStepsContainer: {
    marginBottom: 12
  },
  quickStepsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 6
  },
  quickStepItem: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 2
  },
  moreSteps: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic'
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8
  },
  warningText: {
    fontSize: 12,
    color: '#F57C00',
    flex: 1
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    gap: 8
  },
  microStartButton: {
    backgroundColor: '#FF6B6B'
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
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
  modalContent: {
    padding: 20
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20
  },
  modalSteps: {
    gap: 20
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  stepItem: {
    flexDirection: 'row',
    gap: 15
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2E7D4A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  stepInstruction: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 6
  },
  stepDuration: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8
  },
  tipsContainer: {
    gap: 4
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16
  }
});
