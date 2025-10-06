
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
  Animated as RNAnimated
} from 'react-native';
import * as Haptics from 'expo-haptics'; // Corrected: Import Haptics from expo-haptics
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

// Мемоизированные компоненты для оптимизации
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
      glowValue.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    } else {
      glowValue.value = withTiming(0, { duration: 300 });
    }
  }, [isSelected]);

  return (
    <Animated.View style={[styles.themeCard, animatedStyle]}>
      <TouchableOpacity onPress={handlePress}>
        <LinearGradient
          colors={theme.gradient}
          style={[
            styles.themeGradient,
            isSelected && styles.selectedTheme
          ]}
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
        // В реальном приложении здесь был бы слайдер
        return (
          <Text style={styles.sliderValue}>{localValue}</Text>
        );
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
  const [notificationSettings, setNotificationSettings] = useState<any>({});
  const [privacySettings, setPrivacySettings] = useState<any>({});
  const [accessibilitySettings, setAccessibilitySettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Анимации
  const fadeInValue = useSharedValue(0);
  const slideValue = useSharedValue(30);
  const bounceValue = useRef(new RNAnimated.Value(0)).current;

  const fadeInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: slideValue.value }]
  }));

  // Темы приложения
  const themes = [
    {
      id: 'nature',
      name: 'Природа',
      icon: 'eco',
      gradient: ['#4CAF50', '#2E7D4A']
    },
    {
      id: 'ocean',
      name: 'Океан',
      icon: 'waves',
      gradient: ['#2196F3', '#1565C0']
    },
    {
      id: 'sunset',
      name: 'Закат',
      icon: 'wb-sunny',
      gradient: ['#FF9800', '#F57C00']
    },
    {
      id: 'minimal',
      name: 'Минимал',
      icon: 'palette',
      gradient: ['#607D8B', '#455A64']
    }
  ];

  // Разделы настроек
  const settingSections: SettingSection[] = [
    {
      id: 'notifications',
      title: 'Уведомления',
      icon: 'notifications',
      description: 'Настройка умных уведомлений и напоминаний',
      settings: [
        {
          id: 'motivational_quotes',
          title: 'Мотивационные цитаты',
          description: 'Ежедневные персонализированные сообщения поддержки',
          type: 'switch',
          value: notificationSettings.motivationalQuotes ?? true
        },
        {
          id: 'risk_interventions',
          title: 'Экстренная поддержка',
          description: 'Уведомления при обнаружении повышенного риска',
          type: 'switch',
          value: notificationSettings.riskInterventions ?? true
        },
        {
          id: 'daily_checkins',
          title: 'Ежедневные проверки',
          description: 'Напоминания о необходимости отметить настроение',
          type: 'switch',
          value: notificationSettings.dailyCheckIns ?? true
        },
        {
          id: 'wellness_tips',
          title: 'Советы по здоровью',
          description: 'ИИ-инсайты и рекомендации для улучшения самочувствия',
          type: 'switch',
          value: notificationSettings.wellnessTips ?? true
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
          id: 'data_analytics',
          title: 'Аналитика данных',
          description: 'Разрешить анализ данных для персонализации',
          type: 'switch',
          value: privacySettings.dataAnalytics ?? true
        },
        {
          id: 'crash_reports',
          title: 'Отчеты об ошибках',
          description: 'Автоматическая отправка отчетов для улучшения приложения',
          type: 'switch',
          value: privacySettings.crashReports ?? true
        },
        {
          id: 'location_services',
          title: 'Геолокация',
          description: 'Использование местоположения для контекстных советов',
          type: 'switch',
          value: privacySettings.locationServices ?? false
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
          id: 'large_text',
          title: 'Крупный текст',
          description: 'Увеличенный размер шрифта для лучшей читаемости',
          type: 'switch',
          value: accessibilitySettings.largeText ?? false
        },
        {
          id: 'high_contrast',
          title: 'Высокий контраст',
          description: 'Повышенная контрастность для лучшей видимости',
          type: 'switch',
          value: accessibilitySettings.highContrast ?? false
        },
        {
          id: 'voice_feedback',
          title: 'Голосовая обратная связь',
          description: 'Озвучивание важных уведомлений и действий',
          type: 'switch',
          value: accessibilitySettings.voiceFeedback ?? false
        },
        {
          id: 'haptic_feedback',
          title: 'Тактильная обратная связь',
          description: 'Вибрация при взаимодействии с интерфейсом',
          type: 'switch',
          value: accessibilitySettings.hapticFeedback ?? true
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
    
    // Анимация появления с bounce эффектом
    RNAnimated.spring(bounceValue, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const loadSettings = async () => {
    try {
      // Загружаем настройки из сервисов
      const notifSettings = smartNotificationService.getPreferences();
      setNotificationSettings(notifSettings);
      
      // Загружаем другие настройки из локального хранилища
      // В реальном приложении здесь был бы AsyncStorage
      setPrivacySettings({
        dataAnalytics: true,
        crashReports: true,
        locationServices: false
      });
      
      setAccessibilitySettings({
        largeText: false,
        highContrast: false,
        voiceFeedback: false,
        hapticFeedback: true
      });
      
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = useCallback((themeId: string) => {
    setSelectedTheme(themeId);
    
    // Применяем новую тему
    if (updateUserProfile) {
      updateUserProfile({ theme: themeId });
    }
    
    // Тактильная обратная связь
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [updateUserProfile]);

  const handleSettingChange = useCallback(async (sectionId: string, settingId: string, value: any) => {
    switch (sectionId) {
      case 'notifications':
        const newNotifSettings = { ...notificationSettings, [settingId]: value };
        setNotificationSettings(newNotifSettings);
        smartNotificationService.updatePreferences({ [settingId]: value });
        break;
        
      case 'privacy':
        setPrivacySettings(prev => ({ ...prev, [settingId]: value }));
        // Сохранение в AsyncStorage
        break;
        
      case 'accessibility':
        setAccessibilitySettings(prev => ({ ...prev, [settingId]: value }));
        // Применение настроек доступности
        break;
    }
  }, [notificationSettings]);

  const handleResetAllSettings = useCallback(() => {
    // Сброс всех настроек к значениям по умолчанию
    setSelectedTheme('nature');
    setNotificationSettings({
      motivationalQuotes: true,
      riskInterventions: true,
      dailyCheckIns: true,
      wellnessTips: true
    });
    setPrivacySettings({
      dataAnalytics: true,
      crashReports: true,
      locationServices: false
    });
    setAccessibilitySettings({
      largeText: false,
      highContrast: false,
      voiceFeedback: false,
      hapticFeedback: true
    });
    
    if (Platform.OS !== 'web' && Haptics?.notificationAsync) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

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
      {/* Header */}
      <LinearGradient colors={['#4CAF50', '#2E7D4A']} style={styles.header}>
        <RNAnimated.View 
          style={[styles.headerContent, { transform: [{ scale: bounceValue }] }]}
        >
          <MaterialIcons name="settings" size={32} color="white" />
          <Text style={styles.headerTitle}>Настройки</Text>
          <Text style={styles.headerSubtitle}>Персонализация и управление</Text>
        </RNAnimated.View>
      </LinearGradient>

      <Animated.View style={[styles.content, fadeInAnimatedStyle]}>
        {/* Выбор темы */}
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

        {/* Разделы настроек */}
        {settingSections.map((section, sectionIndex) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name={section.icon} size={24} color="#4CAF50" />
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
              </View>
            </View>
            
            <View style={styles.settingsContainer}>
              {section.settings.map((setting, settingIndex) => (
                <MemoizedSettingRow
                  key={setting.id}
                  setting={setting}
                  onValueChange={(value) => handleSettingChange(section.id, setting.id, value)}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Дополнительные действия */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Дополнительно</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleResetAllSettings}>
              <MaterialIcons name="refresh" size={24} color="#FF9800" />
              <Text style={styles.actionButtonText}>Сбросить настройки</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="backup" size={24} color="#2196F3" />
              <Text style={styles.actionButtonText}>Экспорт данных</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="help" size={24} color="#9C27B0" />
              <Text style={styles.actionButtonText}>Помощь и поддержка</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Информация о приложении */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ О приложении</Text>
          <View style={styles.appInfoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Версия:</Text>
              <Text style={styles.infoValue}>2.1.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Последнее обновление:</Text>
              <Text style={styles.infoValue}>15 декабря 2024</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Разработчик:</Text>
              <Text style={styles.infoValue}>SoberPath Team</Text>
            </View>
          </View>
        </View>

        {/* Уведомление о конфиденциальности */}
        <View style={styles.privacyNotice}>
          <MaterialIcons name="security" size={20} color="#666" />
          <Text style={styles.privacyText}>
            Ваши данные надежно защищены и используются только для персонализации опыта. 
            Мы не передаем личную информацию третьим лицам.
          </Text>
        </View>
      </Animated.View>
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
  appInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  infoLabel: {
    fontSize: 14,
    color: '#666'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
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
  }
});
