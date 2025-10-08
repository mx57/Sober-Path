
// Расширенная страница НЛП техник и упражнений с новым контентом

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { 
  advancedNLPTechniques, 
  additionalNLPTechniques,
  beliefWorkTechniques,
  integrativeNLPTechniques
} from '../../services/enhancedNLPService';
import { advancedCBTTechniques } from '../../services/advancedCBTService';
import { traumaInformedTechniques } from '../../services/traumaTherapyService';
import { integrativeTherapyTechniques } from '../../services/integrativeTherapyService';

const { width: screenWidth } = Dimensions.get('window');

// Объединенная библиотека всех техник
const allTechniques = [
  ...advancedNLPTechniques.map(tech => ({ ...tech, category: 'НЛП Базовые', color: '#FF9800' })),
  ...additionalNLPTechniques.map(tech => ({ ...tech, category: 'НЛП Продвинутые', color: '#FF5722' })),
  ...beliefWorkTechniques.map(tech => ({ ...tech, category: 'Работа с убеждениями', color: '#E91E63' })),
  ...integrativeNLPTechniques.map(tech => ({ ...tech, category: 'НЛП Интегративные', color: '#9C27B0' })),
  ...advancedCBTTechniques.map(tech => ({ ...tech, category: 'КПТ', color: '#2196F3' })),
  ...traumaInformedTechniques.map(tech => ({ ...tech, category: 'Работа с травмой', color: '#673AB7' })),
  ...integrativeTherapyTechniques.map(tech => ({ ...tech, category: 'Интегративные методы', color: '#4CAF50' }))
];

interface Technique {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  duration: number;
  color: string;
  steps?: { title: string; instruction: string; duration?: number; tips?: string[] }[];
  benefits?: string[];
  contraindications?: string[];
  precautions?: string[];
}

