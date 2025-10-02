
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  runOnJS
} from 'react-native-reanimated';

// Ленивый импорт компонентов
const AdvancedAudioPlayer = React.lazy(() => import('../../components/AdvancedAudioPlayer'));

interface Sound {
  id: string;
  name: string;
  description: string;
  category: 'meditation' | 'nature' | 'binaural' | 'healing' | 'sleep';
  icon: string;
  color: string;
  frequency?: string;
  benefits: string[];
}

// Мемоизированные компоненты
const MemoizedSoundCard = React.memo(({ sound, onPlay }: {
  sound: Sound;
  onPlay: (sound: Sound) => void;
}) => {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  const handlePress = useCallback(() => {
    scaleValue.value = withSpring(0.96, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPlay)(sound);
    });
  }, [onPlay, sound, scaleValue]);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity style={styles.soundCard} onPress={handlePress}>
        <LinearGradient 
          colors={[sound.color, sound.color + '80']} 
          style={styles.soundGradient}
        >
          <View style={styles.soundHeader}>
            <MaterialIcons name={sound.icon as any} size={32} color="white" />
            <View style={styles.soundInfo}>
              <Text style={styles.soundName}>{sound.name}</Text>
              <Text style={styles.soundDescription}>{sound.description}</Text>
              {sound.frequency && (
                <Text style={styles.soundFrequency}>{sound.frequency}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.benefitsContainer}>
            {sound.benefits.slice(0, 2).map((benefit, index) => (
              <View key={index} style={styles.benefitTag}>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.playButton}>
            <MaterialIcons name="play-arrow" size={24} color={sound.color} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

function SoundsPage() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  // Анимации
  const headerOpacity = useSharedValue(0);
  const fadeValue = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    fadeValue.value = withTiming(1, { duration: 1000 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: (1 - headerOpacity.value) * 30 }]
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeValue.value
  }));

  // Мемоизированные данные
  const sounds = useMemo<Sound[]>(() => [
    {
      id: '1',
      name: 'Глубокая медитация',
      description: 'Погружение в состояние покоя',
      category: 'meditation',
      icon: 'self-improvement',
      color: '#6A1B9A',
      frequency: '7.83 Hz (Резонанс Шумана)',
      benefits: ['Снятие стресса', 'Глубокое расслабление', 'Ясность ума']
    },
    {
      id: '2',
      name: 'Шум океана',
      description: 'Успокаивающие звуки прибоя',
      category: 'nature',
      icon: 'waves',
      color: '#0277BD',
      benefits: ['Снятие тревоги', 'Улучшение сна', 'Концентрация']
    },
    {
      id: '3',
      name: 'Бинауральные ритмы',
      description: 'Синхронизация мозговых волн',
      category: 'binaural',
      icon: 'graphic-eq',
      color: '#7B1FA2',
      frequency: '10 Hz (Альфа-волны)',
      benefits: ['Фокусировка', 'Креативность', 'Релаксация']
    },
    {
      id: '4',
      name: 'Исцеляющие частоты',
      description: 'Сольфеджио для восстановления',
      category: 'healing',
      icon: 'healing',
      color: '#4CAF50',
      frequency: '528 Hz (ДНК-ремонт)',
      benefits: ['Исцеление ДНК', 'Трансформация', 'Гармония']
    },
    {
      id: '5',
      name: 'Лесные звуки',
      description: 'Пение птиц и шелест листвы',
      category: 'nature',
      icon: 'park',
      color: '#388E3C',
      benefits: ['Связь с природой', 'Умиротворение', 'Восстановление энергии']
    },
    {
      id: '6',
      name: 'Дождь и гром',
      description: 'Атмосферные осадки',
      category: 'nature',
      icon: 'thunderstorm',
      color: '#455A64',
      benefits: ['Глубокий сон', 'Маскировка шума', 'Комфорт']
    },
    {
      id: '7',
      name: 'Тибетские поющие чаши',
      description: 'Древние звуки для очищения',
      category: 'healing',
      icon: 'circle',
      color: '#FF6F00',
      frequency: '432 Hz (Космическая)',
      benefits: ['Очищение чакр', 'Баланс энергии', 'Медитация']
    },
    {
      id: '8',
      name: 'Колыбельная вселенной',
      description: 'Глубокий восстановительный сон',
      category: 'sleep',
      icon: 'bedtime',
      color: '#3F51B5',
      frequency: '0.5-4 Hz (Дельта-волны)',
      benefits: ['Глубокий сон', 'Восстановление', 'Сновидения']
    }
  ], []);

  const categories = useMemo(() => [
    { id: 'all', name: 'Все', icon: 'apps', color: '#2E7D4A' },
    { id: 'meditation', name: 'Медитация', icon: 'self-improvement', color: '#6A1B9A' },
    { id: 'nature', name: 'Природа', icon: 'nature', color: '#4CAF50' },
    { id: 'binaural', name: 'Бинауральные', icon: 'graphic-eq', color: '#7B1FA2' },
    { id: 'healing', name: 'Исцеление', icon: 'healing', color: '#FF6F00' },
    { id: 'sleep', name: 'Сон', icon: 'bedtime', color: '#3F51B5' }
  ], []);

  const filteredSounds = useMemo(() => {
    if (selectedCategory === 'all') return sounds;
    return sounds.filter(sound => sound.category === selectedCategory);
  }, [sounds, selectedCategory]);

  const showAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message });
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const playSound = useCallback((sound: Sound) => {
    setCurrentSound(sound);
    setShowPlayer(true);
  }, []);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <LinearGradient colors={['#6A1B9A', '#8E24AA']} style={styles.headerGradient}>
          <MaterialIcons name="headphones" size={40} color="white" />
          <Text style={styles.title}>Терапевтические звуки</Text>
          <Text style={styles.subtitle}>
            Научно обоснованная аудиотерапия для восстановления
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Categories */}
      <Animated.View style={[styles.categoriesSection, contentAnimatedStyle]}>
        <Text style={styles.sectionTitle}>🎵 Категории</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategory,
                  { borderColor: category.color }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <MaterialIcons 
                  name={category.icon as any} 
                  size={24} 
                  color={selectedCategory === category.id ? 'white' : category.color} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                  { color: selectedCategory === category.id ? 'white' : category.color }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Sounds List */}
      <Animated.View style={[styles.soundsSection, contentAnimatedStyle]}>
        <Text style={styles.sectionTitle}>
          🎧 {selectedCategory === 'all' ? 'Все звуки' : 
              categories.find(c => c.id === selectedCategory)?.name || 'Звуки'}
        </Text>
        
        <View style={styles.soundsGrid}>
          {filteredSounds.map((sound) => (
            <MemoizedSoundCard 
              key={sound.id} 
              sound={sound} 
              onPlay={playSound}
            />
          ))}
        </View>
      </Animated.View>

      {/* Benefits Info */}
      <Animated.View style={[styles.infoSection, contentAnimatedStyle]}>
        <Text style={styles.sectionTitle}>✨ Польза аудиотерапии</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <MaterialIcons name="psychology" size={24} color="#6A1B9A" />
            <Text style={styles.benefitDescription}>
              Снижение активности амигдалы (центр страха)
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialIcons name="favorite" size={24} color="#F44336" />
            <Text style={styles.benefitDescription}>
              Нормализация сердечного ритма и давления
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialIcons name="neurology" size={24} color="#FF9800" />
            <Text style={styles.benefitDescription}>
              Увеличение выработки ГАМК (нейромедиатор покоя)
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialIcons name="bedtime" size={24} color="#3F51B5" />
            <Text style={styles.benefitDescription}>
              Синхронизация циркадных ритмов
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Audio Player Modal */}
      {showPlayer && currentSound && (
        <Modal visible={showPlayer} animationType="slide">
          <View style={[styles.playerContainer, { paddingTop: insets.top }]}>
            <React.Suspense fallback={
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6A1B9A" />
                <Text style={styles.loadingText}>Загрузка плеера...</Text>
              </View>
            }>
              <AdvancedAudioPlayer
                sound={currentSound}
                onClose={() => {
                  setShowPlayer(false);
                  setCurrentSound(null);
                }}
              />
            </React.Suspense>
          </View>
        </Modal>
      )}

      {/* Web Alert */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.webAlertOverlay}>
            <View style={styles.webAlertContent}>
              <Text style={styles.webAlertTitle}>{alertConfig.title}</Text>
              <Text style={styles.webAlertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={styles.webAlertButton}
                onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.webAlertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    fontSize: 16,
    color: '#6A1B9A',
    marginTop: 15,
    fontWeight: '500'
  },
  header: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  headerGradient: {
    padding: 30,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22
  },
  categoriesSection: {
    marginVertical: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginHorizontal: 20,
    marginBottom: 15
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: 'white',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  selectedCategory: {
    backgroundColor: '#2E7D4A'
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600'
  },
  selectedCategoryText: {
    color: 'white'
  },
  soundsSection: {
    margin: 20
  },
  soundsGrid: {
    gap: 15
  },
  soundCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6
  },
  soundGradient: {
    padding: 20,
    position: 'relative'
  },
  soundHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15
  },
  soundInfo: {
    flex: 1,
    marginLeft: 15
  },
  soundName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5
  },
  soundDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4
  },
  soundFrequency: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic'
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15
  },
  benefitTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  benefitText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500'
  },
  playButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  infoSection: {
    margin: 20,
    marginTop: 10
  },
  benefitsList: {
    gap: 15
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  benefitDescription: {
    fontSize: 14,
    color: '#333',
    marginLeft: 15,
    flex: 1,
    lineHeight: 20
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  webAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  webAlertContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    minWidth: 300,
    maxWidth: '90%'
  },
  webAlertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  webAlertMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    lineHeight: 22
  },
  webAlertButton: {
    backgroundColor: '#6A1B9A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  webAlertButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default React.memo(SoundsPage);
