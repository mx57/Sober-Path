import { useState, useEffect } from 'react';

// Генератор встроенных звуков
export class SoundGenerator {
  private static audioContext: AudioContext | null = null;
  
  static async getAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Разблокировка аудио контекста для мобильных
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    }
    return this.audioContext;
  }

  // Генерация белого шума
  static async generateWhiteNoise(duration: number = 60): Promise<AudioBuffer> {
    const context = await this.getAudioContext();
    const buffer = context.createBuffer(2, context.sampleRate * duration, context.sampleRate);
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  }

  // Генерация розового шума
  static async generatePinkNoise(duration: number = 60): Promise<AudioBuffer> {
    const context = await this.getAudioContext();
    const buffer = context.createBuffer(2, context.sampleRate * duration, context.sampleRate);
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  // Генерация бинауральных битов
  static async generateBinauralBeats(baseFreq: number, beatFreq: number, duration: number = 60): Promise<AudioBuffer> {
    const context = await this.getAudioContext();
    const buffer = context.createBuffer(2, context.sampleRate * duration, context.sampleRate);
    
    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);
    
    for (let i = 0; i < buffer.length; i++) {
      const time = i / context.sampleRate;
      leftData[i] = Math.sin(2 * Math.PI * baseFreq * time) * 0.3;
      rightData[i] = Math.sin(2 * Math.PI * (baseFreq + beatFreq) * time) * 0.3;
    }
    
    return buffer;
  }

  // Генерация звуков природы
  static async generateRainSound(duration: number = 60): Promise<AudioBuffer> {
    const context = await this.getAudioContext();
    const buffer = context.createBuffer(2, context.sampleRate * duration, context.sampleRate);
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        // Комбинация различных частот для имитации дождя
        const time = i / context.sampleRate;
        let sample = 0;
        
        // Высокочастотные компоненты (капли)
        for (let f = 2000; f < 8000; f += 500) {
          sample += Math.sin(2 * Math.PI * f * time) * Math.random() * 0.05;
        }
        
        // Низкочастотный шум (фон)
        sample += (Math.random() - 0.5) * 0.3;
        
        // Фильтрация
        data[i] = sample * 0.5;
      }
    }
    return buffer;
  }

  static async generateOceanWaves(duration: number = 60): Promise<AudioBuffer> {
    const context = await this.getAudioContext();
    const buffer = context.createBuffer(2, context.sampleRate * duration, context.sampleRate);
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        const time = i / context.sampleRate;
        
        // Медленные волны (0.1-0.5 Hz)
        const slowWave = Math.sin(2 * Math.PI * 0.2 * time) * 0.4;
        // Средние волны (0.5-2 Hz)  
        const mediumWave = Math.sin(2 * Math.PI * 1 * time) * 0.3;
        // Пена и брызги (высокие частоты)
        const foam = (Math.random() - 0.5) * 0.2 * Math.abs(slowWave);
        
        data[i] = (slowWave + mediumWave + foam) * 0.6;
      }
    }
    return buffer;
  }

  // Генерация частот Сольфеджио
  static async generateSolfeggio(frequency: number, duration: number = 60): Promise<AudioBuffer> {
    const context = await this.getAudioContext();
    const buffer = context.createBuffer(2, context.sampleRate * duration, context.sampleRate);
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        const time = i / context.sampleRate;
        
        // Основная частота
        let sample = Math.sin(2 * Math.PI * frequency * time) * 0.4;
        
        // Гармоники для более богатого звука
        sample += Math.sin(2 * Math.PI * frequency * 2 * time) * 0.1;
        sample += Math.sin(2 * Math.PI * frequency * 3 * time) * 0.05;
        
        // Медленная модуляция амплитуды
        const envelope = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * time);
        
        data[i] = sample * envelope;
      }
    }
    return buffer;
  }
}

export interface GeneratedSound {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  generator: () => Promise<AudioBuffer>;
  benefits: string[];
}

