// Интерактивные медитации с биофидбэк и адаптивными сценариями

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  category: 'mindfulness' | 'breathing' | 'body_scan' | 'loving_kindness' | 'visualization' | 'movement';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // в минутах
  adaptiveDuration: boolean; // может ли меняться продолжительность
  biofeedbackEnabled: boolean;
  personalizedContent: boolean;
  
  // Структура медитации
  phases: MeditationPhase[];
  
  // Биофидбэк настройки
  biofeedbackConfig?: BiofeedbackConfig;
  
  // Персонализация
  adaptiveElements?: AdaptiveElement[];
  
  // Мультимедиа
  backgroundSounds?: BackgroundSound[];
  guidedVoice?: GuidedVoiceOptions;
  visualEffects?: VisualEffect[];
}

export interface MeditationPhase {
  id: string;
  name: string;
  duration: number;
  instructions: Instruction[];
  adaptiveRules?: AdaptiveRule[];
  biofeedbackTargets?: BiofeedbackTarget[];
}

export interface Instruction {
  id: string;
  text: string;
  audioFile?: string;
  timing: number; // когда произносить (в секундах от начала фазы)
  importance: 'critical' | 'important' | 'optional';
  adaptiveVariants?: string[]; // альтернативные формулировки
}

export interface BiofeedbackConfig {
  heartRate: {
    enabled: boolean;
    target: { min: number; max: number };
    adaptiveGuiding: boolean;
  };
  heartRateVariability: {
    enabled: boolean;
    target: number;
    coherenceThreshold: number;
  };
  breathing: {
    enabled: boolean;
    targetRate: number; // вдохов в минуту
    adaptiveRhythm: boolean;
  };
  stressLevel: {
    enabled: boolean;
    maxThreshold: number;
  };
}

export interface AdaptiveRule {
  condition: string; // 'heartRate > 100', 'stressLevel > 0.7'
  action: 'extend_phase' | 'shorten_phase' | 'change_instruction' | 'add_calming' | 'increase_challenge';
  parameters?: any;
}

export interface BiofeedbackTarget {
  metric: 'heartRate' | 'hrv' | 'breathingRate' | 'stressLevel';
  target: number;
  tolerance: number;
  feedback: FeedbackMethod[];
}

export interface FeedbackMethod {
  type: 'visual' | 'audio' | 'haptic';
  method: string; // 'breathing_guide', 'heart_coherence', 'stress_indicator'
  intensity: number; // 0-1
}

export class InteractiveMeditationEngine {
  private biometricMonitor: BiometricMonitor;
  private adaptationEngine: AdaptationEngine;
  private currentSession: ActiveMeditationSession | null = null;
  
  constructor() {
    this.biometricMonitor = new BiometricMonitor();
    this.adaptationEngine = new AdaptationEngine();
  }

  // Запуск персонализированной медитации
  async startMeditation(sessionId: string, userPreferences?: UserMeditationPreferences): Promise<void> {
    const session = await this.loadMeditationSession(sessionId);
    const personalizedSession = await this.personalizeMeditation(session, userPreferences);
    
    this.currentSession = {
      ...personalizedSession,
      startTime: new Date(),
      currentPhase: 0,
      biometricData: [],
      adaptations: []
    };

    // Начинаем биофидбэк мониторинг
    if (personalizedSession.biofeedbackEnabled) {
      await this.biometricMonitor.startSession(personalizedSession.biofeedbackConfig!);
    }

    // Запускаем медитацию
    await this.runMeditationSession();
  }

  private async runMeditationSession(): Promise<void> {
    if (!this.currentSession) return;

    for (let phaseIndex = 0; phaseIndex < this.currentSession.phases.length; phaseIndex++) {
      this.currentSession.currentPhase = phaseIndex;
      const phase = this.currentSession.phases[phaseIndex];
      
      await this.runMeditationPhase(phase);
      
      // Проверяем адаптивные правила между фазами
      const adaptations = await this.checkAdaptiveRules(phase);
      if (adaptations.length > 0) {
        await this.applyAdaptations(adaptations);
      }
    }

    await this.completeMeditation();
  }

