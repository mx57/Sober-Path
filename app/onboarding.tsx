import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecovery } from '../hooks/useRecovery';

const predefinedMotivations = [
  'Улучшить здоровье',
  'Укрепить отношения',
  'Сэкономить деньги', 
  'Лучше выглядеть',
  'Быть примером для детей',
  'Повысить продуктивность',
  'Избежать проблем',
  'Обрести контроль'
];

export default function OnboardingPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { initializeProfile } = useRecovery();
  
  const [step, setStep] = useState(1);
  const [selectedMotivations, setSelectedMotivations] = useState<string[]>([]);
  const [customMotivation, setCustomMotivation] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const toggleMotivation = (motivation: string) => {
    setSelectedMotivations(prev => 
      prev.includes(motivation)
        ? prev.filter(m => m !== motivation)
        : [...prev, motivation]
    );
  };

  const addCustomMotivation = () => {
    if (customMotivation.trim() && !selectedMotivations.includes(customMotivation.trim())) {
      setSelectedMotivations(prev => [...prev, customMotivation.trim()]);
      setCustomMotivation('');
    }
  };

  const handleComplete = async () => {
    if (selectedMotivations.length === 0) return;
    
    await initializeProfile(startDate, selectedMotivations);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Настройка профиля</Text>
        <Text style={styles.step}>Шаг {step} из 2</Text>
      </View>

      <ScrollView style={styles.content}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <MaterialIcons name="event" size={60} color="#2E7D4A" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Когда вы начали свой путь?</Text>
            <Text style={styles.stepDescription}>
              Укажите дату, когда вы последний раз употребляли алкоголь
            </Text>

            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Дата начала трезвости:</Text>
              <TextInput
                style={styles.dateInput}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <TouchableOpacity 
              style={styles.nextButton}
              onPress={() => setStep(2)}
            >
              <Text style={styles.nextButtonText}>Далее</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <MaterialIcons name="star" size={60} color="#2E7D4A" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Что вас мотивирует?</Text>
            <Text style={styles.stepDescription}>
              Выберите причины, по которым вы хотите бросить пить. Это поможет в трудные моменты.
            </Text>

            <View style={styles.motivationsGrid}>
              {predefinedMotivations.map((motivation) => (
                <TouchableOpacity
                  key={motivation}
                  style={[
                    styles.motivationChip,
                    selectedMotivations.includes(motivation) && styles.selectedMotivation
                  ]}
                  onPress={() => toggleMotivation(motivation)}
                >
                  <Text style={[
                    styles.motivationText,
                    selectedMotivations.includes(motivation) && styles.selectedMotivationText
                  ]}>
                    {motivation}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customMotivationContainer}>
              <Text style={styles.customLabel}>Добавить свою причину:</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  value={customMotivation}
                  onChangeText={setCustomMotivation}
                  placeholder="Введите вашу мотивацию"
                  onSubmitEditing={addCustomMotivation}
                />
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={addCustomMotivation}
                >
                  <MaterialIcons name="add" size={24} color="#2E7D4A" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setStep(1)}
              >
                <MaterialIcons name="arrow-back" size={20} color="#2E7D4A" />
                <Text style={styles.backButtonText}>Назад</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.completeButton,
                  selectedMotivations.length === 0 && styles.disabledButton
                ]}
                onPress={handleComplete}
                disabled={selectedMotivations.length === 0}
              >
                <Text style={[
                  styles.completeButtonText,
                  selectedMotivations.length === 0 && styles.disabledButtonText
                ]}>
                  Завершить
                </Text>
                <MaterialIcons 
                  name="check" 
                  size={20} 
                  color={selectedMotivations.length === 0 ? '#CCC' : 'white'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  step: {
    fontSize: 16,
    color: '#666'
  },
  content: {
    flex: 1
  },
  stepContainer: {
    padding: 20,
    alignItems: 'center'
  },
  stepIcon: {
    marginBottom: 20
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D4A',
    textAlign: 'center',
    marginBottom: 10
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30
  },
  dateContainer: {
    width: '100%',
    marginBottom: 40
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlign: 'center'
  },
  motivationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
    justifyContent: 'center'
  },
  motivationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    backgroundColor: 'white'
  },
  selectedMotivation: {
    backgroundColor: '#2E7D4A'
  },
  motivationText: {
    fontSize: 14,
    color: '#2E7D4A',
    fontWeight: '500'
  },
  selectedMotivationText: {
    color: 'white'
  },
  customMotivationContainer: {
    width: '100%',
    marginBottom: 40
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 10
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  addButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    borderRadius: 8,
    backgroundColor: 'white'
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 15
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E7D4A',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    backgroundColor: 'white',
    gap: 8
  },
  backButtonText: {
    color: '#2E7D4A',
    fontSize: 16,
    fontWeight: 'bold'
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D4A',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8
  },
  disabledButton: {
    backgroundColor: '#E0E0E0'
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  disabledButtonText: {
    color: '#CCC'
  }
});