export const generatedSounds: GeneratedSound[] = [
  // Звуки природы
  {
    id: 'rain',
    name: 'Дождь',
    description: 'Успокаивающий звук дождя для релаксации',
    category: 'nature',
    duration: 300,
    generator: () => SoundGenerator.generateRainSound(300),
    benefits: ['Снижение стресса', 'Улучшение концентрации', 'Глубокий сон']
  },
  {
    id: 'ocean',
    name: 'Океанские волны',
    description: 'Ритмичный шум океанских волн',
    category: 'nature',
    duration: 300,
    generator: () => SoundGenerator.generateOceanWaves(300),
    benefits: ['Медитация', 'Снятие тревожности', 'Восстановление энергии']
  },

  // Терапевтические шумы
  {
    id: 'white-noise',
    name: 'Белый шум',
    description: 'Равномерный белый шум для маскировки звуков',
    category: 'therapeutic',
    duration: 600,
    generator: () => SoundGenerator.generateWhiteNoise(600),
    benefits: ['Улучшение сна', 'Концентрация', 'Блокировка отвлекающих звуков']
  },
  {
    id: 'pink-noise',
    name: 'Розовый шум',
    description: 'Более мягкий розовый шум для глубокого сна',
    category: 'therapeutic',
    duration: 600,
    generator: () => SoundGenerator.generatePinkNoise(600),
    benefits: ['Глубокий сон', 'Восстановление памяти', 'Снижение стресса']
  },

  // Бинауральные биты
  {
    id: 'alpha-waves',
    name: 'Альфа-волны (10 Гц)',
    description: 'Бинауральные биты для состояния расслабленной концентрации',
    category: 'binaural',
    duration: 900,
    generator: () => SoundGenerator.generateBinauralBeats(200, 10, 900),
    benefits: ['Медитация', 'Творчество', 'Снижение тревожности']
  },
  {
    id: 'theta-waves',
    name: 'Тета-волны (6 Гц)',
    description: 'Глубокие тета-волны для медитации и восстановления',
    category: 'binaural',
    duration: 900,
    generator: () => SoundGenerator.generateBinauralBeats(150, 6, 900),
    benefits: ['Глубокая медитация', 'Исцеление травм', 'Интуиция']
  },
  {
    id: 'delta-waves',
    name: 'Дельта-волны (3 Гц)',
    description: 'Медленные дельта-волны для глубокого сна',
    category: 'binaural',
    duration: 1800,
    generator: () => SoundGenerator.generateBinauralBeats(100, 3, 1800),
    benefits: ['Глубокий сон', 'Физическое восстановление', 'Гормональная регуляция']
  },

  // Частоты Сольфеджио
  {
    id: 'solfeggio-174',
    name: '174 Гц - Обезболивание',
    description: 'Частота для снятия боли и напряжения',
    category: 'solfeggio',
    duration: 1200,
    generator: () => SoundGenerator.generateSolfeggio(174, 1200),
    benefits: ['Снятие боли', 'Физическое исцеление', 'Заземление']
  },
  {
    id: 'solfeggio-285',
    name: '285 Гц - Восстановление',
    description: 'Частота для восстановления тканей и органов',
    category: 'solfeggio',
    duration: 1200,
    generator: () => SoundGenerator.generateSolfeggio(285, 1200),
    benefits: ['Регенерация клеток', 'Восстановление энергии', 'Омоложение']
  },
  {
    id: 'solfeggio-396',
    name: '396 Гц - Освобождение от страха',
    description: 'Частота для освобождения от страхов и вины',
    category: 'solfeggio',
    duration: 1200,
    generator: () => SoundGenerator.generateSolfeggio(396, 1200),
    benefits: ['Освобождение от страхов', 'Преодоление вины', 'Трансформация']
  },
  {
    id: 'solfeggio-417',
    name: '417 Гц - Изменения',
    description: 'Частота для облегчения изменений и преобразований',
    category: 'solfeggio',
    duration: 1200,
    generator: () => SoundGenerator.generateSolfeggio(417, 1200),
    benefits: ['Принятие изменений', 'Устранение негативных паттернов', 'Новые начинания']
  },
  {
    id: 'solfeggio-528',
    name: '528 Гц - Любовь и исцеление',
    description: 'Частота любви и восстановления ДНК',
    category: 'solfeggio',
    duration: 1200,
    generator: () => SoundGenerator.generateSolfeggio(528, 1200),
    benefits: ['Исцеление на клеточном уровне', 'Любовь к себе', 'Гармония']
  },
  {
    id: 'solfeggio-639',
    name: '639 Гц - Отношения',
    description: 'Частота для улучшения отношений и коммуникации',
    category: 'solfeggio',
    duration: 1200,
    generator: () => SoundGenerator.generateSolfeggio(639, 1200),
    benefits: ['Улучшение отношений', 'Эмпатия', 'Прощение']
  },
  {
    id: 'solfeggio-741',
    name: '741 Гц - Очищение',
    description: 'Частота для очищения и детоксикации',
    category: 'solfeggio',
    duration: 1200,
    generator: () => SoundGenerator.generateSolfeggio(741, 1200),
    benefits: ['Детоксикация', 'Очищение сознания', 'Ясность мышления']
  },
  {
    id: 'solfeggio-852',
    name: '852 Гц - Интуиция',
    description: 'Частота для развития интуиции и духовного порядка',
    category: 'solfeggio',
    duration: 1200,
    generator: () => SoundGenerator.generateSolfeggio(852, 1200),
    benefits: ['Развитие интуиции', 'Духовное пробуждение', 'Внутренняя мудрость']
  },
  {
    id: 'solfeggio-963',
    name: '963 Гц - Единство',
    description: 'Частота для активации шишковидной железы и единения',
    category: 'solfeggio',
    duration: 1200,
    generator: () => SoundGenerator.generateSolfeggio(963, 1200),
    benefits: ['Единство с вселенной', 'Высшее сознание', 'Просветление']
  }
];

