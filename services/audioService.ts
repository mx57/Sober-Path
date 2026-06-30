import { Audio } from 'expo-av';

export interface RelaxingSound {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  benefits: string[];
  uri?: string;
}

export const generatedSounds: RelaxingSound[] = [
  { id: 'rain', name: 'Дождь', description: 'Успокаивающий звук дождя', category: 'nature', duration: 300, benefits: ['Снижение стресса'] },
  { id: 'ocean', name: 'Океанские волны', description: 'Ритмичный шум океана', category: 'nature', duration: 300, benefits: ['Медитация'] },
  { id: 'white-noise', name: 'Белый шум', description: 'Равномерный белый шум', category: 'therapeutic', duration: 600, benefits: ['Улучшение сна'] },
  { id: 'meditation-calm', name: 'Утренняя ясность', description: 'Медитация для настройки на трезвый день', category: 'meditation', duration: 420, benefits: ['Фокусировка', 'Настрой'] },
  { id: 'meditation-evening', name: 'Вечерний покой', description: 'Практика для снятия дневного стресса', category: 'meditation', duration: 600, benefits: ['Расслабление', 'Сон'] },
  { id: 'meditation-triggers', name: 'Работа с триггером', description: 'Аудио-сопровождение при острой тяге', category: 'meditation', duration: 300, benefits: ['Осознанность', 'Выдержка'] },
  { id: 'meditation-gratitude', name: 'Дневник благодарности', description: 'Медитация признательности за успехи', category: 'meditation', duration: 480, benefits: ['Дофамин', 'Радость'] },
  { id: 'meditation-inner-child', name: 'Внутренний ребенок', description: 'Техника самоподдержки и любви к себе', category: 'meditation', duration: 720, benefits: ['Исцеление', 'Эмпатия'] }
];

class AudioEngine {
  private sound: Audio.Sound | null = null;

  async loadAndPlay(uri: string) {
    await this.stop();
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: true }
      );
      this.sound = sound;
    } catch (e) {
      console.error('Failed to load sound', e);
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  async setVolume(volume: number) {
    if (this.sound) {
      await this.sound.setVolumeAsync(volume);
    }
  }
}

export const AudioService = {
  engine: new AudioEngine(),

  getRelaxingSounds(): RelaxingSound[] {
    return generatedSounds;
  },

  async playRelaxingSound(soundId: string) {
    // In a real app, these would be local assets or remote URLs
    // For now, we use a placeholder URI
    const sound = generatedSounds.find(s => s.id === soundId);
    if (sound) {
        // Placeholder URI
        await this.engine.loadAndPlay('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    }
  },

  async stopAudio() {
    await this.engine.stop();
  },

  async pauseAudio() {
    // For now, pause is same as stop or we can implement real pause
    await this.engine.stop();
  }
};
