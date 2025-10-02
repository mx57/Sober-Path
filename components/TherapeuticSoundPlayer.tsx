import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TherapeuticSoundPlayer({ sound, session, onClose }: {
  sound?: any;
  session?: any;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);

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

  const item = sound || session;
  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.error}>Контент не найден</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const togglePlayback = () => {
    if (isPlaying) {
      // Логика остановки
      setIsPlaying(false);
      showWebAlert('Остановлено', `Воспроизведение остановлено: ${item.name}`);
    } else {
      // Логика воспроизведения
      setIsPlaying(true);
      showWebAlert('Воспроизведение', `Начато воспроизведение: ${item.name || item.title}`);
    }
  };

  const adjustVolume = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="arrow-back" size={24} color="#2E7D4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Аудио плеер</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Cover Art */}
        <View style={styles.coverContainer}>
          <View style={[styles.cover, { 
            backgroundColor: sound ? '#E8F5E8' : '#F3E5F5' 
          }]}>
            <MaterialIcons 
              name={sound ? "nature" : "psychology"} 
              size={80} 
              color={sound ? "#2E7D4A" : "#6A1B9A"} 
            />
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{item.name || item.title}</Text>
          <Text style={styles.trackDescription}>{item.description}</Text>
          {item.benefits && (
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Преимущества:</Text>
              {item.benefits.slice(0, 3).map((benefit: string, index: number) => (
                <Text key={index} style={styles.benefit}>• {benefit}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentTime / (item.duration * 60)) * 100}%` }]} />
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</Text>
            <Text style={styles.timeText}>{Math.floor(item.duration)}:{((item.duration % 1) * 60).toFixed(0).padStart(2, '0')}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <MaterialIcons name="shuffle" size={28} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <MaterialIcons name="skip-previous" size={32} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            <MaterialIcons 
              name={isPlaying ? "pause" : "play-arrow"} 
              size={48} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <MaterialIcons name="skip-next" size={32} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <MaterialIcons name="repeat" size={28} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Volume Control */}
        <View style={styles.volumeContainer}>
          <TouchableOpacity onPress={() => adjustVolume(-0.1)}>
            <MaterialIcons name="volume-down" size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.volumeSlider}>
            <View style={styles.volumeTrack}>
              <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
            </View>
          </View>
          
          <TouchableOpacity onPress={() => adjustVolume(0.1)}>
            <MaterialIcons name="volume-up" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Additional Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option}>
            <MaterialIcons name="timer" size={24} color="#2E7D4A" />
            <Text style={styles.optionText}>Таймер сна</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option}>
            <MaterialIcons name="favorite-border" size={24} color="#2E7D4A" />
            <Text style={styles.optionText}>В избранное</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option}>
            <MaterialIcons name="share" size={24} color="#2E7D4A" />
            <Text style={styles.optionText}>Поделиться</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions for sessions */}
        {session && session.script && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Руководство по сеансу</Text>
            <Text style={styles.instructionsText}>
              Найдите удобное место, закройте глаза и следуйте голосовым инструкциям. 
              Не слушайте во время вождения или работы с механизмами.
            </Text>
          </View>
        )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  content: {
    padding: 20,
    alignItems: 'center'
  },
  coverContainer: {
    marginBottom: 30
  },
  cover: {
    width: 250,
    height: 250,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  trackInfo: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center'
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A',
    textAlign: 'center',
    marginBottom: 8
  },
  trackDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8
  },
  benefit: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D4A',
    borderRadius: 3
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  timeText: {
    fontSize: 14,
    color: '#666'
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20
  },
  controlButton: {
    padding: 10
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E7D4A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    gap: 15
  },
  volumeSlider: {
    flex: 1
  },
  volumeTrack: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#2E7D4A',
    borderRadius: 3
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30
  },
  option: {
    alignItems: 'center',
    gap: 8
  },
  optionText: {
    fontSize: 12,
    color: '#2E7D4A',
    fontWeight: '500'
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8
  },
  instructionsText: {
    fontSize: 14,
    color: '#F57C00',
    lineHeight: 20
  },
  error: {
    fontSize: 18,
    color: '#FF6B6B',
    textAlign: 'center',
    margin: 20
  },
  closeButton: {
    backgroundColor: '#2E7D4A',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center'
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});