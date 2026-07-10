import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QuizQuestion } from '../services/articlesDatabase';
import * as Haptics from 'expo-haptics';

interface ArticleQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export const ArticleQuiz: React.FC<ArticleQuizProps> = ({ questions, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionPress = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);

    const isCorrect = index === questions[currentStep].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(s => s + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (showResult) {
    return (
      <View style={styles.resultContainer}>
        <MaterialIcons
          name={score === questions.length ? "emoji-events" : "assignment-turned-in"}
          size={64}
          color="#2E7D4A"
        />
        <Text style={styles.resultTitle}>Квиз завершен!</Text>
        <Text style={styles.resultScore}>Ваш результат: {score} из {questions.length}</Text>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => onComplete(score)}
        >
          <Text style={styles.finishButtonText}>Вернуться к статье</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>Вопрос {currentStep + 1} из {questions.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentStep + 1) / questions.length) * 100}%` }]} />
        </View>
      </View>

      <Text style={styles.questionText}>{question.question}</Text>

      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === question.correctAnswer;
          const showCorrect = selectedOption !== null && isCorrect;
          const showWrong = isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                showCorrect && styles.correctOption,
                showWrong && styles.wrongOption,
              ]}
              onPress={() => handleOptionPress(index)}
              disabled={selectedOption !== null}
            >
              <Text style={[
                styles.optionText,
                (showCorrect || showWrong) && styles.selectedOptionText
              ]}>{option}</Text>
              {showCorrect && <MaterialIcons name="check-circle" size={20} color="white" />}
              {showWrong && <MaterialIcons name="cancel" size={20} color="white" />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  stepText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D4A',
    borderRadius: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
    marginRight: 10,
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  resultContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 20,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginTop: 20,
  },
  resultScore: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 30,
  },
  finishButton: {
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  finishButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