export interface HypnotherapySession {
  id: string;
  title: string;
  description: string;
  duration: number; // в минутах
  category: 'addiction' | 'stress' | 'sleep' | 'confidence' | 'trauma';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  script: string[];
  backgroundSound?: string;
  benefits: string[];
}

export const hypnotherapySessions: HypnotherapySession[] = [
  {
    id: 'addiction-freedom',
    title: 'Освобождение от зависимости',
    description: 'Глубокая гипнотерапевтическая сессия для преодоления алкогольной зависимости',
    duration: 25,
    category: 'addiction',
    difficulty: 'intermediate',
    script: [
      'Устройтесь поудобнее и закройте глаза...',
      'Сделайте глубокий вдох через нос... и медленный выдох через рот...',
      'Почувствуйте, как ваше тело начинает расслабляться...',
      'С каждым вдохом вы погружаетесь глубже в состояние покоя...',
      'Представьте себя в будущем - здорового, сильного, свободного...',
      'Вы полностью контролируете свои выборы и решения...',
      'Алкоголь больше не имеет власти над вами...',
      'Вы выбираете здоровье, ясность и внутреннюю силу...',
      'Каждая клетка вашего тела наполняется исцеляющей энергией...',
      'Вы достойны любви, здоровья и счастья...',
      'Теперь медленно возвращайтесь в настоящее...',
      'Сохраните это чувство силы и свободы...',
      'Откройте глаза, когда будете готовы...'
    ],
    backgroundSound: 'theta-waves',
    benefits: ['Снижение тяги', 'Укрепление мотивации', 'Повышение самоконтроля']
  },
  {
    id: 'stress-relief',
    title: 'Глубокое снятие стресса',
    description: 'Расслабляющая сессия для снятия стресса и напряжения',
    duration: 20,
    category: 'stress',
    difficulty: 'beginner',
    script: [
      'Найдите удобное положение и мягко закройте глаза...',
      'Начнем с дыхания... Вдох на 4 счета... Задержите... Выдох на 6...',
      'Представьте теплый золотой свет, окутывающий вашу голову...',
      'Этот свет медленно спускается, расслабляя каждую мышцу...',
      'Ваши плечи опускаются... Челюсть расслабляется...',
      'Руки становятся тяжелыми и теплыми...',
      'Весь стресс и напряжение покидают ваше тело...',
      'Вы находитесь в безопасном месте полного покоя...',
      'Позвольте себе полностью отпустить все заботы...',
      'Насладитесь этим моментом глубокого расслабления...',
      'Когда будете готовы, медленно вернитесь в настоящее...'
    ],
    backgroundSound: 'ocean',
    benefits: ['Глубокое расслабление', 'Снижение кортизола', 'Восстановление нервной системы']
  },
  {
    id: 'sleep-induction',
    title: 'Здоровый сон',
    description: 'Гипнотерапевтическая сессия для улучшения качества сна',
    duration: 30,
    category: 'sleep',
    difficulty: 'beginner',
    script: [
      'Лягте удобно и позвольте глазам закрыться...',
      'Ваше тело тяжелеет с каждым выдохом...',
      'Представьте себя на мягком облаке...',
      'Это облако медленно несет вас в мир грез...',
      'Ваши мысли становятся все более туманными...',
      'Разум замедляется... Тело полностью расслабляется...',
      'Вы дрейфуете в состоянии глубокого покоя...',
      'Каждая клетка вашего тела восстанавливается...',
      'Завтра вы проснетесь отдохнувшим и энергичным...',
      'Позвольте себе погрузиться в целительный сон...'
    ],
    backgroundSound: 'delta-waves',
    benefits: ['Быстрое засыпание', 'Глубокий сон', 'Утреннее восстановление']
  },
  {
    id: 'confidence-building',
    title: 'Укрепление уверенности',
    description: 'Сессия для повышения самооценки и внутренней силы',
    duration: 22,
    category: 'confidence',
    difficulty: 'intermediate',
    script: [
      'Сядьте прямо, почувствуйте свою силу и закройте глаза...',
      'Представьте яркий свет в области вашего сердца...',
      'Этот свет - ваша внутренняя сила и мудрость...',
      'Вы видите себя уверенным и спокойным...',
      'Каждый вызов делает вас только сильнее...',
      'Вы доверяете своим способностям и интуиции...',
      'Прошлые ошибки - это уроки, которые привели к мудрости...',
      'Вы достойны успеха и счастья...',
      'Ваша уверенность растет с каждым днем...',
      'Вы излучаете силу и спокойствие...',
      'Эта уверенность останется с вами навсегда...'
    ],
    backgroundSound: 'solfeggio-528',
    benefits: ['Повышение самооценки', 'Внутренняя сила', 'Преодоление сомнений']
  },
  {
    id: 'trauma-healing',
    title: 'Исцеление травм',
    description: 'Деликатная работа с травматическим опытом',
    duration: 35,
    category: 'trauma',
    difficulty: 'advanced',
    script: [
      'Создайте вокруг себя защитную оболочку света...',
      'Вы находитесь в полной безопасности...',
      'Представьте себя маленьким ребенком...',
      'Обнимите этого ребенка с любовью и пониманием...',
      'Скажите ему: "Ты не виноват в том, что произошло"...',
      'Прошлое не определяет ваше будущее...',
      'Каждый день вы становитесь сильнее...',
      'Вы имеете право на счастье и покой...',
      'Позвольте исцеляющему свету проникнуть в каждую клетку...',
      'Травма теряет свою власть над вами...',
      'Вы целостны, здоровы и свободны...'
    ],
    backgroundSound: 'solfeggio-396',
    benefits: ['Исцеление травм', 'Эмоциональное освобождение', 'Внутренний мир']
  }
];