// Мемоизированные компоненты
const MemoizedTechniqueCard = React.memo(({ technique, onPress }: {
  technique: Technique;
  onPress: () => void;
}) => {
  const scaleValue = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.96, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#FF5722';
      case 'expert': return '#9C27B0';
      default: return '#666';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      case 'expert': return 'Эксперт';
      default: return difficulty;
    }
  };

  return (
    <Animated.View style={[styles.techniqueCard, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.techniqueContent}>
        <View style={styles.techniqueHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: technique.color }]}>
            <Text style={styles.categoryText}>{technique.category}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(technique.difficulty) }]}>
            <Text style={styles.difficultyText}>{getDifficultyText(technique.difficulty)}</Text>
          </View>
        </View>
        
        <Text style={styles.techniqueName}>{technique.name}</Text>
        <Text style={styles.techniqueDescription} numberOfLines={2}>
          {technique.description}
        </Text>
        
        <View style={styles.techniqueFooter}>
          <View style={styles.durationContainer}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.durationText}>{technique.duration} мин</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const MemoizedFilterChip = React.memo(({ label, selected, onPress, color }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color: string;
}) => {
  const scaleValue = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          selected && { backgroundColor: color },
          selected && styles.selectedChip
        ]}
        onPress={handlePress}
      >
        <Text style={[
          styles.filterChipText,
          selected && styles.selectedChipText
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function EnhancedExercisesPage() {
  const insets = useSafeAreaInsets();
  
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Все');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);

  // Анимации
  const fadeInValue = useSharedValue(0);
  const slideValue = useSharedValue(30);

  const fadeInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: slideValue.value }]
  }));

  React.useEffect(() => {
    fadeInValue.value = withTiming(1, { duration: 800 });
    slideValue.value = withTiming(0, { duration: 800 });
  }, []);

  // Фильтры
  const categories = useMemo(() => {
    const cats = ['Все', ...new Set(allTechniques.map(tech => tech.category))];
    return cats;
  }, []);

  const difficulties = useMemo(() => {
    const diffs = ['Все', ...new Set(allTechniques.map(tech => tech.difficulty))];
    return diffs;
  }, []);

  // Фильтрация техник
  const filteredTechniques = useMemo(() => {
    return allTechniques.filter(tech => {
      const categoryMatch = selectedCategory === 'Все' || tech.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === 'Все' || tech.difficulty === selectedDifficulty;
      return categoryMatch && difficultyMatch;
    });
  }, [selectedCategory, selectedDifficulty]);

  // Обработчики
  const handleTechniquePress = useCallback((technique: Technique) => {
    setSelectedTechnique(technique);
    setCurrentStep(0);
    setIsSessionActive(false);
    setSessionTimer(0);
  }, []);

  const handleStartSession = useCallback(() => {
    if (!selectedTechnique?.steps || selectedTechnique.steps.length === 0) {
      if (Platform.OS === 'web') {
        alert('Для этой техники пока нет интерактивных шагов');
      } else {
        Alert.alert('Информация', 'Для этой техники пока нет интерактивных шагов');
      }
      return;
    }
    
    setIsSessionActive(true);
    setCurrentStep(0);
    setSessionTimer(0);
    
    // Здесь можно добавить таймер сессии
  }, [selectedTechnique]);

  const handleNextStep = useCallback(() => {
    if (!selectedTechnique?.steps) return;
    
    if (currentStep < selectedTechnique.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSessionActive(false);
      if (Platform.OS === 'web') {
        alert('🎉 Упражнение завершено! Как вы себя чувствуете?');
      } else {
        Alert.alert('Поздравляем!', '🎉 Упражнение завершено! Как вы себя чувствуете?');
      }
    }
  }, [selectedTechnique, currentStep]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'НЛП Базовые': return '#FF9800';
      case 'НЛП Продвинутые': return '#FF5722';
      case 'Работа с убеждениями': return '#E91E63';
      case 'НЛП Интегративные': return '#9C27B0';
      case 'КПТ': return '#2196F3';
      case 'Работа с травмой': return '#673AB7';
      case 'Интегративные методы': return '#4CAF50';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="self-improvement" size={32} color="white" />
          <Text style={styles.headerTitle}>Техники и упражнения</Text>
          <Text style={styles.headerSubtitle}>
            {allTechniques.length} проверенных методов восстановления • Расширенная библиотека НЛП
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, fadeInAnimatedStyle]}>
        {/* Статистика */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{allTechniques.length}</Text>
            <Text style={styles.statLabel}>Техник</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{categories.length - 1}</Text>
            <Text style={styles.statLabel}>Категорий</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(allTechniques.reduce((sum, tech) => sum + tech.duration, 0) / allTechniques.length)}
            </Text>
            <Text style={styles.statLabel}>мин среднее</Text>
          </View>
        </View>

        {/* Фильтры по категориям */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Категории</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {categories.map((category) => {
                const categoryKey = `category-${category}`;
                return (
                  <MemoizedFilterChip
                    key={categoryKey}
                    label={category}
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                    color={getCategoryColor(category)}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Фильтры по сложности */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Уровень сложности</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {difficulties.map((difficulty) => {
                const difficultyColors: { [key: string]: string } = {
                  'Все': '#666',
                  'beginner': '#4CAF50',
                  'intermediate': '#FF9800',
                  'advanced': '#FF5722',
                  'expert': '#9C27B0'
                };
                const difficultyKey = `difficulty-${difficulty}`;
                return (
                  <MemoizedFilterChip
                    key={difficultyKey}
                    label={difficulty === 'Все' ? 'Все' : 
                           difficulty === 'beginner' ? 'Начинающий' :
                           difficulty === 'intermediate' ? 'Средний' :
                           difficulty === 'advanced' ? 'Продвинутый' : 'Эксперт'}
                    selected={selectedDifficulty === difficulty}
                    onPress={() => setSelectedDifficulty(difficulty)}
                    color={difficultyColors[difficulty] || '#666'}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Список техник */}
        <View style={styles.techniquesContainer}>
          <Text style={styles.sectionTitle}>
            📚 Техники ({filteredTechniques.length})
          </Text>
          {filteredTechniques.length > 0 ? (
            <View style={styles.techniquesList}>
              {filteredTechniques.map((technique) => (
                <MemoizedTechniqueCard
                  key={technique.id}
                  technique={technique}
                  onPress={() => handleTechniquePress(technique)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={64} color="#CCC" />
              <Text style={styles.emptyStateText}>Техники не найдены</Text>
              <Text style={styles.emptyStateSubtext}>
                Попробуйте изменить фильтры
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Модальное окно с деталями техники */}
      <Modal
        visible={selectedTechnique !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedTechnique && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            {/* Шапка модального окна */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedTechnique(null)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedTechnique.name}
              </Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {!isSessionActive ? (
                <View>
                  {/* Информация о технике */}
                  <View style={styles.techniqueInfo}>
                    <View style={styles.techniqueBadges}>
                      <View style={[styles.categoryBadge, { backgroundColor: selectedTechnique.color }]}>
                        <Text style={styles.categoryText}>{selectedTechnique.category}</Text>
                      </View>
                      <View style={styles.durationBadge}>
                        <MaterialIcons name="schedule" size={16} color="#666" />
                        <Text style={styles.durationText}>{selectedTechnique.duration} мин</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.techniqueDescriptionFull}>
                      {selectedTechnique.description}
                    </Text>

                    {/* Преимущества */}
                    {selectedTechnique.benefits && selectedTechnique.benefits.length > 0 && (
                      <View style={styles.benefitsSection}>
                        <Text style={styles.sectionSubtitle}>✨ Преимущества:</Text>
                        {selectedTechnique.benefits.map((benefit, index) => (
                          <Text key={`benefit-${selectedTechnique.id}-${index}`} style={styles.benefitItem}>
                            • {benefit}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Предосторожности */}
                    {selectedTechnique.precautions && selectedTechnique.precautions.length > 0 && (
                      <View style={styles.warningsSection}>
                        <Text style={styles.sectionSubtitle}>⚠️ Предосторожности:</Text>
                        {selectedTechnique.precautions.map((precaution, index) => (
                          <Text key={`precaution-${selectedTechnique.id}-${index}`} style={styles.warningItem}>
                            • {precaution}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Противопоказания */}
                    {selectedTechnique.contraindications && selectedTechnique.contraindications.length > 0 && (
                      <View style={styles.contraindicationsSection}>
                        <Text style={styles.sectionSubtitle}>🚫 Противопоказания:</Text>
                        {selectedTechnique.contraindications.map((contraindication, index) => (
                          <Text key={`contraindication-${selectedTechnique.id}-${index}`} style={styles.contraindicationItem}>
                            • {contraindication}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Кнопка начала сессии */}
                  <TouchableOpacity
                    style={styles.startSessionButton}
                    onPress={handleStartSession}
                  >
                    <LinearGradient
                      colors={[selectedTechnique.color, selectedTechnique.color + '80']}
                      style={styles.startSessionGradient}
                    >
                      <MaterialIcons name="play-arrow" size={24} color="white" />
                      <Text style={styles.startSessionText}>Начать упражнение</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Активная сессия */}
                  <View style={styles.sessionContainer}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionStep}>
                        Шаг {currentStep + 1} из {selectedTechnique.steps?.length || 0}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setIsSessionActive(false)}
                        style={styles.exitSessionButton}
                      >
                        <MaterialIcons name="exit-to-app" size={20} color="#FF6B6B" />
                        <Text style={styles.exitSessionText}>Выйти</Text>
                      </TouchableOpacity>
                    </View>

                    {selectedTechnique.steps && selectedTechnique.steps[currentStep] && (
                      <View style={styles.currentStepContainer}>
                        <Text style={styles.stepTitle}>
                          {selectedTechnique.steps[currentStep].title}
                        </Text>
                        <Text style={styles.stepInstruction}>
                          {selectedTechnique.steps[currentStep].instruction}
                        </Text>
                        
                        {selectedTechnique.steps[currentStep].duration && (
                          <View style={styles.stepDuration}>
                            <MaterialIcons name="timer" size={16} color="#666" />
                            <Text style={styles.stepDurationText}>
                              Рекомендуемое время: {selectedTechnique.steps[currentStep].duration} мин
                            </Text>
                          </View>
                        )}

                        {selectedTechnique.steps[currentStep].tips && (
                          <View style={styles.tipsSection}>
                            <Text style={styles.tipsTitle}>💡 Советы:</Text>
                            {selectedTechnique.steps[currentStep].tips.map((tip: string, index: number) => (
                              <Text key={`tip-${selectedTechnique.id}-${currentStep}-${index}`} style={styles.tipItem}>• {tip}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    {/* Навигация по шагам */}
                    <View style={styles.stepNavigation}>
                      <TouchableOpacity
                        style={[styles.navButton, currentStep === 0 && styles.disabledButton]}
                        onPress={handlePreviousStep}
                        disabled={currentStep === 0}
                      >
                        <MaterialIcons name="chevron-left" size={24} color={currentStep === 0 ? '#CCC' : '#666'} />
                        <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>
                          Назад
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.navButton}
                        onPress={handleNextStep}
                      >
                        <Text style={styles.navButtonText}>
                          {currentStep === (selectedTechnique.steps?.length || 0) - 1 ? 'Завершить' : 'Далее'}
                        </Text>
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    padding: 20,
    alignItems: 'center'
  },
  headerContent: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4
  },
  content: {
    padding: 20
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800'
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  filtersSection: {
    marginBottom: 20
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedChip: {
    borderColor: 'rgba(255,255,255,0.3)'
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  selectedChipText: {
    color: 'white'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 16
  },
  techniquesContainer: {
    marginBottom: 20
  },
  techniquesList: {
    gap: 12
  },
  techniqueCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  techniqueContent: {
    padding: 16
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  difficultyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold'
  },
  techniqueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  techniqueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  emptyState: {
    alignItems: 'center',
    padding: 40
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600'
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  closeButton: {
    padding: 8,
    marginRight: 12
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  modalContent: {
    flex: 1
  },
  techniqueInfo: {
    padding: 20
  },
  techniqueBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4
  },
  techniqueDescriptionFull: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  benefitsSection: {
    marginBottom: 20
  },
  benefitItem: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
    lineHeight: 20
  },
  warningsSection: {
    marginBottom: 20
  },
  warningItem: {
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 4,
    lineHeight: 20
  },
  contraindicationsSection: {
    marginBottom: 20
  },
  contraindicationItem: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 4,
    lineHeight: 20
  },
  startSessionButton: {
    margin: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  startSessionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    gap: 8
  },
  startSessionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  sessionContainer: {
    padding: 20
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  sessionStep: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800'
  },
  exitSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  exitSessionText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600'
  },
  currentStepContainer: {
    marginBottom: 30
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  stepInstruction: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16
  },
  stepDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6
  },
  stepDurationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  tipsSection: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50'
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
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
    backgroundColor: '#F8F8F8'
  },
  navButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600'
  },
  disabledText: {
    color: '#CCC'
  }
});
