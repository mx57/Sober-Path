import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AudioService, RelaxingSound, HypnotherapySession } from '../services/audioService';

interface AudioPlayerProps {
  sound?: RelaxingSound;
  session?: HypnotherapySession;
  onClose: () => void;
}

export default function AudioPlayer({ sound, session, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(sound?.duration || session?.duration || 0);

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

  const togglePlayPause = async () => {
    if (isPlaying) {
      await AudioService.pauseAudio();
    } else {
      if (sound) {
        await AudioService.playRelaxingSound(sound.id);
      }
      // Для гипнотерапии здесь будет отдельная логика
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = async () => {
    await AudioService.stopAudio();
    setIsPlaying(false);
    setCurrentTime(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const title = sound?.name || session?.title || 'Аудио';
  const description = sound?.description || session?.description || '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

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

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
          <MaterialIcons 
            name={isPlaying ? "pause" : "play-arrow"} 
            size={40} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
          <MaterialIcons name="stop" size={32} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {sound?.category === 'binaural' && (
        <View style={styles.frequencyInfo}>
          <MaterialIcons name="graphic-eq" size={20} color="#2E7D4A" />
          <Text style={styles.frequencyText}>{sound.frequency}</Text>
        </View>
      )}

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Эффект:</Text>
        <Text style={styles.benefitsText}>
          {sound?.category === 'nature' && 'Естественное расслабление и снижение стресса'}
          {sound?.category === 'binaural' && 'Синхронизация мозговых волн для глубокого воздействия'}
          {sound?.category === 'white_noise' && 'Маскировка отвлекающих звуков'}
          {sound?.category === 'meditation' && 'Углубление медитативного состояния'}
          {session && 'Глубокое подсознательное воздействие для преодоления зависимости'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
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
    justifyContent: 'center',
    marginHorizontal: 10
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginBottom: 20
  },
  controlButton: {
    backgroundColor: '#2E7D4A',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stopButton: {
    backgroundColor: '#FFE6E6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
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
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  benefitsText: {
    fontSize: 13,
    color: '#4A6741',
    lineHeight: 18
  }
});