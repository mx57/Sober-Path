import React, { useState } from 'react';
import { Platform } from 'react-native';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { emergencyTips } from '../services/recoveryService';

export default function EmergencyPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedTip, setSelectedTip] = useState<typeof emergencyTips[0] | null>(null);

  // Web alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const handleCallHelpline = () => {
    showWebAlert(
      'Телефон доверия',
      'Звоните прямо сейчас:\n8-800-200-0-200\n\nБесплатная психологическая помощь 24/7'
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FF6B6B" />
        </TouchableOpacity>
        <Text style={styles.title}>Экстренная помощь</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.urgentCard}>
          <MaterialIcons name="emergency" size={40} color="#FF6B6B" />
          <Text style={styles.urgentTitle}>Нужна помощь прямо сейчас?</Text>
          <Text style={styles.urgentText}>
            Помните: желание выпить временно. Оно пройдет. Вы сильнее, чем кажется.
          </Text>
          
          <TouchableOpacity 
            style={styles.helplineButton}
            onPress={handleCallHelpline}
          >
            <MaterialIcons name="phone" size={24} color="white" />
            <Text style={styles.helplineButtonText}>Позвонить на горячую линию</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.breathingCard}>
          <MaterialIcons name="air" size={30} color="#2E7D4A" />
          <Text style={styles.breathingTitle}>Дыхательное упражнение</Text>
          <Text style={styles.breathingText}>
            Медленно вдохните на 4 счета, задержите дыхание на 4, выдохните на 6. 
            Повторите 5 раз.
          </Text>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Техники быстрой помощи</Text>
          
          {emergencyTips.map((tip, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tipCard}
              onPress={() => setSelectedTip(tip)}
            >
              <View style={styles.tipHeader}>
                <MaterialIcons name="lightbulb" size={24} color="#2E7D4A" />
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <MaterialIcons name="chevron-right" size={24} color="#CCC" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>Помните о своих причинах</Text>
          <Text style={styles.reminderText}>
            • Ваше здоровье восстанавливается каждый день{'\n'}
            • Люди, которые в вас верят{'\n'}
            • Цели, которые вы хотите достичь{'\n'}
            • Гордость за каждый трезвый день
          </Text>
          
          <TouchableOpacity 
            style={styles.profileButton}            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Text style={styles.profileButtonText}>Посмотреть мои мотивации</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Tip Detail Modal */}
      <Modal
        visible={selectedTip !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedTip && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTip.title}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedTip(null)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalText}>{selectedTip.content}</Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setSelectedTip(null)}
            >
              <Text style={styles.modalButtonText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, minWidth: 280, maxWidth: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{alertConfig.title}</Text>
              <Text style={{ fontSize: 16, marginBottom: 20, lineHeight: 22 }}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#FF6B6B', padding: 10, borderRadius: 4, alignItems: 'center' }}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 15
  },
  backButton: {
    padding: 5
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B'
  },
  content: {
    padding: 20,
    gap: 20
  },
  urgentCard: {
    backgroundColor: '#FFE6E6',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B'
  },
  urgentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CC0000',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center'
  },
  urgentText: {
    fontSize: 16,
    color: '#990000',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20
  },
  helplineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8
  },
  helplineButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  breathingCard: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center'
  },
  breathingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginTop: 10,
    marginBottom: 10
  },
  breathingText: {
    fontSize: 16,
    color: '#4A6741',
    textAlign: 'center',
    lineHeight: 22
  },
  tipsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15
  },
  tipCard: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1
  },
  reminderCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15,
    textAlign: 'center'
  },
  reminderText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20
  },
  profileButton: {
    backgroundColor: '#2E7D4A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  profileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    flex: 1
  },
  closeButton: {
    padding: 5
  },
  modalContent: {
    flex: 1,
    padding: 20
  },
  modalText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333'
  },
  modalButton: {
    backgroundColor: '#2E7D4A',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});