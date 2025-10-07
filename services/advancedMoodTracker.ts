// Расширенная система трекинга настроения с биофидбэк

export interface BiometricData {
  heartRate?: number;
  heartRateVariability?: number;
  skinConductance?: number;
  temperature?: number;
  accelerometer?: { x: number; y: number; z: number };
  gyroscope?: { x: number; y: number; z: number };
  timestamp: Date;
}

export interface EmotionalState {
  valence: number; // -5 to +5 (negative to positive)
  arousal: number; // 0 to 5 (calm to excited)
  dominance: number; // 0 to 5 (controlled to in-control)
  confidence: number; // 0 to 1
  detectedEmotions: string[];
  intensity: number; // 0 to 5
}

export interface MoodEntry {
  id: string;
  userId: string;
  timestamp: Date;
  
  // Субъективные данные
  mood: number; // 1-5
  energy: number; // 1-5
  anxiety: number; // 1-5
  motivation: number; // 1-5
  socialConnection: number; // 1-5
  physicalComfort: number; // 1-5
  
  // Контекстуальные данные
  location: string;
  weather: string;
  activity: string;
  socialContext: string;
  
  // Объективные данные
  biometricData?: BiometricData;
  emotionalState?: EmotionalState;
  
  // Анализ и инсайты
  triggers: string[];
  protectiveFactors: string[];
  cravingLevel: number; // 1-5
  copingStrategies: string[];
  
  // Медиа контент
  voiceNote?: string; // base64 audio
  photo?: string; // base64 image
  notes: string;
  
  // Автоматические инсайты
  aiAnalysis?: {
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    patterns: string[];
    alerts: string[];
  };
}

export interface EmotionRecognitionResult {
  emotion: string;
  confidence: number;
  valence: number;
  arousal: number;
  timestamp: Date;
}

export class AdvancedMoodTracker {
  private sensorManager: SensorManager;
  private emotionAnalyzer: EmotionAnalyzer;
  private patternDetector: PatternDetector;

  constructor() {
    this.sensorManager = new SensorManager();
    this.emotionAnalyzer = new EmotionAnalyzer();
    this.patternDetector = new PatternDetector();
  }

  // Комплексная оценка настроения
  async comprehensiveMoodAssessment(): Promise<ComprehensiveMoodData> {
    const biometricData = await this.sensorManager.collectBiometricData();
    const contextualData = await this.collectContextualData();
    
    return {
      timestamp: new Date(),
      biometrics: biometricData,
      context: contextualData,
      quickMoodCheck: this.generateQuickMoodQuestions(),
      suggestedActivities: await this.generateContextualSuggestions(biometricData, contextualData)
    };
  }

  // Анализ паттернов настроения
  async analyzeMoodPatterns(userId: string, timeRange: number = 30): Promise<MoodAnalysis> {
    const moodEntries = await this.getMoodEntries(userId, timeRange);
    
    const patterns = {
      dailyPatterns: this.analyzeDailyPatterns(moodEntries),
      weeklyPatterns: this.analyzeWeeklyPatterns(moodEntries),
      triggerPatterns: this.analyzeTriggerPatterns(moodEntries),
      seasonalPatterns: this.analyzeSeasonalPatterns(moodEntries),
      correlations: this.analyzeCorrelations(moodEntries)
    };

    const predictions = await this.predictMoodTrends(moodEntries);
    const recommendations = this.generatePersonalizedRecommendations(patterns, predictions);

    return {
      patterns,
      predictions,
      recommendations,
      riskAssessment: this.assessRiskLevel(moodEntries),
      insights: this.generateInsights(patterns)
    };
  }

  // Реальное время мониторинг биометрических данных
  startBiometricMonitoring(): void {
    this.sensorManager.startContinuousMonitoring({
      heartRate: true,
      heartRateVariability: true,
      skinConductance: false, // Требует специальные сенсоры
      accelerometer: true,
      gyroscope: true
    });

    this.sensorManager.on('dataReceived', (data: BiometricData) => {
      this.processRealtimeBiometrics(data);
    });
  }

  private async processRealtimeBiometrics(data: BiometricData): Promise<void> {
    // Анализ стресса по ЧСС и HRV
    const stressLevel = this.calculateStressLevel(data);
    
    // Обнаружение аномалий
    const anomalies = this.detectAnomalies(data);
    
    // Если обнаружен высокий стресс или аномалии
    if (stressLevel > 0.7 || anomalies.length > 0) {
      await this.triggerInterventions(stressLevel, anomalies);
    }
    
    // Обновление текущего состояния
    await this.updateCurrentState(data, stressLevel);
  }