  private async runMeditationPhase(phase: MeditationPhase): Promise<void> {
    const startTime = Date.now();
    let phaseDuration = phase.duration * 60 * 1000; // конвертируем в миллисекунды
    
    // Запускаем инструкции
    const instructionPromises = phase.instructions.map(instruction => 
      this.scheduleInstruction(instruction, startTime)
    );

    // Мониторинг биометрики в реальном времени
    const biometricInterval = setInterval(async () => {
      if (!this.currentSession || Date.now() - startTime > phaseDuration) {
        clearInterval(biometricInterval);
        return;
      }

      await this.processBiometricFeedback(phase);
    }, 2000); // каждые 2 секунды

    // Ждем завершения фазы
    await new Promise(resolve => setTimeout(resolve, phaseDuration));
    
    clearInterval(biometricInterval);
    await Promise.all(instructionPromises);
  }

  private async processBiometricFeedback(phase: MeditationPhase): Promise<void> {
    if (!this.currentSession?.biofeedbackEnabled) return;

    const currentBiometrics = await this.biometricMonitor.getCurrentData();
    this.currentSession.biometricData.push(currentBiometrics);

    // Анализируем каждую биофидбэк цель
    for (const target of phase.biofeedbackTargets || []) {
      await this.processBiofeedbackTarget(target, currentBiometrics);
    }
  }

  private async processBiofeedbackTarget(
    target: BiofeedbackTarget, 
    biometrics: BiometricReading
  ): Promise<void> {
    let currentValue = 0;
    
    switch (target.metric) {
      case 'heartRate':
        currentValue = biometrics.heartRate || 0;
        break;
      case 'hrv':
        currentValue = biometrics.heartRateVariability || 0;
        break;
      case 'breathingRate':
        currentValue = biometrics.breathingRate || 0;
        break;
      case 'stressLevel':
        currentValue = this.calculateStressLevel(biometrics);
        break;
    }

    const deviation = Math.abs(currentValue - target.target);
    const isInRange = deviation <= target.tolerance;

    if (!isInRange) {
      // Активируем фидбэк методы
      for (const feedback of target.feedback) {
        await this.activateFeedback(feedback, deviation, target);
      }
    }
  }

  private async activateFeedback(
    feedback: FeedbackMethod, 
    deviation: number, 
    target: BiofeedbackTarget
  ): Promise<void> {
    switch (feedback.type) {
      case 'visual':
        await this.showVisualFeedback(feedback, deviation);
        break;
      case 'audio':
        await this.playAudioFeedback(feedback, deviation);
        break;
      case 'haptic':
        await this.triggerHapticFeedback(feedback, deviation);
        break;
    }
  }

  // Персонализация медитации
  private async personalizeMeditation(
    session: MeditationSession, 
    preferences?: UserMeditationPreferences
  ): Promise<MeditationSession> {
    const personalizedSession = { ...session };

    if (preferences) {
      // Адаптируем продолжительность
      if (preferences.preferredDuration && session.adaptiveDuration) {
        personalizedSession.duration = preferences.preferredDuration;
        personalizedSession.phases = this.scalePhaseDurations(
          session.phases, 
          preferences.preferredDuration / session.duration
        );
      }

      // Адаптируем инструкции
      if (preferences.experienceLevel) {
        personalizedSession.phases = this.adaptInstructions(
          session.phases, 
          preferences.experienceLevel
        );
      }

      // Настраиваем биофидбэк
      if (preferences.biofeedbackPreferences) {
        personalizedSession.biofeedbackConfig = this.customizeBiofeedback(
          session.biofeedbackConfig,
          preferences.biofeedbackPreferences
        );
      }
    }

    return personalizedSession;
  }

