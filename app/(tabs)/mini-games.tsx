
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

// Игра "Осознанный лабиринт"
const MindfulMazeGame = ({ onGameComplete }: { onGameComplete: (score: number) => void }) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [maze, setMaze] = useState<number[][]>([]);
  const [collectibles, setCollectibles] = useState<{x: number, y: number}[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const gameTimerRef = useRef<any>();

  const CELL_SIZE = 25;
  const MAZE_SIZE = 15;

  const generateMaze = () => {
    // Простой лабиринт для демонстрации
    const newMaze = Array(MAZE_SIZE).fill(0).map(() => Array(MAZE_SIZE).fill(0));
    
    // Создаем стены (1) и проходы (0)
    for (let i = 0; i < MAZE_SIZE; i++) {
      for (let j = 0; j < MAZE_SIZE; j++) {
        if (i === 0 || j === 0 || i === MAZE_SIZE - 1 || j === MAZE_SIZE - 1) {
          newMaze[i][j] = 1; // Внешние стены
        } else if (i % 2 === 0 && j % 2 === 0) {
          newMaze[i][j] = 1; // Внутренние стены
        }
      }
    }
    
    // Добавляем случайные стены
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1;
      const y = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1;
      if (!(x === 1 && y === 1) && !(x === MAZE_SIZE - 2 && y === MAZE_SIZE - 2)) {
        newMaze[y][x] = 1;
      }
    }
    
    // Генерируем коллекционные предметы
    const newCollectibles = [];
    for (let i = 0; i < 8; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1;
        y = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1;
      } while (newMaze[y][x] === 1 || (x === 1 && y === 1));
      
      newCollectibles.push({ x, y });
    }
    
    setMaze(newMaze);
    setCollectibles(newCollectibles);
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setPlayerPosition({ x: 1, y: 1 });
    setGameTime(0);
    generateMaze();
    
    gameTimerRef.current = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);
  };

  const movePlayer = (dx: number, dy: number) => {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] === 0) {
      setPlayerPosition({ x: newX, y: newY });
      
      // Проверяем сбор предметов
      const collectibleIndex = collectibles.findIndex(c => c.x === newX && c.y === newY);
      if (collectibleIndex !== -1) {
        setScore(prev => prev + 10);
        setCollectibles(prev => prev.filter((_, index) => index !== collectibleIndex));
      }
      
      // Проверяем победу
      if (newX === MAZE_SIZE - 2 && newY === MAZE_SIZE - 2) {
        endGame();
      }
    }
  };

  const endGame = () => {
    setGameActive(false);
    clearInterval(gameTimerRef.current);
    const finalScore = score + Math.max(0, 300 - gameTime);
    onGameComplete(finalScore);
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.scoreText}>Счет: {score}</Text>
        <Text style={styles.levelText}>Время: {gameTime}с</Text>
      </View>
      
      <Text style={styles.instructionText}>
        Найдите все 🔹 и дойдите до выхода 🏁
      </Text>
      
      <View style={styles.mazeContainer}>
        {maze.map((row, y) => (
          <View key={y} style={styles.mazeRow}>
            {row.map((cell, x) => (
              <View key={`${x}-${y}`} style={[
                styles.mazeCell,
                { backgroundColor: cell === 1 ? '#333' : '#FFF' }
              ]}>
                {playerPosition.x === x && playerPosition.y === y && (
                  <Text style={styles.player}>🧘</Text>
                )}
                {collectibles.find(c => c.x === x && c.y === y) && (
                  <Text style={styles.collectible}>🔹</Text>
                )}
                {x === MAZE_SIZE - 2 && y === MAZE_SIZE - 2 && (
                  <Text style={styles.exit}>🏁</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
      
      {gameActive && (
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer(0, -1)}>
              <MaterialIcons name="keyboard-arrow-up" size={30} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer(-1, 0)}>
              <MaterialIcons name="keyboard-arrow-left" size={30} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer(1, 0)}>
              <MaterialIcons name="keyboard-arrow-right" size={30} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={() => movePlayer(0, 1)}>
              <MaterialIcons name="keyboard-arrow-down" size={30} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
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

// Игра "Вызов быстрых решений"
const DecisionChallengeGame = ({ onGameComplete }: { onGameComplete: (score: number) => void }) => {
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const timerRef = useRef<any>();

  const scenarios = [
    {
      situation: "Вы на вечеринке, друзья предлагают выпить",
      options: [
        { text: "Выпить, чтобы не выделяться", healthy: false, points: -5 },
        { text: "Вежливо отказаться и взять безалкогольный напиток", healthy: true, points: 15 },
        { text: "Уйти с вечеринки", healthy: true, points: 10 },
        { text: "Сказать, что вы водитель", healthy: true, points: 12 }
      ]
    },
    {
      situation: "Стрессовый день на работе, хочется расслабиться",
      options: [
        { text: "Купить бутылку вина по дороге домой", healthy: false, points: -10 },
        { text: "Пойти в спортзал или на прогулку", healthy: true, points: 15 },
        { text: "Принять горячую ванну с аромамаслами", healthy: true, points: 12 },
        { text: "Позвонить другу или близкому", healthy: true, points: 14 }
      ]
    },
    {
      situation: "Праздничный ужин в семье, все поднимают бокалы",
      options: [
        { text: "Выпить немного, это же праздник", healthy: false, points: -8 },
        { text: "Поднять бокал с соком или водой", healthy: true, points: 15 },
        { text: "Предложить тост за здоровье", healthy: true, points: 16 },
        { text: "Сосредоточиться на общении, а не на напитках", healthy: true, points: 13 }
      ]
    },
    {
      situation: "Плохое настроение, чувство одиночества",
      options: [
        { text: "Выпить, чтобы заглушить боль", healthy: false, points: -15 },
        { text: "Включить любимую музыку и потанцевать", healthy: true, points: 12 },
        { text: "Написать в дневнике или другу", healthy: true, points: 14 },
        { text: "Заняться хобби или творчеством", healthy: true, points: 13 }
      ]
    },
    {
      situation: "Встреча с старыми друзьями в баре",
      options: [
        { text: "Заказать алкоголь, как раньше", healthy: false, points: -12 },
        { text: "Заказать кофе или безалкогольный коктейль", healthy: true, points: 14 },
        { text: "Предложить сменить место встречи", healthy: true, points: 16 },
        { text: "Честно рассказать о своих изменениях", healthy: true, points: 18 }
      ]
    }
  ];

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setScenarioIndex(0);
    showNextScenario();
  };

  const showNextScenario = () => {
    if (scenarioIndex >= scenarios.length) {
      endGame();
      return;
    }
    
    setCurrentScenario(scenarios[scenarioIndex]);
    setTimeLeft(10);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    clearInterval(timerRef.current);
    setScore(prev => prev - 5); // Штраф за просрочку
    setTimeout(() => {
      setScenarioIndex(prev => prev + 1);
      showNextScenario();
    }, 1000);
  };

  const selectOption = (option: any) => {
    clearInterval(timerRef.current);
    
    const timeBonus = timeLeft; // Бонус за скорость
    const totalPoints = option.points + timeBonus;
    setScore(prev => prev + totalPoints);
    
    setTimeout(() => {
      setScenarioIndex(prev => prev + 1);
      showNextScenario();
    }, 1000);
  };

  const endGame = () => {
    setGameActive(false);
    clearInterval(timerRef.current);
    onGameComplete(Math.max(0, score));
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.scoreText}>Счет: {score}</Text>
        <Text style={styles.levelText}>Сценарий: {scenarioIndex + 1}/{scenarios.length}</Text>
      </View>
      
      {currentScenario && (
        <View style={styles.scenarioContainer}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>⏰ {timeLeft}</Text>
          </View>
          
          <Text style={styles.scenarioText}>{currentScenario.situation}</Text>
          
          <View style={styles.optionsContainer}>
            {currentScenario.options.map((option: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: option.healthy ? '#E8F5E8' : '#FFE8E8' }
                ]}
                onPress={() => selectOption(option)}
              >
                <Text style={[
                  styles.optionText,
                  { color: option.healthy ? '#2E7D4A' : '#D32F2F' }
                ]}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
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

// Игра "Сад эмоций"
const EmotionGardenGame = ({ onGameComplete }: { onGameComplete: (score: number) => void }) => {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [plants, setPlants] = useState<{id: string, type: string, growth: number, x: number, y: number}[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [waterCount, setWaterCount] = useState(0);

  const emotions = [
    { name: 'Спокойствие', icon: '🌱', color: '#4CAF50' },
    { name: 'Радость', icon: '🌻', color: '#FFD700' },
    { name: 'Мир', icon: '🌿', color: '#81C784' },
    { name: 'Любовь', icon: '🌹', color: '#F48FB1' },
    { name: 'Мудрость', icon: '🌲', color: '#8D6E63' },
    { name: 'Надежда', icon: '🌸', color: '#BA68C8' }
  ];

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setPlants([]);
    setWaterCount(0);
  };

  const plantEmotion = (emotion: any) => {
    if (plants.length >= 12) return;
    
    const newPlant = {
      id: Date.now().toString(),
      type: emotion.icon,
      growth: 0,
      x: Math.random() * 250 + 20,
      y: Math.random() * 200 + 50
    };
    
    setPlants(prev => [...prev, newPlant]);
    setScore(prev => prev + 5);
  };

  const waterPlant = (plantId: string) => {
    setPlants(prev => prev.map(plant => 
      plant.id === plantId 
        ? { ...plant, growth: Math.min(plant.growth + 1, 3) }
        : plant
    ));
    setWaterCount(prev => prev + 1);
    setScore(prev => prev + 3);
  };

  const endGame = () => {
    setGameActive(false);
    const growthBonus = plants.reduce((sum, plant) => sum + plant.growth * 2, 0);
    onGameComplete(score + growthBonus);
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.scoreText}>Счет: {score}</Text>
        <Text style={styles.levelText}>Растений: {plants.length}/12</Text>
      </View>
      
      <Text style={styles.instructionText}>Выбирайте эмоции для посадки в саду</Text>
      
      <View style={styles.gardenContainer}>
        {plants.map(plant => (
          <TouchableOpacity
            key={plant.id}
            style={[styles.plant, { left: plant.x, top: plant.y }]}
            onPress={() => waterPlant(plant.id)}
          >
            <Text style={[styles.plantIcon, { 
              fontSize: 16 + plant.growth * 4,
              opacity: 0.7 + plant.growth * 0.1 
            }]}>
              {plant.type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.emotionsGrid}>
        {emotions.map(emotion => (
          <TouchableOpacity
            key={emotion.name}
            style={[styles.emotionButton, { borderColor: emotion.color }]}
            onPress={() => plantEmotion(emotion)}
          >
            <Text style={styles.emotionIcon}>{emotion.icon}</Text>
            <Text style={styles.emotionName}>{emotion.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {!gameActive ? (
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Начать садоводство</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.stopButton} onPress={endGame}>
          <Text style={styles.stopButtonText}>Завершить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Игра "Охота за благодарностью"
const GratitudeHuntGame = ({ onGameComplete }: { onGameComplete: (score: number) => void }) => {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [foundItems, setFoundItems] = useState<string[]>([]);
  const [promptIndex, setPromptIndex] = useState(0);

  const prompts = [
    'Найдите что-то красивое вокруг себя',
    'Найдите что-то, что приносит вам комфорт',
    'Найдите что-то, за что вы благодарны своим близким',
    'Найдите что-то, что помогает вам учиться',
    'Найдите что-то, что дает вам энергию',
    'Найдите что-то, что вызывает у вас улыбку',
    'Найдите что-то, что связывает вас с хорошими воспоминаниями',
    'Найдите что-то, что помогает вам чувствовать себя в безопасности',
    'Найдите что-то, что вдохновляет вас',
    'Найдите что-то, что олицетворяет вашу силу'
  ];

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setFoundItems([]);
    setPromptIndex(0);
    setCurrentPrompt(prompts[0]);
  };

  const foundItem = () => {
    setScore(prev => prev + 10);
    setFoundItems(prev => [...prev, `Пункт ${prev.length + 1}`]);
    
    if (promptIndex < prompts.length - 1) {
      setPromptIndex(prev => prev + 1);
      setCurrentPrompt(prompts[promptIndex + 1]);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameActive(false);
    onGameComplete(score);
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.scoreText}>Благодарностей: {foundItems.length}</Text>
        <Text style={styles.levelText}>Счет: {score}</Text>
      </View>
      
      {gameActive && (
        <View style={styles.huntContainer}>
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>{currentPrompt}</Text>
          </View>
          
          <TouchableOpacity style={styles.foundButton} onPress={foundItem}>
            <MaterialIcons name="camera-alt" size={24} color="white" />
            <Text style={styles.foundButtonText}>📸 Нашел!</Text>
          </TouchableOpacity>
          
          <View style={styles.foundItemsList}>
            {foundItems.map((item, index) => (
              <View key={index} style={styles.foundItemBadge}>
                <Text style={styles.foundItemText}>✔ {item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {!gameActive ? (
        <View style={styles.gratitudeIntro}>
          <Text style={styles.introText}>
            🔍 Отправьтесь на охоту за 10 вещами, за которые вы благодарны!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Начать охоту</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.stopButton} onPress={endGame}>
          <Text style={styles.stopButtonText}>Завершить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const StressBallGame = ({ onGameComplete }: { onGameComplete: (score: number) => void }) => {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [squeezeCount, setSqueezeCount] = useState(0);
  const [ballSize, setBallSize] = useState(new Animated.Value(80));
  const [ballColor, setBallColor] = useState('#4CAF50');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const gameTimerRef = useRef<any>();

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setSqueezeCount(0);
    setBallSize(new Animated.Value(80));
    startBreathingCycle();
    
    gameTimerRef.current = setTimeout(() => {
      endGame();
    }, 60000); // 1 минута игры
  };

  const startBreathingCycle = () => {
    const cycle = () => {
      // Вдох (4 секунды)
      setBreathingPhase('inhale');
      setTimeout(() => {
        // Выдох (4 секунды)
        setBreathingPhase('exhale');
        setTimeout(() => {
          if (gameActive) cycle();
        }, 4000);
      }, 4000);
    };
    cycle();
  };

  const squeezeBall = () => {
    if (!gameActive) return;
    
    const correctTiming = breathingPhase === 'exhale';
    const points = correctTiming ? 5 : 2;
    
    setScore(prev => prev + points);
    setSqueezeCount(prev => prev + 1);
    
    // Анимация сжатия
    Animated.sequence([
      Animated.timing(ballSize, {
        toValue: 60,
        duration: 150,
        useNativeDriver: false
      }),
      Animated.timing(ballSize, {
        toValue: 80,
        duration: 150,
        useNativeDriver: false
      })
    ]).start();
    
    // Изменение цвета в зависимости от правильности
    setBallColor(correctTiming ? '#4CAF50' : '#FF9800');
    setTimeout(() => setBallColor('#4CAF50'), 200);
  };

  const endGame = () => {
    setGameActive(false);
    clearTimeout(gameTimerRef.current);
    onGameComplete(score);
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.scoreText}>Счет: {score}</Text>
        <Text style={styles.levelText}>Нажатий: {squeezeCount}</Text>
      </View>
      
      <View style={styles.breathingIndicator}>
        <Text style={styles.breathingText}>
          {breathingPhase === 'inhale' ? '🫁 Вдох...' : '💨 Выдох - Нажимайте!'}
        </Text>
      </View>
      
      <View style={styles.ballContainer}>
        <TouchableOpacity onPress={squeezeBall} style={styles.ballTouchArea}>
          <Animated.View style={[
            styles.stressBall,
            {
              width: ballSize,
              height: ballSize,
              backgroundColor: ballColor
            }
          ]}>
            <Text style={styles.ballEmoji}>⚪</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.instructionText}>
        Нажимайте на мячик в такт дыханию для лучшего результата
      </Text>
      
      {!gameActive ? (
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Начать игру (60 сек)</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.stopButton} onPress={endGame}>
          <Text style={styles.stopButtonText}>Завершить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
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
      case 'mindful_maze':
        return <MindfulMazeGame onGameComplete={completeGame} />;
      case 'rapid_decision_challenge':
        return <DecisionChallengeGame onGameComplete={completeGame} />;
      case 'emotion_regulation_garden':
        return <EmotionGardenGame onGameComplete={completeGame} />;
      case 'gratitude_photo_hunt':
        return <GratitudeHuntGame onGameComplete={completeGame} />;
      case 'stress_ball_squeeze':
        return <StressBallGame onGameComplete={completeGame} />;
      case 'color_sequence_memory':
        return <ColorSequenceGame onGameComplete={completeGame} />;
      default:
        return (
          <View style={styles.gameContainer}>
            <Text style={styles.gameTitle}>{selectedGame.name}</Text>
            <Text style={styles.gameDescription}>{selectedGame.description}</Text>
            <View style={styles.comingSoonContainer}>
              <MaterialIcons name="construction" size={48} color="#FF9800" />
              <Text style={styles.comingSoonText}>
                Эта игра находится в разработке
              </Text>
              <Text style={styles.comingSoonSubtext}>
                Скоро будет добавлена полная интерактивная версия!
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={() => completeGame(Math.floor(Math.random() * 50) + 25)}
            >
              <Text style={styles.demoButtonText}>Попробовать демо-версию</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.backFromGameButton}
              onPress={() => setSelectedGame(null)}
            >
              <Text style={styles.backFromGameButtonText}>Вернуться к списку игр</Text>
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
  },
  // Стили для лабиринта
  mazeContainer: {
    alignSelf: 'center',
    backgroundColor: '#000',
    padding: 2,
    borderRadius: 5,
    marginVertical: 20
  },
  mazeRow: {
    flexDirection: 'row'
  },
  mazeCell: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#DDD'
  },
  player: {
    fontSize: 16
  },
  collectible: {
    fontSize: 12
  },
  exit: {
    fontSize: 14
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5
  },
  controlButton: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5
  },
  // Стили для игры принятия решений
  scenarioContainer: {
    flex: 1,
    padding: 20
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722'
  },
  scenarioText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
    fontWeight: '500'
  },
  optionsContainer: {
    gap: 15
  },
  optionButton: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500'
  },
  // Стили для антистресс игры
  breathingIndicator: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 12
  },
  breathingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3'
  },
  ballContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  ballTouchArea: {
    padding: 20
  },
  stressBall: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  ballEmoji: {
    fontSize: 30
  },
  // Стили для игр в разработке
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 40
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20
  },
  demoButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10
  },
  demoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  backFromGameButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10
  },
  backFromGameButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  },
  // Стили для сада эмоций
  gardenContainer: {
    height: 250,
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    marginVertical: 20,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#4CAF50'
  },
  plant: {
    position: 'absolute',
    padding: 5
  },
  plantIcon: {
    fontSize: 20
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8
  },
  emotionButton: {
    width: '30%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  emotionIcon: {
    fontSize: 20,
    marginBottom: 5
  },
  emotionName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center'
  },
  // Стили для охоты за благодарностью
  huntContainer: {
    flex: 1,
    padding: 20
  },
  promptContainer: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  promptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center'
  },
  foundButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    marginBottom: 20,
    gap: 8
  },
  foundButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  foundItemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  foundItemBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4CAF50'
  },
  foundItemText: {
    color: '#2E7D4A',
    fontSize: 12,
    fontWeight: '600'
  },
  gratitudeIntro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  introText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30
  }
});

export default MiniGamesPage;
