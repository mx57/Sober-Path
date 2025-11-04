import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Platform,
  Modal,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { useRecovery } from '../../hooks/useRecovery';
import { smartNotificationService } from '../../services/smartNotificationService';

const { width: screenWidth } = Dimensions.get('window');

interface SettingSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  settings: Setting[];
}

interface Setting {
  id: string;
  title: string;
  description: string;
  type: 'switch' | 'slider' | 'select';
  value: any;
  options?: string[];
  min?: number;
  max?: number;
}

// Константы для ключей хранилища
const STORAGE_KEYS = {
  THEME: '@settings/theme',
  NOTIFICATIONS: '@settings/notifications',
  PRIVACY: '@settings/privacy',
  ACCESSIBILITY: '@settings/accessibility'
};

const MemoizedThemeCard = React.memo(({ theme, isSelected, onPress }: {
  theme: any;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const scaleValue = useSharedValue(1);
  const glowValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    shadowOpacity: interpolate(glowValue.value, [0, 1], [0.2, 0.4])
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  };

  useEffect(() => {
    if (isSelected) {
      glowValue.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);
    } else {
      glowValue.value = withTiming(0, { duration: 300 });
    }
  }, [isSelected]);

  return (
    <Animated.View style={[styles.themeCard, animatedStyle]}>
      <TouchableOpacity onPress={handlePress}>
        <LinearGradient
          colors={theme.gradient}
          style={[styles.themeGradient, isSelected && styles.selectedTheme]}
        >
          <MaterialIcons name={theme.icon} size={32} color="white" />
          <Text style={styles.themeName}>{theme.name}</Text>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <MaterialIcons name="check-circle" size={24} color="white" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const MemoizedSettingRow = React.memo(({ setting, onValueChange }: {
  setting: Setting;
  onValueChange: (value: any) => void;
}) => {
  const slideValue = useSharedValue(0);
  const [localValue, setLocalValue] = useState(setting.value);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideValue.value }]
  }));

  const handleValueChange = useCallback((newValue: any) => {
    setLocalValue(newValue);
    slideValue.value = withSpring(5, {}, () => {
      slideValue.value = withSpring(0);
    });
    
    if (Platform.OS !== 'web' && Haptics?.selectionAsync) {
      Haptics.selectionAsync();
    }
    
    onValueChange(newValue);
  }, [onValueChange]);

  const renderControl = () => {
    switch (setting.type) {
      case 'switch':
        return (
          <Switch
            value={localValue}
            onValueChange={handleValueChange}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={localValue ? 'white' : '#F4F3F4'}
          />
        );
      case 'slider':
        return <Text style={styles.sliderValue}>{localValue}</Text>;
      case 'select':
        return (
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectValue}>{localValue}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.settingRow, animatedStyle]}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{setting.title}</Text>
        <Text style={styles.settingDescription}>{setting.description}</Text>
      </View>
      <View style={styles.settingControl}>
        {renderControl()}
      </View>
    </Animated.View>
  );
});

