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
  { id: 'white-noise', name: 'Белый шум', description: 'Равномерный белый шум', category: 'therapeutic', duration: 600, benefits: ['Улучшение сна'] }
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
