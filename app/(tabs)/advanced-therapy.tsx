import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdvancedTherapy, advancedTherapies, TherapeuticSound, therapeuticSounds } from '../../services/advancedPsychologyService';
import AdvancedTherapyPlayer from '../../components/AdvancedTherapyPlayer';
import TherapeuticSoundPlayer from '../../components/TherapeuticSoundPlayer';

export default function AdvancedTherapyPage() {
  const insets = useSafeAreaInsets();
  const [selectedTherapy, setSelectedTherapy] = useState<AdvancedTherapy | null>(null);
  const [selectedSound, setSelectedSound] = useState<TherapeuticSound | null>(null);
  const [showTherapyPlayer, setShowTherapyPlayer] = useState(false);
  const [showSoundPlayer, setShowSoundPlayer] = useState(false);
  const [activeTab, setActiveTab] = useState<'therapies' | 'sounds'>('therapies');

  const methodIcons: Record<string, string> = {
    emdr: 'visibility',
    ifs: 'psychology',
    eft: 'touch-app',
    somatic: 'accessibility-new',
    neurofeedback: 'memory',
    brainspotting: 'center-focus-strong',
    havening: 'healing'
  };

  const methodNames: Record<string, string> = {
    emdr: 'EMDR',
    ifs: 'IFS',
    eft: 'EFT',
    somatic: 'Соматика',
    neurofeedback: 'Нейрофидбек',
    brainspotting: 'Брейнспоттинг',
    havening: 'Хэвенинг'
  };

  const startTherapy = (therapy: AdvancedTherapy) => {
    setSelectedTherapy(therapy);
    setShowTherapyPlayer(true);
  };

  const startSound = (sound: TherapeuticSound) => {
    setSelectedSound(sound);
    setShowSoundPlayer(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#666';
    }
  };

  const getSoundTypeColor = (type: string) => {
    switch (type) {
      case 'solfeggio': return '#9C27B0';
      case 'binaural': return '#2196F3';
      case 'chakra': return '#FF9800';
      case 'planetary': return '#795548';
      default: return '#607D8B';
    }
  };

  const renderTherapyCard = (therapy: AdvancedTherapy) => (
    <View key={therapy.id} style={styles.therapyCard}>
      <View style={styles.therapyHeader}>
        <MaterialIcons 
          name={methodIcons[therapy.method] as any} 
          size={32} 
          color="#2E7D4A" 
        />
        <View style={styles.therapyInfo}>
          <Text style={styles.therapyTitle}>{therapy.name}</Text>
          <Text style={styles.methodName}>{methodNames[therapy.method]}</Text>
          <View style={styles.therapyMeta}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color="#999" />
              <Text style={styles.metaText}>{therapy.duration} мин</Text>
            </View>
            <View style={[
              styles.difficultyBadge, 
              { backgroundColor: getDifficultyColor(therapy.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {therapy.difficulty === 'beginner' ? 'Начальный' : 
                 therapy.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.therapyDescription}>{therapy.description}</Text>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Преимущества:</Text>
        {therapy.benefits.slice(0, 2).map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <MaterialIcons name="check-circle" size={14} color="#4CAF50" />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {therapy.contraindications.length > 0 && (
        <View style={styles.warningContainer}>
          <MaterialIcons name="warning" size={16} color="#FF6B6B" />
          <Text style={styles.warningText}>
            Есть противопоказания - изучите перед использованием
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.startTherapyButton}
        onPress={() => startTherapy(therapy)}
      >
        <MaterialIcons name="play-circle-filled" size={20} color="white" />
        <Text style={styles.startTherapyText}>Начать технику</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSoundCard = (sound: TherapeuticSound) => (
    <View key={sound.id} style={styles.soundCard}>
      <View style={styles.soundHeader}>
        <View style={[styles.frequencyBadge, { backgroundColor: getSoundTypeColor(sound.type) }]}>
          <Text style={styles.frequencyBadgeText}>{sound.frequency}</Text>
        </View>
        <View style={styles.soundInfo}>
          <Text style={styles.soundTitle}>{sound.name}</Text>
          <Text style={styles.soundType}>{sound.type.toUpperCase()}</Text>
          <View style={styles.soundMeta}>
            <MaterialIcons name="schedule" size={14} color="#999" />
            <Text style={styles.soundMetaText}>
              {Math.floor(sound.duration / 60)} мин
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.soundPurpose}>{sound.purpose}</Text>
      <Text style={styles.soundInstructions}>{sound.instructions}</Text>

      <TouchableOpacity 
        style={styles.playFrequencyButton}
        onPress={() => startSound(sound)}
      >
        <MaterialIcons name="equalizer" size={20} color="white" />
        <Text style={styles.playFrequencyText}>Слушать частоту</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Продвинутая терапия</Text>
        <Text style={styles.subtitle}>
          Современные методы психотерапии и терапевтические частоты
        </Text>
      </View>

      {/* Переключатель вкладок */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'therapies' && styles.activeTab]}
          onPress={() => setActiveTab('therapies')}
        >
          <MaterialIcons name="psychology" size={20} color={activeTab === 'therapies' ? 'white' : '#2E7D4A'} />
          <Text style={[styles.tabText, activeTab === 'therapies' && styles.activeTabText]}>
            Техники
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sounds' && styles.activeTab]}
          onPress={() => setActiveTab('sounds')}
        >
          <MaterialIcons name="graphic-eq" size={20} color={activeTab === 'sounds' ? 'white' : '#2E7D4A'} />
          <Text style={[styles.tabText, activeTab === 'sounds' && styles.activeTabText]}>
            Частоты
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'therapies' ? (
          <>
            <View style={styles.infoCard}>
              <MaterialIcons name="school" size={24} color="#2E7D4A" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Профессиональные техники</Text>
                <Text style={styles.infoDescription}>
                  Современные методы психотерапии, адаптированные для самостоятельной работы. 
                  Внимательно изучите противопоказания перед использованием.
                </Text>
              </View>
            </View>

            {advancedTherapies.map(renderTherapyCard)}
          </>
        ) : (
          <>
            <View style={styles.infoCard}>
              <MaterialIcons name="waves" size={24} color="#9C27B0" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Терапевтические частоты</Text>
                <Text style={styles.infoDescription}>
                  Специальные частоты для исцеления и гармонизации. Используйте наушники 
                  для максимального эффекта. Каждая частота имеет свое назначение.
                </Text>
              </View>
            </View>

            {therapeuticSounds.map(renderSoundCard)}
          </>
        )}
      </ScrollView>

      {/* Модальные окна */}
      <AdvancedTherapyPlayer
        visible={showTherapyPlayer}
        therapy={selectedTherapy || undefined}
        onClose={() => setShowTherapyPlayer(false)}
      />

      <TherapeuticSoundPlayer
        visible={showSoundPlayer}
        sound={selectedSound || undefined}
        onClose={() => setShowSoundPlayer(false)}
      />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    gap: 6
  },
  activeTab: {
    backgroundColor: '#2E7D4A'
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  activeTabText: {
    color: 'white'
  },
  content: {
    padding: 20,
    gap: 20
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
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
    color: '#1976D2',
    marginBottom: 5
  },
  infoDescription: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20
  },
  therapyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  therapyHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15
  },
  therapyInfo: {
    flex: 1
  },
  therapyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  methodName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  therapyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 14,
    color: '#999'
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold'
  },
  therapyDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 15
  },
  benefitsContainer: {
    marginBottom: 15
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 8
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6
  },
  benefitText: {
    fontSize: 13,
    color: '#333',
    flex: 1
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8
  },
  warningText: {
    fontSize: 12,
    color: '#CC0000',
    flex: 1
  },
  startTherapyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D4A',
    padding: 12,
    borderRadius: 10,
    gap: 8
  },
  startTherapyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  soundCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  soundHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15
  },
  frequencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  frequencyBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white'
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
  soundType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    letterSpacing: 1
  },
  soundMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  soundMetaText: {
    fontSize: 12,
    color: '#999'
  },
  soundPurpose: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10
  },
  soundInstructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15
  },
  playFrequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 10,
    gap: 8
  },
  playFrequencyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});