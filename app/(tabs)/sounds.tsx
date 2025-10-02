
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generatedSounds, hypnotherapySessions, audioEngine, GeneratedSound, HypnotherapySession } from '../../services/audioService';
import TherapeuticSoundPlayer from '../../components/TherapeuticSoundPlayer';

export default function SoundsPage() {
  const insets = useSafeAreaInsets();
  const [selectedSound, setSelectedSound] = useState<GeneratedSound | null>(null);
  const [selectedSession, setSelectedSession] = useState<HypnotherapySession | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  useEffect(() => {
    // Инициализация аудио движка
    audioEngine.initialize().catch(console.error);
  }, []);

  const categoryIcons: Record<string, string> = {
    nature: 'nature',
    binaural: 'graphic-eq',
    therapeutic: 'volume-up',
    solfeggio: 'radio'
  };

  const categoryNames: Record<string, string> = {
    nature: 'Природа',
    binaural: 'Бинауральные биты',
    therapeutic: 'Терапевтические',
    solfeggio: 'Сольфеджио'
  };

  const sessionCategoryIcons: Record<string, string> = {
    addiction: 'healing',
    anxiety: 'self-improvement',
    confidence: 'trending-up',
    sleep: 'bedtime',
    stress: 'spa',
    trauma: 'psychology'
  };

  const sessionCategoryNames: Record<string, string> = {
    addiction: 'Преодоление зависимости',
    anxiety: 'Снижение тревожности', 
    confidence: 'Уверенность',
    sleep: 'Здоровый сон',
    stress: 'Антистресс',
    trauma: 'Работа с травмами'
  };

  const levelColors = {
    beginner: '#4CAF50',
    intermediate: '#FF9800',
    advanced: '#F44336'
  };

  const categories = ['all', 'nature', 'binaural', 'therapeutic', 'solfeggio'];
  const filteredSounds = activeCategory === 'all' 
    ? generatedSounds 
    : generatedSounds.filter(s => s.category === activeCategory);

  const playQuickSound = async (sound: GeneratedSound) => {
    if (currentlyPlaying === sound.id) {
      audioEngine.stopSound(sound.id);
      setCurrentlyPlaying(null);
      return;
    }

    if (currentlyPlaying) {
      audioEngine.stopSound(currentlyPlaying);
    }

    setIsLoading(sound.id);
    
    try {
      await audioEngine.playSound(sound.id, true, 0.6);
      setCurrentlyPlaying(sound.id);
      showWebAlert('Воспроизведение', `Начато воспроизведение: ${sound.name}`);
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось воспроизвести звук. Попробуйте снова.');
      console.error('Error playing sound:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const openFullPlayer = (sound: GeneratedSound) => {
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

  const stopAllSounds = () => {
    audioEngine.stopAll();
    setCurrentlyPlaying(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Терапевтические звуки</Text>
          {currentlyPlaying && (
            <TouchableOpacity style={styles.stopAllButton} onPress={stopAllSounds}>
              <MaterialIcons name="stop" size={20} color="white" />
              <Text style={styles.stopAllText}>Стоп</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          Встроенные звуки и терапевтические частоты для восстановления
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Информационная карточка */}
        <View style={styles.infoCard}>
          <MaterialIcons name="headphones" size={24} color="#2E7D4A" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Рекомендации по использованию</Text>
            <Text style={styles.infoDescription}>
              🎧 Используйте наушники для максимального эффекта
              {'\n'}🔇 Найдите тихое место для сеанса
              {'\n'}⏰ Рекомендуемое время: 10-60 минут
            </Text>
          </View>
        </View>

        {/* Фильтр категорий */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, activeCategory === category && styles.activeCategoryButton]}
              onPress={() => setActiveCategory(category)}
            >
              <MaterialIcons 
                name={category === 'all' ? 'apps' : categoryIcons[category] as any} 
                size={20} 
                color={activeCategory === category ? 'white' : '#2E7D4A'} 
              />
              <Text style={[
                styles.categoryButtonText,
                activeCategory === category && styles.activeCategoryButtonText
              ]}>
                {category === 'all' ? 'Все' : categoryNames[category]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Генерируемые звуки */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Встроенные терапевтические звуки</Text>
          <Text style={styles.sectionDescription}>
            Все звуки генерируются в реальном времени без необходимости загрузки
          </Text>
          
          {filteredSounds.map((sound) => (
            <View key={sound.id} style={styles.soundCard}>
              <View style={styles.soundHeader}>
                <View style={[styles.soundIcon, { 
                  backgroundColor: sound.category === 'nature' ? '#4CAF50' : 
                                 sound.category === 'binaural' ? '#2196F3' :
                                 sound.category === 'solfeggio' ? '#9C27B0' : '#FF9800' 
                }]}>
                  <MaterialIcons 
                    name={categoryIcons[sound.category] as any} 
                    size={24} 
                    color="white" 
                  />
                </View>
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

              {/* Преимущества */}
              <View style={styles.benefitsContainer}>
                {sound.benefits.slice(0, 3).map((benefit, index) => (
                  <View key={index} style={styles.benefitTag}>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              {/* Кнопки управления */}
              <View style={styles.soundActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.quickPlayButton]}
                  onPress={() => playQuickSound(sound)}
                  disabled={isLoading === sound.id}
                >
                  {isLoading === sound.id ? (
                    <>
                      <MaterialIcons name="hourglass-empty" size={18} color="white" />
                      <Text style={styles.actionButtonText}>Загрузка...</Text>
                    </>
                  ) : currentlyPlaying === sound.id ? (
                    <>
                      <MaterialIcons name="stop" size={18} color="white" />
                      <Text style={styles.actionButtonText}>Остановить</Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="play-arrow" size={18} color="white" />
                      <Text style={styles.actionButtonText}>Быстрый старт</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.fullPlayerButton]}
                  onPress={() => openFullPlayer(sound)}
                >
                  <MaterialIcons name="tune" size={18} color="white" />
                  <Text style={styles.actionButtonText}>Настройки</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Гипнотерапия */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Управляемые сеансы гипнотерапии</Text>
          <Text style={styles.sectionDescription}>
            Профессиональные голосовые сессии с фоновыми терапевтическими звуками
          </Text>
          
          {hypnotherapySessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionIcon}>
                  <MaterialIcons 
                    name={sessionCategoryIcons[session.category] as any} 
                    size={28} 
                    color="#6A1B9A" 
                  />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <Text style={styles.sessionCategory}>
                    {sessionCategoryNames[session.category]}
                  </Text>
                  <View style={styles.sessionMeta}>
                    <MaterialIcons name="schedule" size={16} color="#999" />
                    <Text style={styles.metaText}>{session.duration} мин</Text>
                    <View style={[
                      styles.levelBadge,
                      { backgroundColor: levelColors[session.difficulty] }
                    ]}>
                      <Text style={styles.levelText}>
                        {session.difficulty === 'beginner' && 'Начальный'}
                        {session.difficulty === 'intermediate' && 'Средний'}
                        {session.difficulty === 'advanced' && 'Продвинутый'}
                      </Text>
                    </View>
                  </View>
                </View>{/* Closing tag added here */}
              </View>

              <Text style={styles.sessionDescription}>{session.description}</Text>

              {/* Преимущества сеанса */}
              <View style={styles.benefitsContainer}>
                {session.benefits.slice(0, 3).map((benefit, index) => (
                  <View key={index} style={[styles.benefitTag, styles.sessionBenefitTag]}>
                    <Text style={styles.sessionBenefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              {/* Предупреждение */}
              <View style={styles.warningBox}>
                <MaterialIcons name="info" size={20} color="#FF9800" />
                <Text style={styles.warningText}>
                  ⚠️ Не слушайте во время вождения или работы с механизмами
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
          <Text style={styles.tipsTitle}>💡 Советы по эффективному использованию</Text>
          
          <View style={styles.tipItem}>
            <MaterialIcons name="schedule" size={20} color="#2E7D4A" />
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Лучшее время:</Text> утром после пробуждения или перед сном
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <MaterialIcons name="volume-up" size={20} color="#2E7D4A" />
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Громкость:</Text> комфортная, не слишком тихо и не громко
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <MaterialIcons name="smartphone" size={20} color="#2E7D4A" />
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Подготовка:</Text> режим "Не беспокоить", удобная поза
            </Text>
          </View>

          <View style={styles.tipItem}>
            <MaterialIcons name="favorite" size={20} color="#2E7D4A" />
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Регулярность:</Text> ежедневные сеансы дают лучший эффект
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
          <TherapeuticSoundPlayer
            sound={selectedSound || undefined}
            session={selectedSession || undefined}
            onClose={closePlayer}
          />
        </View>
      </Modal>

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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  stopAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4
  },
  stopAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
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
    marginBottom: 8
  },
  infoDescription: {
    fontSize: 14,
    color: '#4A6741',
    lineHeight: 20
  },
  categoriesContainer: {
    marginVertical: 10
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
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
    paddingVertical: 20,
    marginBottom: 15
  },
  soundHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 15
  },
  soundIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
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
    marginBottom: 12
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 15
  },
  benefitTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  benefitText: {
    fontSize: 12,
    color: '#2E7D4A',
    fontWeight: '500'
  },
  soundActions: {
    flexDirection: 'row',
    gap: 10
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6
  },
  quickPlayButton: {
    backgroundColor: '#2E7D4A',
    flex: 2
  },
  fullPlayerButton: {
    backgroundColor: '#666',
    flex: 1
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  sessionCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 20,
    marginBottom: 15
  },
  sessionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 15
  },
  sessionIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#F3E5F5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
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
    marginBottom: 12
  },
  sessionBenefitTag: {
    backgroundColor: '#F3E5F5'
  },
  sessionBenefitText: {
    color: '#6A1B9A',
    fontSize: 12,
    fontWeight: '500'
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8
  },
  warningText: {
    fontSize: 13,
    color: '#F57C00',
    flex: 1,
    fontWeight: '500'
  },
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    gap: 8
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
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20
  },
  tipBold: {
    fontWeight: 'bold'
  },
  playerModal: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  }
});