  // Адаптивные алгоритмы
  private async checkAdaptiveRules(phase: MeditationPhase): Promise<Adaptation[]> {
    const adaptations: Adaptation[] = [];
    
    if (!phase.adaptiveRules || !this.currentSession) return adaptations;

    const latestBiometrics = this.getLatestBiometrics();
    
    for (const rule of phase.adaptiveRules) {
      if (await this.evaluateCondition(rule.condition, latestBiometrics)) {
        adaptations.push({
          rule,
          timestamp: new Date(),
          reason: `Condition met: ${rule.condition}`
        });
      }
    }

    return adaptations;
  }

  private async evaluateCondition(condition: string, biometrics: BiometricReading): Promise<boolean> {
    // Простой парсер условий (в реальном приложении использовался бы более сложный)
    if (condition.includes('heartRate >')) {
      const threshold = parseInt(condition.split('> ')[1]);
      return (biometrics.heartRate || 0) > threshold;
    }
    
    if (condition.includes('stressLevel >')) {
      const threshold = parseFloat(condition.split('> ')[1]);
      return this.calculateStressLevel(biometrics) > threshold;
    }

    return false;
  }

  // Медитации для конкретных ситуаций
  generateEmergencyMeditation(situation: 'panic_attack' | 'high_craving' | 'severe_stress'): MeditationSession {
    switch (situation) {
      case 'panic_attack':
        return {
          id: 'emergency_panic',
          title: 'Экстренная помощь при панике',
          description: 'Быстрая техника для снижения панической атаки',
          category: 'breathing',
          difficulty: 'beginner',
          duration: 5,
          adaptiveDuration: true,
          biofeedbackEnabled: true,
          personalizedContent: true,
          phases: [
            {
              id: 'grounding',
              name: 'Заземление',
              duration: 2,
              instructions: [
                {
                  id: 'ground_1',
                  text: 'Почувствуйте свои ноги на полу. Вы в безопасности здесь и сейчас.',
                  timing: 0,
                  importance: 'critical'
                }
              ],
              biofeedbackTargets: [
                {
                  metric: 'heartRate',
                  target: 80,
                  tolerance: 10,
                  feedback: [
                    { type: 'visual', method: 'breathing_guide', intensity: 0.8 },
                    { type: 'audio', method: 'calming_tone', intensity: 0.6 }
                  ]
                }
              ]
            },
            {
              id: 'breathing',
              name: 'Дыхание 4-7-8',
              duration: 3,
              instructions: [
                {
                  id: 'breath_1',
                  text: 'Вдохните через нос на 4 счета',
                  timing: 0,
                  importance: 'critical'
                },
                {
                  id: 'breath_2',
                  text: 'Задержите дыхание на 7 счетов',
                  timing: 4,
                  importance: 'critical'
                },
                {
                  id: 'breath_3',
                  text: 'Выдохните через рот на 8 счетов',
                  timing: 11,
                  importance: 'critical'
                }
              ]
            }
          ]
        };

      case 'high_craving':
        return {
          id: 'emergency_craving',
          title: 'Работа с острой тягой',
          description: 'Техника серфинга по волне тяги',
          category: 'mindfulness',
          difficulty: 'beginner',
          duration: 10,
          adaptiveDuration: true,
          biofeedbackEnabled: true,
          personalizedContent: true,
          phases: [
            {
              id: 'acknowledge',
              name: 'Признание',
              duration: 3,
              instructions: [
                {
                  id: 'ack_1',
                  text: 'Я замечаю, что у меня есть тяга. Это временное ощущение.',
                  timing: 0,
                  importance: 'critical'
                }
              ]
            },
            {
              id: 'observe',
              name: 'Наблюдение',
              duration: 4,
              instructions: [
                {
                  id: 'obs_1',
                  text: 'Где в теле я чувствую эту тягу? Какая она по размеру, форме, температуре?',
                  timing: 0,
                  importance: 'important'
                }
              ]
            },
            {
              id: 'surf',
              name: 'Серфинг',
              duration: 3,
              instructions: [
                {
                  id: 'surf_1',
                  text: 'Представьте тягу как волну. Она поднимается, достигает пика и обязательно спадет.',
                  timing: 0,
                  importance: 'critical'
                }
              ]
            }
          ]
        };

      default:
        return this.getDefaultEmergencyMeditation();
    }
  }

