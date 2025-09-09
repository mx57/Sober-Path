import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AudioService, RelaxingSound, HypnotherapySession } from '../services/audioService';

interface AdvancedAudioPlayerProps {
  sound?: RelaxingSound;
  session?: HypnotherapySession;
  onClose: () => void;
}

export default function AdvancedAudioPlayer({ sound, session, onClose }: AdvancedAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(sound?.duration || session?.duration || 0);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooped, setIsLooped] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimeLeft, setSleepTimeLeft] = useState(0);
  const [fadeInOut, setFadeInOut] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  useEffect(() => {
    let sleepInterval: ReturnType<typeof setInterval>;
    
    if (sleepTimer && sleepTimeLeft > 0) {
      sleepInterval = setInterval(() => {
        setSleepTimeLeft(prev => {
          if (prev <= 1) {
            handleSleepTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (sleepInterval) clearInterval(sleepInterval);
    };
  }, [sleepTimer, sleepTimeLeft]);

  const togglePlayPause = async () => {
    if (isPlaying) {
      await AudioService.pauseAudio();
    } else {
      if (sound) {
        await AudioService.playRelaxingSound(sound.id);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = async () => {
    await AudioService.stopAudio();
    setIsPlaying(false);
    setCurrentTime(0);
    setSleepTimer(null);
    setSleepTimeLeft(0);
    onClose();
  };

  const skipForward = () => {
    setCurrentTime(prev => Math.min(prev + 30, duration));
  };

  const skipBackward = () => {
    setCurrentTime(prev => Math.max(prev - 30, 0));
  };

  const adjustVolume = (delta: number) => {
    setVolume(prev => Math.max(0, Math.min(1, prev + delta)));
  };

  const adjustPlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    // Здесь будет интеграция с аудиосервисом для изменения скорости
  };

  const setSleepTimerMinutes = (minutes: number) => {
    setSleepTimer(minutes);
    setSleepTimeLeft(minutes * 60);
  };

  const handleSleepTimerComplete = async () => {
    if (fadeInOut) {
      // Постепенное затухание звука
      for (let v = volume; v >= 0; v -= 0.1) {
        setVolume(v);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    await AudioService.stopAudio();
    setIsPlaying(false);
    setSleepTimer(null);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const title = sound?.name || session?.title || 'Аудио';
  const description = sound?.description || session?.description || '';

  const sleepTimerOptions = [15, 30, 45, 60, 90, 120];
  const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                ]} 
              />
            </View>
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.skipButton} onPress={skipBackward}>
            <MaterialIcons name="replay-30" size={28} color="#2E7D4A" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <MaterialIcons 
              name={isPlaying ? "pause" : "play-arrow"} 
              size={48} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.skipButton} onPress={skipForward}>
            <MaterialIcons name="forward-30" size={28} color="#2E7D4A" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
          <MaterialIcons name="stop" size={24} color="#FF6B6B" />
          <Text style={styles.stopText}>Остановить</Text>
        </TouchableOpacity>

        {/* Volume Control */}
        <View style={styles.volumeContainer}>
          <MaterialIcons name="volume-down" size={20} color="#666" />
          <View style={styles.volumeSlider}>
            <TouchableOpacity onPress={() => adjustVolume(-0.1)}>
              <MaterialIcons name="remove" size={20} color="#2E7D4A" />
            </TouchableOpacity>
            <View style={styles.volumeBar}>
              <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
            </View>
            <TouchableOpacity onPress={() => adjustVolume(0.1)}>
              <MaterialIcons name="add" size={20} color="#2E7D4A" />
            </TouchableOpacity>
          </View>
          <MaterialIcons name="volume-up" size={20} color="#666" />
        </View>

        {/* Advanced Controls Toggle */}
        <TouchableOpacity 
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <MaterialIcons name="settings" size={20} color="#2E7D4A" />
          <Text style={styles.advancedText}>Дополнительные настройки</Text>
          <MaterialIcons 
            name={showAdvanced ? "expand-less" : "expand-more"} 
            size={20} 
            color="#2E7D4A" 
          />
        </TouchableOpacity>

        {/* Advanced Controls */}
        {showAdvanced && (
          <View style={styles.advancedControls}>
            {/* Playback Speed */}
            <View style={styles.controlSection}>
              <Text style={styles.controlLabel}>Скорость воспроизведения: {playbackRate}x</Text>
              <View style={styles.speedButtons}>
                {playbackRates.map(rate => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.speedButton,
                      playbackRate === rate && styles.activeSpeedButton
                    ]}
                    onPress={() => adjustPlaybackRate(rate)}
                  >
                    <Text style={[
                      styles.speedButtonText,
                      playbackRate === rate && styles.activeSpeedButtonText
                    ]}>
                      {rate}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Loop Control */}
            <View style={styles.controlSection}>
              <TouchableOpacity 
                style={styles.loopControl}
                onPress={() => setIsLooped(!isLooped)}
              >
                <MaterialIcons 
                  name={isLooped ? "repeat" : "repeat"} 
                  size={24} 
                  color={isLooped ? "#2E7D4A" : "#CCC"} 
                />
                <Text style={[styles.loopText, isLooped && styles.activeLoopText]}>
                  Повтор
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sleep Timer */}
            <View style={styles.controlSection}>
              <Text style={styles.controlLabel}>Таймер сна</Text>
              {sleepTimer && (
                <View style={styles.timerActive}>
                  <MaterialIcons name="timer" size={20} color="#2E7D4A" />
                  <Text style={styles.timerText}>
                    Остановка через: {formatTime(sleepTimeLeft)}
                  </Text>
                  <TouchableOpacity onPress={() => setSleepTimer(null)}>
                    <MaterialIcons name="close" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.timerButtons}>
                {sleepTimerOptions.map(minutes => (
                  <TouchableOpacity
                    key={minutes}
                    style={styles.timerButton}
                    onPress={() => setSleepTimerMinutes(minutes)}
                  >
                    <Text style={styles.timerButtonText}>{minutes}м</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Fade In/Out */}
            <View style={styles.controlSection}>
              <TouchableOpacity 
                style={styles.fadeControl}
                onPress={() => setFadeInOut(!fadeInOut)}
              >
                <MaterialIcons 
                  name="blur-on" 
                  size={24} 
                  color={fadeInOut ? "#2E7D4A" : "#CCC"} 
                />
                <Text style={[styles.fadeText, fadeInOut && styles.activeFadeText]}>
                  Плавное затухание
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Audio Info */}
        <View style={styles.infoContainer}>
          {sound?.frequency && (
            <View style={styles.frequencyInfo}>
              <MaterialIcons name="graphic-eq" size={20} color="#2E7D4A" />
              <Text style={styles.frequencyText}>{sound.frequency}</Text>
            </View>
          )}

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Терапевтический эффект:</Text>
            <Text style={styles.benefitsText}>
              {sound?.category === 'nature' && '• Естественное расслабление\n• Снижение уровня кортизола\n• Улучшение концентрации'}
              {sound?.category === 'binaural' && '• Синхронизация мозговых волн\n• Глубокая медитация\n• Повышение нейропластичности'}
              {sound?.category === 'frequencies' && '• Исцеление на клеточном уровне\n• Балансировка энергетических центров\n• Гармонизация вибраций'}
              {session && '• Перепрограммирование подсознания\n• Устранение ментальных блоков\n• Формирование новых нейронных связей'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  titleContainer: {
    flex: 1,
    marginRight: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  closeButton: {
    padding: 5
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 10
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40
  },
  progressBarContainer: {
    flex: 1,
    justifyContent: 'center'
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
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 30
  },
  skipButton: {
    padding: 15
  },
  playButton: {
    backgroundColor: '#2E7D4A',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE6E6',
    padding: 12,
    borderRadius: 25,
    marginBottom: 20,
    gap: 8
  },
  stopText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '500'
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10
  },
  volumeSlider: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden'
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#2E7D4A'
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 15,
    gap: 8
  },
  advancedText: {
    fontSize: 14,
    color: '#2E7D4A',
    fontWeight: '500'
  },
  advancedControls: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20
  },
  controlSection: {
    marginBottom: 20
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  activeSpeedButton: {
    backgroundColor: '#2E7D4A',
    borderColor: '#2E7D4A'
  },
  speedButtonText: {
    fontSize: 14,
    color: '#666'
  },
  activeSpeedButtonText: {
    color: 'white'
  },
  loopControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  loopText: {
    fontSize: 16,
    color: '#CCC'
  },
  activeLoopText: {
    color: '#2E7D4A',
    fontWeight: '500'
  },
  timerActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8
  },
  timerText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D4A',
    fontWeight: '500'
  },
  timerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  timerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  timerButtonText: {
    fontSize: 14,
    color: '#666'
  },
  fadeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  fadeText: {
    fontSize: 16,
    color: '#CCC'
  },
  activeFadeText: {
    color: '#2E7D4A',
    fontWeight: '500'
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10
  },
  frequencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    gap: 8
  },
  frequencyText: {
    fontSize: 14,
    color: '#2E7D4A',
    fontWeight: '500'
  },
  benefitsContainer: {
    marginBottom: 10
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8
  },
  benefitsText: {
    fontSize: 13,
    color: '#4A6741',
    lineHeight: 20
  }
});