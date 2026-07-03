import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AdvancedTherapy, PsychologyService, TherapeuticSound } from '../../services/PsychologyService';
import AdvancedTherapyPlayer from '../../components/AdvancedTherapyPlayer';
import TherapeuticSoundPlayer from '../../components/TherapeuticSoundPlayer';

export default function AdvancedTherapyPage() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedTherapy, setSelectedTherapy] = useState<AdvancedTherapy | null>(null);
  const [selectedSound, setSelectedSound] = useState<TherapeuticSound | null>(null);
  const [showTherapyPlayer, setShowTherapyPlayer] = useState(false);
  const [showSoundPlayer, setShowSoundPlayer] = useState(false);
  const [activeTab, setActiveTab] = useState<'therapies' | 'sounds'>('therapies');

  const therapiesResult = PsychologyService.getTherapies();
  const soundsResult = PsychologyService.getSounds();

  const therapies = therapiesResult.success ? therapiesResult.data : [];
  const sounds = soundsResult.success ? soundsResult.data : [];

  const startTherapy = (therapy: AdvancedTherapy) => {
    setSelectedTherapy(therapy);
    setShowTherapyPlayer(true);
  };

  const startSound = (sound: TherapeuticSound) => {
    setSelectedSound(sound);
    setShowSoundPlayer(true);
  };

  const renderTherapyCard = (therapy: AdvancedTherapy) => (
    <View key={therapy.id} style={styles.therapyCard}>
      <Text style={styles.therapyTitle}>{therapy.name}</Text>
      <Text style={styles.therapyDescription}>{therapy.description}</Text>
      <TouchableOpacity 
        style={styles.startTherapyButton}
        onPress={() => startTherapy(therapy)}
      >
        <Text style={styles.startTherapyText}>{t('psychology.startTechnique')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSoundCard = (sound: TherapeuticSound) => (
    <View key={sound.id} style={styles.soundCard}>
      <Text style={styles.soundTitle}>{sound.name}</Text>
      <Text style={styles.soundPurpose}>{sound.purpose}</Text>
      <TouchableOpacity 
        style={styles.playFrequencyButton}
        onPress={() => startSound(sound)}
      >
        <Text style={styles.playFrequencyText}>{t('psychology.listenFrequency')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('psychology.title')}</Text>
        <Text style={styles.subtitle}>{t('psychology.subtitle')}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'therapies' && styles.activeTab]}
          onPress={() => setActiveTab('therapies')}
        >
          <Text style={[styles.tabText, activeTab === 'therapies' && styles.activeTabText]}>
            {t('psychology.therapies')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sounds' && styles.activeTab]}
          onPress={() => setActiveTab('sounds')}
        >
          <Text style={[styles.tabText, activeTab === 'sounds' && styles.activeTabText]}>
            {t('psychology.sounds')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'therapies' ? therapies.map(renderTherapyCard) : sounds.map(renderSoundCard)}
      </ScrollView>

      <AdvancedTherapyPlayer visible={showTherapyPlayer} therapy={selectedTherapy || undefined} onClose={() => setShowTherapyPlayer(false)} />
      <TherapeuticSoundPlayer sound={selectedSound || undefined} onClose={() => setShowSoundPlayer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D4A' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  tabContainer: { flexDirection: 'row', padding: 20, backgroundColor: 'white' },
  tab: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#2E7D4A', marginHorizontal: 5 },
  activeTab: { backgroundColor: '#2E7D4A' },
  tabText: { fontWeight: 'bold', color: '#2E7D4A' },
  activeTabText: { color: 'white' },
  content: { padding: 20, gap: 15 },
  therapyCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, elevation: 3 },
  therapyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D4A' },
  therapyDescription: { marginTop: 10, color: '#333' },
  startTherapyButton: { marginTop: 15, backgroundColor: '#2E7D4A', padding: 12, borderRadius: 10, alignItems: 'center' },
  startTherapyText: { color: 'white', fontWeight: 'bold' },
  soundCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, elevation: 3 },
  soundTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D4A' },
  soundPurpose: { marginTop: 10, color: '#333' },
  playFrequencyButton: { marginTop: 15, backgroundColor: '#9C27B0', padding: 12, borderRadius: 10, alignItems: 'center' },
  playFrequencyText: { color: 'white', fontWeight: 'bold' }
});