// Улучшенный аудио плеер
export class AdvancedAudioEngine {
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private audioSources: Map<string, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private context: AudioContext | null = null;

  async initialize() {
    this.context = await SoundGenerator.getAudioContext();
    
    // Предзагрузка основных звуков
    await this.preloadEssentialSounds();
  }

  private async preloadEssentialSounds() {
    const essential = ['rain', 'ocean', 'white-noise', 'alpha-waves', 'solfeggio-528'];
    
    for (const soundId of essential) {
      const sound = generatedSounds.find(s => s.id === soundId);
      if (sound) {
        try {
          const buffer = await sound.generator();
          this.audioBuffers.set(soundId, buffer);
        } catch (error) {
          console.warn(`Failed to preload sound: ${soundId}`, error);
        }
      }
    }
  }

  async playSound(soundId: string, loop: boolean = true, volume: number = 0.5) {
    if (!this.context) await this.initialize();
    
    // Остановка предыдущего звука
    this.stopSound(soundId);
    
    let buffer = this.audioBuffers.get(soundId);
    if (!buffer) {
      const sound = generatedSounds.find(s => s.id === soundId);
      if (!sound) throw new Error(`Sound not found: ${soundId}`);
      
      buffer = await sound.generator();
      this.audioBuffers.set(soundId, buffer);
    }

    const source = this.context!.createBufferSource();
    const gainNode = this.context!.createGain();
    
    source.buffer = buffer;
    source.loop = loop;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.context!.destination);
    
    this.audioSources.set(soundId, source);
    this.gainNodes.set(soundId, gainNode);
    
    source.start(0);
    return source;
  }

  stopSound(soundId: string) {
    const source = this.audioSources.get(soundId);
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Источник уже остановлен
      }
      this.audioSources.delete(soundId);
      this.gainNodes.delete(soundId);
    }
  }

  setVolume(soundId: string, volume: number) {
    const gainNode = this.gainNodes.get(soundId);
    if (gainNode) {
      gainNode.gain.setValueAtTime(volume, this.context!.currentTime);
    }
  }

  fadeIn(soundId: string, duration: number = 2) {
    const gainNode = this.gainNodes.get(soundId);
    if (gainNode) {
      gainNode.gain.setValueAtTime(0, this.context!.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, this.context!.currentTime + duration);
    }
  }

  fadeOut(soundId: string, duration: number = 2) {
    const gainNode = this.gainNodes.get(soundId);
    if (gainNode) {
      gainNode.gain.setValueAtTime(gainNode.gain.value, this.context!.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, this.context!.currentTime + duration);
      
      setTimeout(() => {
        this.stopSound(soundId);
      }, duration * 1000);
    }
  }

  stopAll() {
    for (const soundId of this.audioSources.keys()) {
      this.stopSound(soundId);
    }
  }
}

// Экземпляр аудио движка
export const audioEngine = new AdvancedAudioEngine();