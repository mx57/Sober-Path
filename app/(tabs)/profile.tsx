import React, { useState } from 'react';
import { Platform } from 'react-native';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecovery } from '../../hooks/useRecovery';
import { motivationalQuotes } from '../../services/recoveryService';

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const { userProfile, updateProfile, soberDays, getStreakDays } = useRecovery();
  const [dailyNotifications, setDailyNotifications] = useState(userProfile?.notifications.daily ?? true);
  const [emergencyNotifications, setEmergencyNotifications] = useState(userProfile?.notifications.emergency ?? true);

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

  if (!userProfile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.noProfileText}>Профиль не создан</Text>
      </View>
    );
  }

  const handleNotificationToggle = async (type: 'daily' | 'emergency', value: boolean) => {
    if (type === 'daily') {
      setDailyNotifications(value);
      await updateProfile({
        notifications: { ...userProfile.notifications, daily: value }
      });
    } else {
      setEmergencyNotifications(value);
      await updateProfile({
        notifications: { ...userProfile.notifications, emergency: value }
      });
    }
  };

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Профиль</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{soberDays}</Text>
          <Text style={styles.statLabel}>Дней трезвости</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getStreakDays()}</Text>
          <Text style={styles.statLabel}>Текущая серия</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {new Date(userProfile.startDate).toLocaleDateString('ru-RU')}
          </Text>
          <Text style={styles.statLabel}>Дата начала</Text>
        </View>
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteCard}>
        <MaterialIcons name="format-quote" size={24} color="#2E7D4A" />
        <Text style={styles.quoteText}>{randomQuote}</Text>
      </View>

      {/* Motivations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ваши мотивации</Text>
        {userProfile.motivations.map((motivation, index) => (
          <View key={index} style={styles.motivationItem}>
            <MaterialIcons name="star" size={20} color="#2E7D4A" />
            <Text style={styles.motivationText}>{motivation}</Text>
          </View>
        ))}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Уведомления</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="notifications" size={24} color="#2E7D4A" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Ежедневные напоминания</Text>
              <Text style={styles.settingDescription}>
                Мотивационные сообщения каждый день
              </Text>
            </View>
          </View>
          <Switch
            value={dailyNotifications}
            onValueChange={(value) => handleNotificationToggle('daily', value)}
            trackColor={{ false: '#E0E0E0', true: '#A8D5A8' }}
            thumbColor={dailyNotifications ? '#2E7D4A' : '#999'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MaterialIcons name="emergency" size={24} color="#FF6B6B" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Экстренные уведомления</Text>
              <Text style={styles.settingDescription}>
                Напоминания о техниках при срывах
              </Text>
            </View>
          </View>
          <Switch
            value={emergencyNotifications}
            onValueChange={(value) => handleNotificationToggle('emergency', value)}
            trackColor={{ false: '#E0E0E0', true: '#FFB3B3' }}
            thumbColor={emergencyNotifications ? '#FF6B6B' : '#999'}
          />
        </View>
      </View>

      {/* Help & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Помощь и поддержка</Text>
        
        <TouchableOpacity 
          style={styles.helpItem}
          onPress={() => showWebAlert('Телефон доверия', 'Бесплатная психологическая помощь:\n8-800-200-0-200\nКруглосуточно, анонимно')}
        >
          <MaterialIcons name="phone" size={24} color="#2E7D4A" />
          <Text style={styles.helpText}>Телефон доверия</Text>
          <MaterialIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.helpItem}
          onPress={() => showWebAlert('О приложении', 'Sober Path v1.0\nПриложение для поддержки людей, бросающих алкоголь.\n\nСоздано с заботой о вашем здоровье.')}
        >
          <MaterialIcons name="info" size={24} color="#2E7D4A" />
          <Text style={styles.helpText}>О приложении</Text>
          <MaterialIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <MaterialIcons name="lock" size={20} color="#666" />
        <Text style={styles.privacyText}>
          Все данные хранятся локально на вашем устройстве. Конфиденциальность гарантирована.
        </Text>
      </View>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, minWidth: 280, maxWidth: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{alertConfig.title}</Text>
              <Text style={{ fontSize: 16, marginBottom: 20, lineHeight: 22 }}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#2E7D4A', padding: 10, borderRadius: 4, alignItems: 'center' }}
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
    </ScrollView>
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
    color: '#2E7D4A'
  },
  noProfileText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15
  },
  quoteCard: {
    backgroundColor: '#E8F5E8',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2E7D4A',
    lineHeight: 22,
    flex: 1
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
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
  motivationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10
  },
  motivationText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  settingTextContainer: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2
  },
  settingDescription: {
    fontSize: 14,
    color: '#666'
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12
  },
  helpText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    gap: 10
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 18
  }
});