  private calculateStressLevel(data: BiometricData): number {
    let stressIndicators = 0;
    let totalIndicators = 0;

    if (data.heartRate) {
      totalIndicators++;
      // Повышенный пульс может указывать на стресс
      if (data.heartRate > 90) stressIndicators++;
    }

    if (data.heartRateVariability) {
      totalIndicators++;
      // Низкая HRV часто указывает на стресс
      if (data.heartRateVariability < 20) stressIndicators++;
    }

    if (data.accelerometer) {
      totalIndicators++;
      // Высокая активность акселерометра может указывать на беспокойство
      const magnitude = Math.sqrt(
        data.accelerometer.x ** 2 + 
        data.accelerometer.y ** 2 + 
        data.accelerometer.z ** 2
      );
      if (magnitude > 15) stressIndicators++;
    }

    return totalIndicators > 0 ? stressIndicators / totalIndicators : 0;
  }

  private async triggerInterventions(stressLevel: number, anomalies: string[]): Promise<void> {
    const interventions = [];

    if (stressLevel > 0.8) {
      interventions.push({
        type: 'breathing',
        title: 'Дыхательная техника',
        description: 'Обнаружен повышенный стресс. Попробуйте технику 4-7-8',
        urgency: 'high'
      });
    }

    if (anomalies.includes('irregular_heart_rate')) {
      interventions.push({
        type: 'grounding',
        title: 'Техника заземления',
        description: 'Неровный пульс может указывать на тревогу. Попробуем заземление.',
        urgency: 'medium'
      });
    }

    // Отправляем уведомления
    for (const intervention of interventions) {
      await this.sendInterventionNotification(intervention);
    }
  }

  // Голосовой анализ эмоций
  async analyzeVoiceEmotion(audioData: string): Promise<EmotionRecognitionResult> {
    // Имитация анализа голоса (в реальном приложении использовался бы ML сервис)
    return {
      emotion: 'calm',
      confidence: 0.75,
      valence: 0.2,
      arousal: 0.3,
      timestamp: new Date()
    };
  }

  // Анализ текста для определения эмоций
  analyzeTextEmotion(text: string): EmotionRecognitionResult {
    const words = text.toLowerCase().split(' ');
    const emotionWords = {
      positive: ['хорошо', 'отлично', 'счастлив', 'радость', 'спокоен', 'уверен'],
      negative: ['плохо', 'грустно', 'тревога', 'стресс', 'болит', 'устал'],
      anger: ['злой', 'раздражен', 'бесит', 'ненавижу'],
      fear: ['боюсь', 'страшно', 'тревожно', 'переживаю']
    };

    let positiveScore = 0;
    let negativeScore = 0;
    let angerScore = 0;
    let fearScore = 0;

    words.forEach(word => {
      if (emotionWords.positive.includes(word)) positiveScore++;
      if (emotionWords.negative.includes(word)) negativeScore++;
      if (emotionWords.anger.includes(word)) angerScore++;
      if (emotionWords.fear.includes(word)) fearScore++;
    });

    let dominantEmotion = 'neutral';
    let confidence = 0.5;
    let valence = 0;

    if (positiveScore > 0) {
      dominantEmotion = 'positive';
      confidence = Math.min(positiveScore * 0.2 + 0.5, 1);
      valence = positiveScore * 0.5;
    } else if (negativeScore > 0) {
      dominantEmotion = 'negative';
      confidence = Math.min(negativeScore * 0.2 + 0.5, 1);
      valence = -negativeScore * 0.5;
    }

    if (angerScore > 0) {
      dominantEmotion = 'anger';
      confidence = Math.min(angerScore * 0.3 + 0.6, 1);
      valence = -angerScore * 0.7;
    }

    if (fearScore > 0) {
      dominantEmotion = 'fear';
      confidence = Math.min(fearScore * 0.3 + 0.6, 1);
      valence = -fearScore * 0.6;
    }

    return {
      emotion: dominantEmotion,
      confidence,
      valence: Math.max(-5, Math.min(5, valence)),
      arousal: Math.abs(valence) * 0.8,
      timestamp: new Date()
    };
  }

