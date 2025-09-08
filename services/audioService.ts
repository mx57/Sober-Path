import { Audio } from 'expo-av';

export interface RelaxingSound {
  id: string;
  name: string;
  description: string;
  duration: number;
  file: string;
  category: 'nature' | 'binaural' | 'white_noise' | 'meditation';
  frequency?: string;
}

export interface HypnotherapySession {
  id: string;
  title: string;
  description: string;
  duration: number;
  script: string[];
  backgroundSound?: string;
  category: 'addiction' | 'anxiety' | 'confidence' | 'sleep';
  level: 'beginner' | 'intermediate' | 'advanced';
}

export const relaxingSounds: RelaxingSound[] = [
  {
    id: '1',
    name: 'Звуки дождя',
    description: 'Мягкий дождь для глубокого расслабления и снятия стресса',
    duration: 1800, // 30 минут
    file: 'rain.mp3',
    category: 'nature'
  },
  {
    id: '2',
    name: 'Океанские волны',
    description: 'Ритмичные звуки прибоя для медитации и успокоения',
    duration: 2400, // 40 минут
    file: 'ocean.mp3',
    category: 'nature'
  },
  {
    id: '3',
    name: 'Лесные звуки',
    description: 'Пение птиц и шелест листьев для естественного расслабления',
    duration: 2700, // 45 минут
    file: 'forest.mp3',
    category: 'nature'
  },
  {
    id: '4',
    name: 'Бинауральные биты 10 Гц',
    description: 'Альфа-волны для снижения стресса и тревожности',
    duration: 1200, // 20 минут
    file: 'binaural_10hz.mp3',
    category: 'binaural',
    frequency: '10 Гц (Альфа)'
  },
  {
    id: '5',
    name: 'Бинауральные биты 6 Гц',
    description: 'Тета-волны для глубокой медитации и самоисцеления',
    duration: 1800, // 30 минут
    file: 'binaural_6hz.mp3',
    category: 'binaural',
    frequency: '6 Гц (Тета)'
  },
  {
    id: '6',
    name: 'Бинауральные биты 40 Гц',
    description: 'Гамма-волны для повышения концентрации и когнитивных функций',
    duration: 900, // 15 минут
    file: 'binaural_40hz.mp3',
    category: 'binaural',
    frequency: '40 Гц (Гамма)'
  },
  {
    id: '7',
    name: 'Белый шум',
    description: 'Равномерный фон для блокировки отвлекающих звуков',
    duration: 3600, // 60 минут
    file: 'white_noise.mp3',
    category: 'white_noise'
  },
  {
    id: '8',
    name: 'Розовый шум',
    description: 'Более мягкий шум для улучшения качества сна',
    duration: 3600, // 60 минут
    file: 'pink_noise.mp3',
    category: 'white_noise'
  },
  {
    id: '9',
    name: 'Тибетские поющие чаши',
    description: 'Священные вибрации для глубокой медитации',
    duration: 1800, // 30 минут
    file: 'singing_bowls.mp3',
    category: 'meditation'
  },
  {
    id: '10',
    name: 'Мантра Ом',
    description: 'Древняя мантра для духовного очищения',
    duration: 1200, // 20 минут
    file: 'om_mantra.mp3',
    category: 'meditation'
  }
];

