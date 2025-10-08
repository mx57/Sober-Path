
// Компонент мини-игр для отвлечения от тяги

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MiniGameEngine, addictionDistractiveGames, MiniGame } from '../../services/miniGamesService';
import { Canvas, Circle, useSharedValue, useAnimatedGestureHandler, runOnJS } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MiniGamesPageProps {
  currentMood?: number;
  cravingLevel?: number;
  onGameComplete?: (gameId: string, score: number, improvement: { mood: number; craving: number }) => void;
}

// Компонент "Лопание пузырей дыханием"
const BreathBubbleGame = ({ onGameComplete }: { onGameComplete: (score: number) => void }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const animationRef = useRef<any>();

  interface Bubble {
    id: string;
    x: number;
    y: number;
    size: Animated.Value;
    opacity: Animated.Value;
    color: string;
  }

  const breathingPattern = {
    inhale: 4000,  // 4 секунды
    hold: 4000,    // 4 секунды  
    exhale: 6000   // 6 секунд
  };

  useEffect(() => {
    if (gameActive) {
      startBreathingCycle();
      generateBubbles();
    }
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [gameActive]);

  const startBreathingCycle = () => {
    const cycle = () => {
      // Вдох
      setBreathPhase('inhale');
      setPhaseTime(0);
      
      animationRef.current = setTimeout(() => {
        // Задержка
        setBreathPhase('hold');
        setPhaseTime(0);
        
        animationRef.current = setTimeout(() => {
          // Выдох
          setBreathPhase('exhale');
          setPhaseTime(0);
          
          animationRef.current = setTimeout(() => {
            if (gameActive) cycle(); // Повторяем цикл
          }, breathingPattern.exhale);
        }, breathingPattern.hold);
      }, breathingPattern.inhale);
    };
    
    cycle();
  };

  const generateBubbles = () => {
    const interval = setInterval(() => {
      if (!gameActive) {
        clearInterval(interval);
        return;
      }

      const newBubble: Bubble = {
        id: Date.now().toString(),
        x: Math.random() * (screenWidth - 60),
        y: Math.random() * (screenHeight - 200) + 100,
        size: new Animated.Value(20),
        opacity: new Animated.Value(0.8),
        color: `hsl(${Math.random() * 360}, 70%, 80%)`
      };

      setBubbles(prev => [...prev, newBubble]);

      // Анимация пузыря
      Animated.parallel([
        Animated.timing(newBubble.size, {
          toValue: 40 + Math.random() * 40,
          duration: 2000,
          useNativeDriver: false
        }),
        Animated.timing(newBubble.opacity, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false
        })
      ]).start(() => {
        setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
      });
    }, 800);

    return () => clearInterval(interval);
  };

  const popBubble = (bubbleId: string) => {
    if (breathPhase === 'exhale') {
      // Правильное время для лопания
      setScore(prev => prev + 10);
      setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    } else {
      // Неправильное время - снимаем очки
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const getPhaseColor = () => {
    switch (breathPhase) {
      case 'inhale': return '#4CAF50';
      case 'hold': return '#FF9800'; 
      case 'exhale': return '#2196F3';
      default: return '#666';
    }
  };

  const getPhaseInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'Вдох... 🫁';
      case 'hold': return 'Задержка... ⏸️';
      case 'exhale': return 'Выдох... Лопайте пузыри! 💨';
      default: return '';
    }
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.scoreText}>Счет: {score}</Text>
        <View style={[styles.phaseIndicator, { backgroundColor: getPhaseColor() }]}>
          <Text style={styles.phaseText}>{getPhaseInstruction()}</Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        {bubbles.map(bubble => (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubble,
              {
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size,
                opacity: bubble.opacity,
                backgroundColor: bubble.color
              }
            ]}
          >
            <TouchableOpacity
              style={styles.bubbleTouchArea}
              onPress={() => popBubble(bubble.id)}
            >
              <Text style={styles.bubbleText}>💨</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {!gameActive ? (
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => setGameActive(true)}
        >
          <Text style={styles.startButtonText}>Начать игру</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={() => {
            setGameActive(false);
            onGameComplete(score);
          }}
        >
          <Text style={styles.stopButtonText}>Завершить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Компонент "Последовательность цветов"
const ColorSequenceGame = ({ onGameComplete }: { onGameComplete: (score: number) => void }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  const colors = ['#F44336', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4'];
  const colorNames = ['Красный', 'Зеленый', 'Синий', 'Оранжевый', 'Фиолетовый', 'Бирюзовый'];

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setCurrentLevel(1);
    generateSequence(1);
  };

  const generateSequence = (level: number) => {
    const newSequence = Array(level + 2).fill(0).map(() => 
      colors[Math.floor(Math.random() * colors.length)]
    );
    setSequence(newSequence);
    setUserSequence([]);
    showSequence(newSequence);
  };

  const showSequence = async (seq: string[]) => {
    setShowingSequence(true);
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      // Здесь можно добавить анимацию подсветки цвета
    }
    
    setShowingSequence(false);
  };

  const selectColor = (color: string) => {
    if (showingSequence) return;
    
    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);

    // Проверяем правильность
    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      // Ошибка - игра окончена
      endGame();
      return;
    }

    if (newUserSequence.length === sequence.length) {
      // Последовательность завершена правильно
      const points = currentLevel * 10;
      setScore(prev => prev + points);
      setCurrentLevel(prev => prev + 1);
      
      setTimeout(() => {
        generateSequence(currentLevel + 1);
      }, 1000);
    }
  };

  const endGame = () => {
    setGameActive(false);
    onGameComplete(score);
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.scoreText}>Счет: {score}</Text>
        <Text style={styles.levelText}>Уровень: {currentLevel}</Text>
      </View>

      {showingSequence && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>Запоминайте последовательность...</Text>
        </View>
      )}

      <View style={styles.colorGrid}>
        {colors.map((color, index) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorButton, { backgroundColor: color }]}
            onPress={() => selectColor(color)}
            disabled={showingSequence || !gameActive}
          >
            <Text style={styles.colorButtonText}>{colorNames[index]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sequenceDisplay}>
        <Text style={styles.sequenceLabel}>Ваша последовательность:</Text>
        <View style={styles.sequenceDots}>
          {userSequence.map((color, index) => (
            <View
              key={index}
              style={[styles.sequenceDot, { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>

      {!gameActive ? (
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Начать игру</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.stopButton} onPress={endGame}>
          <Text style={styles.stopButtonText}>Завершить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Основной компонент мини-игр
const MiniGamesPage: React.FC<MiniGamesPageProps> = ({ 
  currentMood = 3, 
  cravingLevel = 2, 
  onGameComplete 
}) => {
  const insets = useSafeAreaInsets();
  const [gameEngine] = useState(() => new MiniGameEngine());
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [recommendedGame, setRecommendedGame] = useState<MiniGame | null>(null);
  const [gameSession, setGameSession] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    loadRecommendedGame();
    loadUserStats();
  }, [currentMood, cravingLevel]);

  const loadRecommendedGame = () => {
    const recommended = gameEngine.recommendGame('user_1', cravingLevel, currentMood, 15);
    setRecommendedGame(recommended);
  };

  const loadUserStats = async () => {
    const analytics = gameEngine.analyzeGameEffectiveness('user_1');
    setUserStats(analytics);
  };

  const startGame = async (game: MiniGame) => {
    const session = await gameEngine.startGame('user_1', game.id, cravingLevel, currentMood);
    setGameSession(session);
    setSelectedGame(game);
  };

  const completeGame = async (finalScore: number) => {
    if (!gameSession) return;

    // Симулируем улучшение состояния
    const moodAfter = Math.min(5, currentMood + 0.5 + Math.random() * 0.5);
    const cravingAfter = Math.max(1, cravingLevel - 0.5 - Math.random() * 0.5);

    await gameEngine.completeGame(
      'user_1',
      gameSession.startTime.toISOString(),
      finalScore,
      cravingAfter,
      moodAfter
    );

    setSelectedGame(null);
    setGameSession(null);
    
    if (onGameComplete) {
      onGameComplete(selectedGame!.id, finalScore, {
        mood: moodAfter - currentMood,
        craving: cravingLevel - cravingAfter
      });
    }

    if (Platform.OS === 'web') {
      alert(`🎉 Игра завершена!\nСчет: ${finalScore}\nНастроение улучшилось на ${(moodAfter - currentMood).toFixed(1)}`);
    } else {
      Alert.alert(
        '🎉 Игра завершена!',
        `Счет: ${finalScore}\nНастроение улучшилось на ${(moodAfter - currentMood).toFixed(1)}`,
        [{ text: 'ОК' }]
      );
    }

    loadUserStats(); // Обновляем статистику
  };

  const renderGameContent = () => {
    if (!selectedGame) return null;

    switch (selectedGame.id) {
      case 'breath_bubble_pop':
        return <BreathBubbleGame onGameComplete={completeGame} />;
      case 'color_sequence_memory':
        return <ColorSequenceGame onGameComplete={completeGame} />;
      default:
        return (
          <View style={styles.gameContainer}>
            <Text style={styles.gameTitle}>{selectedGame.name}</Text>
            <Text style={styles.gameDescription}>{selectedGame.description}</Text>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => completeGame(Math.floor(Math.random() * 100))}
            >
              <Text style={styles.startButtonText}>Симулировать игру</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  // Helper methods moved inside the component
  const getGameIcon = (category: string): keyof typeof MaterialIcons.glyphMap => {
    switch (category) {
      case 'cognitive': return 'psychology';
      case 'mindfulness': return 'self-improvement';
      case 'breathing': return 'air';
      case 'distraction': return 'sports-esports';
      case 'social': return 'group';
      default: return 'games';
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800'; 
      case 'hard': return '#F44336';
      default: return '#666';
    }
  };

  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'cognitive': return 'Когнитивные';
      case 'mindfulness': return 'Осознанность';
      case 'breathing': return 'Дыхание';
      case 'distraction': return 'Отвлечение';
      case 'social': return 'Социальные';
      default: return category;
    }
  };


  if (selectedGame) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.gameHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedGame(null)}
          >
            <MaterialIcons name="arrow-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.gameTitle}>{selectedGame.name}</Text>
        </View>
        {renderGameContent()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <LinearGradient colors={['#4CAF50', '#45A049']} style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="games" size={32} color="white" />
          <Text style={styles.headerTitle}>Мини-игры</Text>
          <Text style={styles.headerSubtitle}>
            Отвлекись от тяги с помощью игр
          </Text>
        </View>
      </LinearGradient>


      {recommendedGame && (
        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>🎯 Рекомендуется сейчас</Text>
          <TouchableOpacity 
            style={styles.recommendedCard}
            onPress={() => startGame(recommendedGame)}
          >
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.recommendedCardGradient}
            >
              <View style={styles.recommendedCardContent}>
                <Text style={styles.recommendedGameTitle}>{recommendedGame.name}</Text>
                <Text style={styles.recommendedGameDescription}>
                  {recommendedGame.description}
                </Text>
                <View style={styles.recommendedGameMeta}>
                  <Text style={styles.recommendedGameDuration}>
                    ⏱ {recommendedGame.duration} мин
                  </Text>
                  <Text style={styles.recommendedGameDifficulty}>
                    📊 {recommendedGame.difficulty === 'easy' ? 'Легко' : 
                         recommendedGame.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="play-arrow" size={40} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}


      {userStats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Ваша статистика</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.totalSessions}</Text>
              <Text style={styles.statLabel}>Игр сыграно</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userStats.averageCravingReduction.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Снижение тяги</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                +{userStats.averageMoodImprovement.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Улучшение настроения</Text>
            </View>
          </View>
        </View>
      )}


      <View style={styles.allGamesSection}>
        <Text style={styles.sectionTitle}>🎮 Все игры ({addictionDistractiveGames.length})</Text>
        <ScrollView 
          horizontal={false}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          style={styles.gamesScrollView}
        >
          <View style={styles.gamesGrid}>
            {addictionDistractiveGames.map(game => (
              <TouchableOpacity
                key={game.id}
                style={styles.gameCard}
                onPress={() => startGame(game)}
              >
                <View style={styles.gameCardHeader}>
                  <MaterialIcons 
                    name={getGameIcon(game.category)}
                    size={24} 
                    color="#4CAF50" 
                  />
                  <View style={[styles.difficultyBadge, { 
                    backgroundColor: getDifficultyColor(game.difficulty)
                  }]}>
                    <Text style={styles.difficultyText}>
                      {game.difficulty === 'easy' ? 'Л' : 
                       game.difficulty === 'medium' ? 'С' : 'Т'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.gameCardTitle}>{game.name}</Text>
                <Text style={styles.gameCardDescription} numberOfLines={3}>
                  {game.description}
                </Text>
                
                <View style={styles.gameCardFooter}>
                  <Text style={styles.gameCardDuration}>⏱ {game.duration} мин</Text>
                  <Text style={styles.gameCardCategory}>{getCategoryName(game.category)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}; // Closing brace for MiniGamesPage component

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
    marginTop: 4,
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 16
  },
  recommendedSection: {
    padding: 20
  },
  recommendedCard: {
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  recommendedCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15
  },
  recommendedCardContent: {
    flex: 1,
    marginRight: 15
  },
  recommendedGameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8
  },
  recommendedGameDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12
  },
  recommendedGameMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  recommendedGameDuration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)'
  },
  recommendedGameDifficulty: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)'
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4
  },
  allGamesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flex: 1
  },
  gamesScrollView: {
    maxHeight: 600,
    flex: 1
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20
  },
  gameCard: {
    width: (screenWidth - 50) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  difficultyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white'
  },
  gameCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6
  },
  gameCardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 10
  },
  gameCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  gameCardDuration: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600'
  },
  gameCardCategory: {
    fontSize: 10,
    color: '#999'
  },
  gameContainer: {
    flex: 1,
    padding: 20
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  backButton: {
    padding: 10
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center'
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  phaseIndicator: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20
  },
  phaseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  gameArea: {
    flex: 1,
    position: 'relative'
  },
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bubbleTouchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bubbleText: {
    fontSize: 16
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20
  },
  colorButton: {
    width: (screenWidth - 60) / 3,
    height: 60,
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  colorButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  sequenceDisplay: {
    alignItems: 'center',
    marginVertical: 20
  },
  sequenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
  },
  sequenceDots: {
    flexDirection: 'row',
    gap: 8
  },
  sequenceDot: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600'
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  stopButton: {
    backgroundColor: '#F44336',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 20
  }
});

export default MiniGamesPage;