  // Интеллектуальные вопросы на основе контекста
  generateSmartQuestions(context: any): SmartQuestion[] {
    const questions = [];
    const currentHour = new Date().getHours();

    // Вопросы на основе времени дня
    if (currentHour >= 6 && currentHour < 12) {
      questions.push({
        id: 'morning_energy',
        text: 'Как ваш уровень энергии этим утром?',
        type: 'scale',
        min: 1,
        max: 5,
        labels: ['Очень низкий', 'Низкий', 'Средний', 'Высокий', 'Очень высокий']
      });
    } else if (currentHour >= 18) {
      questions.push({
        id: 'evening_reflection',
        text: 'Как прошел ваш день в целом?',
        type: 'scale',
        min: 1,
        max: 5,
        labels: ['Очень плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично']
      });
    }

    // Контекстуальные вопросы
    questions.push({
      id: 'coping_strategies',
      text: 'Какие стратегии преодоления вы используете сегодня?',
      type: 'multiple_choice',
      options: [
        'Дыхательные упражнения',
        'Физическая активность',
        'Медитация',
        'Общение с друзьями',
        'Творчество',
        'Чтение',
        'Музыка'
      ]
    });

    return questions;
  }

  // Предиктивная аналитика
  private async predictMoodTrends(moodEntries: MoodEntry[]): Promise<MoodPrediction[]> {
    // Простая линейная регрессия для демонстрации
    const trends = [];
    
    const moodTrend = this.calculateTrend(moodEntries.map(e => e.mood));
    const anxietyTrend = this.calculateTrend(moodEntries.map(e => e.anxiety));
    const energyTrend = this.calculateTrend(moodEntries.map(e => e.energy));

    trends.push({
      metric: 'mood',
      direction: moodTrend > 0 ? 'improving' : moodTrend < 0 ? 'declining' : 'stable',
      confidence: 0.75,
      timeframe: '7 days',
      predictedValue: this.predictNextValue(moodEntries.map(e => e.mood))
    });

    return trends;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((acc, y, x) => acc + x * y, 0);
    const sumX2 = values.reduce((acc, _, x) => acc + x * x, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private predictNextValue(values: number[]): number {
    const trend = this.calculateTrend(values);
    const lastValue = values[values.length - 1];
    return Math.max(1, Math.min(5, lastValue + trend));
  }
}

// Классы поддержки
class SensorManager {
  private monitoringActive = false;
  private eventListeners: { [key: string]: Function[] } = {};

  async collectBiometricData(): Promise<BiometricData> {
    // Имитация сбора биометрических данных
    // В реальном приложении здесь были бы вызовы к датчикам устройства
    return {
      heartRate: 72 + Math.random() * 20,
      heartRateVariability: 35 + Math.random() * 15,
      temperature: 36.5 + Math.random() * 0.8,
      accelerometer: {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1
      },
      gyroscope: {
        x: Math.random() * 0.2 - 0.1,
        y: Math.random() * 0.2 - 0.1,
        z: Math.random() * 0.2 - 0.1
      },
      timestamp: new Date()
    };
  }

  startContinuousMonitoring(sensors: any): void {
    this.monitoringActive = true;
    
    // Имитация непрерывного мониторинга
    const interval = setInterval(async () => {
      if (!this.monitoringActive) {
        clearInterval(interval);
        return;
      }
      
      const data = await this.collectBiometricData();
      this.emit('dataReceived', data);
    }, 10000); // Каждые 10 секунд
  }

  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  emit(event: string, data: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  stopMonitoring(): void {
    this.monitoringActive = false;
  }
}

class EmotionAnalyzer {
  analyzeEmotion(data: any): EmotionalState {
    // Заглушка для анализа эмоций
    return {
      valence: 0,
      arousal: 0,
      dominance: 0,
      confidence: 0.5,
      detectedEmotions: ['neutral'],
      intensity: 2
    };
  }
}

class PatternDetector {
  detectPatterns(data: MoodEntry[]): any {
    // Заглушка для обнаружения паттернов
    return {};
  }
}

// Интерфейсы
interface ComprehensiveMoodData {
  timestamp: Date;
  biometrics: BiometricData;
  context: any;
  quickMoodCheck: SmartQuestion[];
  suggestedActivities: string[];
}

interface MoodAnalysis {
  patterns: any;
  predictions: MoodPrediction[];
  recommendations: string[];
  riskAssessment: RiskAssessment;
  insights: string[];
}

interface MoodPrediction {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  confidence: number;
  timeframe: string;
  predictedValue: number;
}

interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

interface SmartQuestion {
  id: string;
  text: string;
  type: 'scale' | 'multiple_choice' | 'text' | 'boolean';
  min?: number;
  max?: number;
  labels?: string[];
  options?: string[];
}

export default AdvancedMoodTracker;