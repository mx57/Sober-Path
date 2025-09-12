import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TherapeuticSound, therapeuticSounds } from '../services/advancedPsychologyService';

const { width: screenWidth } = Dimensions.get('window');

interface TherapeuticSoundPlayerProps {
  visible: boolean;
  onClose: () => void;
  sound?: TherapeuticSound;
}

export default function TherapeuticSoundPlayer({ visible, onClose, sound }: TherapeuticSoundPlayerProps) {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(600); // 10 минут по умолчанию
  
  // Анимированные значения
  const waveAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const colorAnimation = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      waveAnimation.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.sin }),
        -1,
        true
      );
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      colorAnimation.value = withRepeat(
        withTiming(1, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      waveAnimation.value = withTiming(0);
      pulseAnimation.value = withTiming(0);
      colorAnimation.value = withTiming(0);
    }
  }, [isPlaying]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying && currentTime < sessionTime) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= sessionTime - 1) {
            setIsPlaying(false);
            return sessionTime;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTime, sessionTime]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const adjustSessionTime = (minutes: number) => {
    setSessionTime(minutes * 60);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFrequencyColor = (frequency: string) => {
    if (frequency.includes('174')) return '#FF0000';
    if (frequency.includes('285')) return '#FF8000';
    if (frequency.includes('396')) return '#FF0000';
    if (frequency.includes('417')) return '#FF8000';
    if (frequency.includes('528')) return '#00FF00';
    if (frequency.includes('639')) return '#0080FF';
    if (frequency.includes('741')) return '#0000FF';
    if (frequency.includes('852')) return '#8000FF';
    if (frequency.includes('963')) return '#FFFFFF';
    return '#2E7D4A';
  };

  // Анимированные стили
  const waveStyle = useAnimatedStyle(() => {
    const scale = interpolate(waveAnimation.value, [0, 1], [1, 1.5]);
    const opacity = interpolate(waveAnimation.value, [0, 1], [0.3, 0.8]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.2]);
    
    return {
      transform: [{ scale }],
    };
  });

  const colorStyle = useAnimatedStyle(() => {
    if (!sound) return {};
    
    const color = getFrequencyColor(sound.frequency);
    return {
      backgroundColor: color,
      opacity: interpolate(colorAnimation.value, [0, 1], [0.2, 0.6]),
    };
  });

  if (!sound) return null;

  const progress = sessionTime > 0 ? (currentTime / sessionTime) * 100 : 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{sound.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Визуализация */}
          <View style={styles.visualizationContainer}>
            <Animated.View style={[styles.backgroundWave, colorStyle]} />
            
            <Animated.View style={[styles.centerCircle, waveStyle]}>
              <Animated.View style={[styles.innerCircle, pulseStyle]}>
                <Text style={styles.frequencyText}>{sound.frequency}</Text>
              </Animated.View>
            </Animated.View>

            {/* Концентрические круги */}
            {[1, 2, 3, 4].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.concentricCircle,
                  {
                    width: 100 + (index * 40),
                    height: 100 + (index * 40),
                    borderRadius: (100 + (index * 40)) / 2,
                  },
                  waveStyle
                ]}
              />
            ))}
          </View>

          {/* Информация о звуке */}
          <View style={styles.infoSection}>
            <Text style={styles.soundType}>{sound.type.toUpperCase()}</Text>
            <Text style={styles.purpose}>{sound.purpose}</Text>
            <Text style={styles.instructions}>{sound.instructions}</Text>
          </View>

          {/* Прогресс сессии */}
          <View style={styles.progressSection}>
            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(sessionTime)}
            </Text>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            
            <Text style={styles.progressText}>
              {Math.round(progress)}% завершено
            </Text>
          </View>

          {/* Настройки времени */}
          <View style={styles.timeSettings}>
            <Text style={styles.settingsTitle}>Длительность сессии:</Text>
            <View style={styles.timeButtons}>
              {[5, 10, 15, 20, 30].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.timeButton,
                    sessionTime === minutes * 60 && styles.activeTimeButton
                  ]}
                  onPress={() => adjustSessionTime(minutes)}
                >
                  <Text style={[
                    styles.timeButtonText,
                    sessionTime === minutes * 60 && styles.activeTimeButtonText
                  ]}>
                    {minutes}м
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Элементы управления */}
          <View style={styles.controlsSection}>
            <TouchableOpacity 
              style={[styles.playButton, isPlaying && styles.pauseButton]}
              onPress={togglePlayback}
            >
              <MaterialIcons 
                name={isPlaying ? "pause" : "play-arrow"} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={resetSession}>
              <MaterialIcons name="refresh" size={24} color="#666" />
              <Text style={styles.resetButtonText}>Сначала</Text>
            </TouchableOpacity>
          </View>

          {/* Инструкции по медитации */}
          <View style={styles.meditationGuide}>
            <Text style={styles.guideTitle}>Инструкции для медитации:</Text>
            <View style={styles.guideSteps}>
              <Text style={styles.guideStep}>1. Сядьте или лягте удобно</Text>
              <Text style={styles.guideStep}>2. Используйте наушники для лучшего эффекта</Text>
              <Text style={styles.guideStep}>3. Закройте глаза и расслабьтесь</Text>
              <Text style={styles.guideStep}>4. Сосредоточьтесь на звуке и дыхании</Text>
              <Text style={styles.guideStep}>5. Позвольте частоте воздействовать на вас</Text>
            </View>
          </View>

          {/* Информация о типе частоты */}
          <View style={styles.frequencyInfo}>
            <Text style={styles.frequencyTitle}>О частоте {sound.frequency}:</Text>
            {sound.type === 'solfeggio' && (
              <Text style={styles.frequencyDescription}>
                Частоты Сольфеджио - древние священные тона, используемые для исцеления 
                и духовного развития. Каждая частота резонирует с определенными 
                энергетическими центрами и аспектами человеческого опыта.
              </Text>
            )}
            {sound.type === 'binaural' && (
              <Text style={styles.frequencyDescription}>
                Бинауральные ритмы создаются при воспроизведении двух слегка 
                различающихся частот в каждом ухе, заставляя мозг синхронизироваться 
                с разностной частотой.
              </Text>
            )}
            {sound.type === 'chakra' && (
              <Text style={styles.frequencyDescription}>
                Частоты чакр настроены на семь основных энергетических центров тела, 
                помогая сбалансировать и гармонизировать энергетическую систему.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginRight: 10
  },
  closeButton: {
    padding: 5
  },
  content: {
    padding: 20,
    gap: 25
  },
  visualizationContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  backgroundWave: {
    position: 'absolute',
    width: screenWidth - 40,
    height: 300,
    borderRadius: 20
  },
  centerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(46,125,74,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  },
  concentricCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  infoSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 15
  },
  soundType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8,
    letterSpacing: 1
  },
  purpose: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    lineHeight: 24
  },
  instructions: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20
  },
  progressSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center'
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D4A'
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)'
  },
  timeSettings: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 15
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center'
  },
  timeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  activeTimeButton: {
    backgroundColor: '#2E7D4A',
    borderColor: '#2E7D4A'
  },
  timeButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500'
  },
  activeTimeButtonText: {
    color: 'white'
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E7D4A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#2E7D4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  pauseButton: {
    backgroundColor: '#FF9800'
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 6
  },
  resetButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500'
  },
  meditationGuide: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 15
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15
  },
  guideSteps: {
    gap: 8
  },
  guideStep: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20
  },
  frequencyInfo: {
    backgroundColor: 'rgba(46,125,74,0.1)',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D4A'
  },
  frequencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  frequencyDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22
  }
});