export const hypnotherapySessions: HypnotherapySession[] = [
  {
    id: '1',
    title: 'Освобождение от зависимости',
    description: 'Глубокая гипнотерапия для преодоления алкогольной зависимости на подсознательном уровне',
    duration: 2400, // 40 минут
    category: 'addiction',
    level: 'intermediate',
    script: [
      'Устройтесь поудобнее в тихом месте и медленно закройте глаза...',
      'Начните дышать медленно и глубоко, позволяя каждому выдоху нести расслабление...',
      'С каждым вдохом вы чувствуете, как покой наполняет ваше тело...',
      'С каждым выдохом напряжение покидает вас, унося с собой старые привычки...',
      'Теперь представьте себя стоящим на вершине горы, вдалеке от всех проблем...',
      'Вы видите свое прошлое внизу, как долину, которую вы преодолели...',
      'Поверните взгляд к горизонту - там ваше трезвое будущее, светлое и полное возможностей...',
      'Почувствуйте, как глубоко внутри вас зарождается новая сила...',
      'Эта сила говорит: "Алкоголь больше не имеет власти надо мной"...',
      'Повторите мысленно: "Я выбираю здоровье, я выбираю свободу"...',
      'Представьте, как каждая клетка вашего тела обновляется и исцеляется...',
      'Ваш разум становится ясным, а воля - непоколебимой...',
      'Вы видите себя через год - здорового, счастливого, полного энергии...',
      'Это не мечта, это ваше будущее, к которому вы идете каждый день...',
      'Сохраните это видение в своем сердце как маяк на пути к трезвости...',
      'Медленно возвращайтесь в настоящий момент, неся с собой эту внутреннюю силу...'
    ]
  },
  {
    id: '2',
    title: 'Уверенность в трезвости',
    description: 'Укрепление внутренней силы и мотивации для поддержания трезвого образа жизни',
    duration: 1800, // 30 минут
    category: 'confidence',
    level: 'beginner',
    script: [
      'Примите удобное положение и позвольте глазам мягко закрыться...',
      'Дышите естественно, чувствуя, как с каждым вдохом приходит спокойствие...',
      'Представьте себя в безопасном, светлом месте - это пространство вашей внутренней силы...',
      'Здесь живет лучшая версия вас - уверенная, сильная, трезвая...',
      'Повторяйте мысленно: "Я выбираю трезвость, потому что забочусь о себе"...',
      'Почувствуйте, как эти слова резонируют в каждой клетке вашего тела...',
      'Каждый трезвый день - это подарок, который вы делаете себе и близким...',
      'Вы заслуживаете здоровья, счастья и полноценной жизни...',
      'Представьте, как гордятся вами те, кто вас любит...',
      'Почувствуйте эту гордость и в своем сердце - вы достойны восхищения...',
      'Ваша сила растет с каждым днем, как дерево, пускающее глубокие корни...',
      'Соблазны могут приходить, но ваши корни глубже любого искушения...',
      'Повторите: "Я сильнее своих привычек, я хозяин своей жизни"...',
      'Запомните это ощущение силы и уверенности...',
      'Медленно возвращайтесь сюда, в настоящий момент, сохраняя эту уверенность...'
    ]
  },
  {
    id: '3',
    title: 'Глубокий восстановительный сон',
    description: 'Гипнотерапия для качественного сна без алкоголя и полного восстановления организма',
    duration: 3000, // 50 минут
    category: 'sleep',
    level: 'beginner',
    script: [
      'Устройтесь в постели максимально удобно...',
      'Почувствуйте, как кровать поддерживает каждую часть вашего тела...',
      'Ваше тело готовится к глубокому, исцеляющему сну...',
      'С каждым выдохом мышцы расслабляются все больше и больше...',
      'Начиная с макушки головы, почувствуйте волну расслабления...',
      'Она медленно стекает по лицу, снимая любое напряжение...',
      'Расслабляются плечи, руки становятся тяжелыми и теплыми...',
      'Грудь поднимается и опускается в естественном ритме покоя...',
      'Живот мягко расслабляется, как будто тает...',
      'Ноги становятся тяжелыми, полностью расслабленными...',
      'Ваш естественный механизм сна включается идеально...',
      'Вам не нужны никакие вещества, чтобы заснуть...',
      'Ваше тело знает, как восстанавливаться и исцеляться во сне...',
      'Каждая клетка обновляется, каждый орган отдыхает и восстанавливается...',
      'Утром вы проснетесь свежими, отдохнувшими, полными жизненной силы...',
      'Позвольте себе погружаться в этот целебный сон все глубже и глубже...'
    ]
  },
  {
    id: '4',
    title: 'Исцеление от тревоги',
    description: 'Специальная сессия для преодоления тревожности без использования алкоголя',
    duration: 2100, // 35 минут
    category: 'anxiety',
    level: 'intermediate',
    script: [
      'Найдите спокойное место и медленно закройте глаза...',
      'Представьте себя на берегу тихого озера на рассвете...',
      'Вода абсолютно спокойна, как зеркало, отражающее небо...',
      'Эта вода символизирует ваш спокойный, умиротворенный разум...',
      'Любые тревожные мысли - это лишь рябь на поверхности...',
      'Но глубина озера остается неизменно спокойной...',
      'Дышите синхронно с легким движением воды...',
      'Вдох - покой входит в вас, выдох - тревога растворяется...',
      'Вы понимаете: тревога - это временное состояние, не ваша суть...',
      'Ваша истинная природа - это глубокий, нерушимый покой...',
      'Алкоголь не может дать вам этого покоя, он может только нарушить его...',
      'Но этот покой всегда доступен вам изнутри...',
      'Запомните это ощущение полного спокойствия и безопасности...',
      'В любой момент вы можете вернуться к этому озеру в своем сознании...'
    ]
  }
];

export class AudioService {
  private static sound: Audio.Sound | null = null;
  private static isPlaying: boolean = false;
  
    static async initializeAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }
  
  static async playRelaxingSound(soundId: string): Promise<void> {
    try {
      await this.stopAudio();
      
      const sound = relaxingSounds.find(s => s.id === soundId);
      if (!sound) throw new Error('Sound not found');
      
      // В реальном приложении здесь будет загрузка из assets
      // Для демо используем placeholder URL
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: `https://www.soundjay.com/misc/sounds/${sound.file}` },
        { 
          shouldPlay: true, 
          isLooping: true,
          volume: 0.7
        }
      );
      
      this.sound = audioSound;
      this.isPlaying = true;
    } catch (error) {
      console.error('Error playing sound:', error);
      // Fallback для демо - просто показываем, что звук играет
      this.isPlaying = true;
    }
  }
  
  static async playHypnotherapySession(sessionId: string): Promise<void> {
    try {
      await this.stopAudio();
      
      const session = hypnotherapySessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      
      // Здесь будет логика воспроизведения гипнотерапевтической сессии
      this.isPlaying = true;
    } catch (error) {
      console.error('Error playing hypnotherapy session:', error);
    }
  }
  
  static async stopAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      this.isPlaying = false;
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }
  
  static async pauseAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }
  
  static async resumeAudio(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  }
  
  static getPlaybackStatus(): boolean {
    return this.isPlaying;
  }
}