  // Аналитика и отчеты
  async generateMeditationReport(sessionId: string): Promise<MeditationReport> {
    const session = this.currentSession;
    if (!session) throw new Error('No active session');

    const biometricAnalysis = this.analyzeBiometricData(session.biometricData);
    const adaptationAnalysis = this.analyzeAdaptations(session.adaptations);
    
    return {
      sessionId,
      duration: (Date.now() - session.startTime.getTime()) / 1000 / 60, // в минутах
      completionRate: session.currentPhase / session.phases.length,
      biometricSummary: biometricAnalysis,
      adaptations: adaptationAnalysis,
      recommendations: this.generateRecommendations(biometricAnalysis, adaptationAnalysis),
      nextSessionSuggestions: this.suggestNextSessions(session)
    };
  }

  private calculateStressLevel(biometrics: BiometricReading): number {
    // Упрощенный расчет уровня стресса
    let stress = 0;
    
    if (biometrics.heartRate && biometrics.heartRate > 90) {
      stress += (biometrics.heartRate - 90) / 50; // нормализуем
    }
    
    if (biometrics.heartRateVariability && biometrics.heartRateVariability < 20) {
      stress += (20 - biometrics.heartRateVariability) / 20;
    }
    
    return Math.min(stress, 1); // ограничиваем до 1
  }

  private getDefaultEmergencyMeditation(): MeditationSession {
    return {
      id: 'emergency_default',
      title: 'Быстрое успокоение',
      description: 'Универсальная техника для быстрого успокоения',
      category: 'breathing',
      difficulty: 'beginner',
      duration: 5,
      adaptiveDuration: false,
      biofeedbackEnabled: false,
      personalizedContent: false,
      phases: []
    };
  }
}

// Поддерживающие классы и интерфейсы
class BiometricMonitor {
  async startSession(config: BiofeedbackConfig): Promise<void> {
    // Имитация запуска мониторинга биометрики
  }

  async getCurrentData(): Promise<BiometricReading> {
    return {
      heartRate: 75 + Math.random() * 20,
      heartRateVariability: 30 + Math.random() * 20,
      breathingRate: 12 + Math.random() * 6,
      timestamp: new Date()
    };
  }
}

class AdaptationEngine {
  // Логика адаптации медитации
}

interface BiometricReading {
  heartRate?: number;
  heartRateVariability?: number;
  breathingRate?: number;
  timestamp: Date;
}

interface ActiveMeditationSession extends MeditationSession {
  startTime: Date;
  currentPhase: number;
  biometricData: BiometricReading[];
  adaptations: Adaptation[];
}

interface Adaptation {
  rule: AdaptiveRule;
  timestamp: Date;
  reason: string;
}

interface UserMeditationPreferences {
  preferredDuration?: number;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  biofeedbackPreferences?: Partial<BiofeedbackConfig>;
  voicePreference?: 'male' | 'female' | 'none';
  backgroundSounds?: string[];
}

interface MeditationReport {
  sessionId: string;
  duration: number;
  completionRate: number;
  biometricSummary: any;
  adaptations: any;
  recommendations: string[];
  nextSessionSuggestions: string[];
}

interface AdaptiveElement {
  id: string;
  type: 'instruction' | 'duration' | 'background';
  conditions: string[];
  variants: any[];
}

interface BackgroundSound {
  id: string;
  name: string;
  file: string;
  category: 'nature' | 'ambient' | 'binaural' | 'silence';
  volume: number;
}

interface GuidedVoiceOptions {
  gender: 'male' | 'female';
  tone: 'calm' | 'energetic' | 'neutral';
  pace: 'slow' | 'normal' | 'fast';
  language: string;
}

interface VisualEffect {
  id: string;
  type: 'breathing_guide' | 'heart_coherence' | 'progress' | 'nature_scene';
  parameters: any;
}

export default InteractiveMeditationEngine;