import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { relaxingSounds, hypnotherapySessions, RelaxingSound, HypnotherapySession } from '../../services/audioService';
import AudioPlayer from '../../components/AudioPlayer';

export default function SoundsPage() {
  const insets = useSafeAreaInsets();
  const [selectedSound, setSelectedSound] = useState<RelaxingSound | null>(null);
  const [selectedSession, setSelectedSession] = useState<HypnotherapySession | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const categoryIcons: Record<string, string> = {
    nature: 'nature',
    binaural: 'graphic-eq',
    white_noise: 'volume-up',
    meditation: 'spa'
  };

  const categoryNames: Record<string, string> = {
    nature: 'Природа',
    binaural: 'Бинауральные биты',
    white_noise: 'Белый шум',
    meditation: 'Медитация'
  };

  const sessionCategoryIcons: Record<string, string> = {
    addiction: 'healing',
    anxiety: 'self-improvement',
    confidence: 'trending-up',
    sleep: 'bedtime'
  };

  const sessionCategoryNames: Record<string, string> = {
    addiction: 'Преодоление зависимости',
    anxiety: 'Снижение тревожности',
    confidence: 'Уверенность',
    sleep: 'Здоровый сон'
  };

  const levelColors = {
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#F44336'
  };

  const playSound = (sound: RelaxingSound) => {
    setSelectedSound(sound);
    setSelectedSession(null);
    setShowAudioPlayer(true);
  };

  const playSession = (session: HypnotherapySession) => {
    setSelectedSession(session);
    setSelectedSound(null);
    setShowAudioPlayer(true);
  };

  const closePlayer = () => {
    setShowAudioPlayer(false);
    setSelectedSound(null);
    setSelectedSession(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Аудиотерапия</Text>
        <Text style={styles.subtitle}>
          Расслабляющие звуки и гипнотерапия для восстановления
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <MaterialIcons name="headphones" size={24} color="#2E7D4A" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Рекомендации по использованию</Text>
            <Text style={styles.infoDescription}>
              Используйте наушники для максимального эффекта. 
              Найдите тихое место и уделите время только себе.
            </Text>
          </View>
        </View>

        {/* Расслабляющие звуки */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Расслабляющие звуки</Text>
          
          {relaxingSounds.map((sound) => (
            <View key={sound.id} style={styles.soundCard}>
              <View style={styles.soundHeader}>
                <MaterialIcons 
                  name={categoryIcons[sound.category] as any} 
                  size={32} 
                  color="#2E7D4A" 
                />
                <View style={styles.soundInfo}>
                  <Text style={styles.soundTitle}>{sound.name}</Text>
                  <Text style={styles.categoryLabel}>
                    {categoryNames[sound.category]}
                  </Text>
                  <View style={styles.soundMeta}>
                    <MaterialIcons name="schedule" size={16} color="#999" />
                    <Text style={styles.metaText}>
                      {Math.floor(sound.duration / 60)} мин
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.soundDescription}>{sound.description}</Text>

              {sound.frequency && (
                <View style={styles.frequencyBadge}>
                  <MaterialIcons name="waves" size={16} color="#2E7D4A" />
                  <Text style={styles.frequencyText}>{sound.frequency}</Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => playSound(sound)}
              >
                <MaterialIcons name="play-circle-filled" size={20} color="white" />
                <Text style={styles.playButtonText}>Воспроизвести</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Гипнотерапия */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сеансы гипнотерапии</Text>
          <Text style={styles.sectionDescription}>
            Профессиональные гипнотерапевтические сессии для работы с подсознанием
          </Text>
          
          {hypnotherapySessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <MaterialIcons 
                  name={sessionCategoryIcons[session.category] as any} 
                  size={32} 
                  color="#6A1B9A" 
                />
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <Text style={styles.sessionCategory}>
                    {sessionCategoryNames[session.category]}
                  </Text>
                  <View style={styles.sessionMeta}>
                    <MaterialIcons name="schedule" size={16} color="#999" />
                    <Text style={styles.metaText}>
                      {Math.floor(session.duration / 60)} мин
                    </Text>
                    <View style={[
                      styles.levelBadge,
                      { backgroundColor: levelColors[session.level] }
                    ]}>
                      <Text style={styles.levelText}>
                        {session.level === 'beginner' && 'Начальный'}
                        {session.level === 'intermediate' && 'Средний'}
                        {session.level === 'advanced' && 'Продвинутый'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.sessionDescription}>{session.description}</Text>

              <View style={styles.warningBox}>
                <MaterialIcons name="info" size={20} color="#FF9800" />
                <Text style={styles.warningText}>
                  Не слушайте во время вождения или работы с механизмами
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.sessionButton}
                onPress={() => playSession(session)}
              >
                <MaterialIcons name="psychology" size={20} color="white" />
                <Text style={styles.sessionButtonText}>Начать сеанс</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Советы по использованию */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Советы по эффективному использованию</Text>
          
          <View style={styles.tipItem}>
            <MaterialIcons name="schedule" size={20} color="#2E7D4A" />
            <Text style={styles.tipText}>
              Лучшее время: утром после пробуждения или перед сном
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <MaterialIcons name="volume-up" size={20} color="#2E7D4A" />
            <Text style={styles.tipText}>
              Установите комфортную громкость, не слишком тихо и не громко
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <MaterialIcons name="smartphone" size={20} color="#2E7D4A" />
            <Text style={styles.tipText}>
              Переведите телефон в режим "Не беспокоить"
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Audio Player Modal */}
      <Modal
        visible={showAudioPlayer}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePlayer}
      >
        <View style={[styles.playerModal, { paddingTop: insets.top }]}>
          <AudioPlayer
            sound={selectedSound || undefined}
            session={selectedSession || undefined}
            onClose={closePlayer}
          />
        </View>
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
  soundCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 15,
    marginBottom: 15
  },
  soundHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 15
  },
  soundInfo: {
    flex: 1
  },
  soundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  categoryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  soundMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 14,
    color: '#999'
  },
  soundDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 10,
    gap: 5
  },
  frequencyText: {
    fontSize: 12,
    color: '#0277BD',
    fontWeight: '500'
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  sessionCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 15,
    marginBottom: 15
  },
  sessionHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 15
  },
  sessionInfo: {
    flex: 1
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginBottom: 5
  },
  sessionCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  levelText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold'
  },
  sessionDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8
  },
  warningText: {
    fontSize: 12,
    color: '#F57F17',
    flex: 1
  },
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6
  },
  sessionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20
  },
  playerModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center'
  }
});