export default function EnhancedSettingsPage() {
  const insets = useSafeAreaInsets();
  const { userProfile, updateUserProfile } = useRecovery();
  
  const [selectedTheme, setSelectedTheme] = useState('nature');
  const [notificationSettings, setNotificationSettings] = useState<any>({
    motivationalQuotes: true,
    riskInterventions: true,
    dailyCheckIns: true,
    wellnessTips: true
  });
  const [privacySettings, setPrivacySettings] = useState<any>({
    dataAnalytics: true,
    crashReports: true,
    locationServices: false
  });
  const [accessibilitySettings, setAccessibilitySettings] = useState<any>({
    largeText: false,
    highContrast: false,
    voiceFeedback: false,
    hapticFeedback: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const fadeInValue = useSharedValue(0);
  const slideValue = useSharedValue(30);

  const fadeInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: slideValue.value }]
  }));

  const themes = [
    { id: 'nature', name: 'Природа', icon: 'eco', gradient: ['#4CAF50', '#2E7D4A'] },
    { id: 'ocean', name: 'Океан', icon: 'waves', gradient: ['#2196F3', '#1565C0'] },
    { id: 'sunset', name: 'Закат', icon: 'wb-sunny', gradient: ['#FF9800', '#F57C00'] },
    { id: 'minimal', name: 'Минимал', icon: 'palette', gradient: ['#607D8B', '#455A64'] }
  ];

  const settingSections: SettingSection[] = [
    {
      id: 'notifications',
      title: 'Уведомления',
      icon: 'notifications',
      description: 'Настройка умных уведомлений и напоминаний',
      settings: [
        {
          id: 'motivationalQuotes',
          title: 'Мотивационные цитаты',
          description: 'Ежедневные персонализированные сообщения поддержки',
          type: 'switch',
          value: notificationSettings.motivationalQuotes
        },
        {
          id: 'riskInterventions',
          title: 'Экстренная поддержка',
          description: 'Уведомления при обнаружении повышенного риска',
          type: 'switch',
          value: notificationSettings.riskInterventions
        },
        {
          id: 'dailyCheckIns',
          title: 'Ежедневные проверки',
          description: 'Напоминания о необходимости отметить настроение',
          type: 'switch',
          value: notificationSettings.dailyCheckIns
        },
        {
          id: 'wellnessTips',
          title: 'Советы по здоровью',
          description: 'ИИ-инсайты и рекомендации для улучшения самочувствия',
          type: 'switch',
          value: notificationSettings.wellnessTips
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Приватность и безопасность',
      icon: 'security',
      description: 'Управление конфиденциальностью данных',
      settings: [
        {
          id: 'dataAnalytics',
          title: 'Аналитика данных',
          description: 'Разрешить анализ данных для персонализации',
          type: 'switch',
          value: privacySettings.dataAnalytics
        },
        {
          id: 'crashReports',
          title: 'Отчеты об ошибках',
          description: 'Автоматическая отправка отчетов для улучшения приложения',
          type: 'switch',
          value: privacySettings.crashReports
        },
        {
          id: 'locationServices',
          title: 'Геолокация',
          description: 'Использование местоположения для контекстных советов',
          type: 'switch',
          value: privacySettings.locationServices
        }
      ]
    },
    {
      id: 'accessibility',
      title: 'Доступность',
      icon: 'accessibility',
      description: 'Настройки для улучшения доступности приложения',
      settings: [
        {
          id: 'largeText',
          title: 'Крупный текст',
          description: 'Увеличенный размер шрифта для лучшей читаемости',
          type: 'switch',
          value: accessibilitySettings.largeText
        },
        {
          id: 'highContrast',
          title: 'Высокий контраст',
          description: 'Повышенная контрастность для лучшей видимости',
          type: 'switch',
          value: accessibilitySettings.highContrast
        },
        {
          id: 'voiceFeedback',
          title: 'Голосовая обратная связь',
          description: 'Озвучивание важных уведомлений и действий',
          type: 'switch',
          value: accessibilitySettings.voiceFeedback
        },
        {
          id: 'hapticFeedback',
          title: 'Тактильная обратная связь',
          description: 'Вибрация при взаимодействии с интерфейсом',
          type: 'switch',
          value: accessibilitySettings.hapticFeedback
        }
      ]
    }
  ];

  useEffect(() => {
    loadSettings();
    initializeAnimations();
  }, []);

  const initializeAnimations = () => {
    fadeInValue.value = withTiming(1, { duration: 800 });
    slideValue.value = withTiming(0, { duration: 800 });
  };

  const loadSettings = async () => {
    try {
      const [theme, notif, privacy, accessibility] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PRIVACY),
        AsyncStorage.getItem(STORAGE_KEYS.ACCESSIBILITY)
      ]);

      if (theme) setSelectedTheme(theme);
      if (notif) setNotificationSettings(JSON.parse(notif));
      if (privacy) setPrivacySettings(JSON.parse(privacy));
      if (accessibility) setAccessibilitySettings(JSON.parse(accessibility));
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      showAlert('Успешно', 'Настройки сохранены');
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      showAlert('Ошибка', 'Не удалось сохранить настройки');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = useCallback(async (themeId: string) => {
    setSelectedTheme(themeId);
    await saveSettings(STORAGE_KEYS.THEME, themeId);
    
    // Применяем тему к приложению
    if (updateUserProfile) {
      await updateUserProfile({ theme: themeId });
    }
    
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [updateUserProfile, saveSettings]);

  const handleSettingChange = useCallback(async (sectionId: string, settingId: string, value: any) => {
    switch (sectionId) {
      case 'notifications':
        const newNotifSettings = { ...notificationSettings, [settingId]: value };
        setNotificationSettings(newNotifSettings);
        await saveSettings(STORAGE_KEYS.NOTIFICATIONS, newNotifSettings);
        if (smartNotificationService?.updatePreferences) {
          smartNotificationService.updatePreferences({ [settingId]: value });
        }
        break;
        
      case 'privacy':
        const newPrivacySettings = { ...privacySettings, [settingId]: value };
        setPrivacySettings(newPrivacySettings);
        await saveSettings(STORAGE_KEYS.PRIVACY, newPrivacySettings);
        break;
        
      case 'accessibility':
        const newAccessibilitySettings = { ...accessibilitySettings, [settingId]: value };
        setAccessibilitySettings(newAccessibilitySettings);
        await saveSettings(STORAGE_KEYS.ACCESSIBILITY, newAccessibilitySettings);
        
        // Применяем настройки доступности к приложению
        if (updateUserProfile) {
          await updateUserProfile({ accessibility: newAccessibilitySettings });
        }
        break;
    }
  }, [notificationSettings, privacySettings, accessibilitySettings, updateUserProfile, saveSettings]);

  const handleResetAllSettings = useCallback(async () => {
    try {
      setSelectedTheme('nature');
      const defaultNotif = { motivationalQuotes: true, riskInterventions: true, dailyCheckIns: true, wellnessTips: true };
      const defaultPrivacy = { dataAnalytics: true, crashReports: true, locationServices: false };
      const defaultAccessibility = { largeText: false, highContrast: false, voiceFeedback: false, hapticFeedback: true };
      
      setNotificationSettings(defaultNotif);
      setPrivacySettings(defaultPrivacy);
      setAccessibilitySettings(defaultAccessibility);
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.THEME, 'nature'),
        AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotif)),
        AsyncStorage.setItem(STORAGE_KEYS.PRIVACY, JSON.stringify(defaultPrivacy)),
        AsyncStorage.setItem(STORAGE_KEYS.ACCESSIBILITY, JSON.stringify(defaultAccessibility))
      ]);
      
      showAlert('Готово', 'Все настройки сброшены к значениям по умолчанию');
      
      if (Platform.OS !== 'web' && Haptics?.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      showAlert('Ошибка', 'Не удалось сбросить настройки');
    }
  }, []);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message });
    } else {
      Alert.alert(title, message);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <MaterialIcons name="settings" size={60} color="#4CAF50" />
        <Text style={styles.loadingText}>Загружаем настройки...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#4CAF50', '#2E7D4A']} style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="settings" size={32} color="white" />
          <Text style={styles.headerTitle}>Настройки</Text>
          <Text style={styles.headerSubtitle}>Персонализация и управление</Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, fadeInAnimatedStyle]}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Тема приложения</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.themesContainer}>
              {themes.map((theme) => (
                <MemoizedThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedTheme === theme.id}
                  onPress={() => handleThemeChange(theme.id)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {settingSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name={section.icon} size={24} color="#4CAF50" />
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
              </View>
            </View>
            
            <View style={styles.settingsContainer}>
              {section.settings.map((setting) => (
                <MemoizedSettingRow
                  key={setting.id}
                  setting={setting}
                  onValueChange={(value) => handleSettingChange(section.id, setting.id, value)}
                />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Дополнительно</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleResetAllSettings}>
              <MaterialIcons name="refresh" size={24} color="#FF9800" />
              <Text style={styles.actionButtonText}>Сбросить настройки</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.privacyNotice}>
          <MaterialIcons name="security" size={20} color="#666" />
          <Text style={styles.privacyText}>
            Ваши данные надежно защищены и используются только для персонализации опыта. 
            Мы не передаем личную информацию третьим лицам.
          </Text>
        </View>
      </Animated.View>

      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.webAlertOverlay}>
            <View style={styles.webAlertContent}>
              <Text style={styles.webAlertTitle}>{alertConfig.title}</Text>
              <Text style={styles.webAlertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={styles.webAlertButton}
                onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.webAlertButtonText}>OK</Text>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 18,
    color: '#4CAF50',
    marginTop: 15,
    fontWeight: '500'
  },
  header: {
    padding: 20,
    alignItems: 'center'
  },
  headerContent: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4
  },
  content: {
    padding: 20
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionInfo: {
    marginLeft: 12,
    flex: 1
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 4
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666'
  },
  themesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4
  },
  themeCard: {
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  themeGradient: {
    width: 120,
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  selectedTheme: {
    borderWidth: 3,
    borderColor: 'white'
  },
  themeName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  settingInfo: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  settingControl: {
    marginLeft: 12
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8
  },
  selectValue: {
    fontSize: 14,
    color: '#333',
    marginRight: 8
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    minWidth: 40,
    textAlign: 'center'
  },
  actionButtonsContainer: {
    gap: 12
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginTop: 20
  },
  privacyText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
    lineHeight: 18,
    flex: 1
  },
  webAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  webAlertContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    minWidth: 300,
    maxWidth: '90%'
  },
  webAlertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  webAlertMessage: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
    color: '#666'
  },
  webAlertButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  webAlertButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});
