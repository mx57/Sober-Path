
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';

// Мемоизация ляуаута для оптимизации
function TabLayout() {
  const insets = useSafeAreaInsets();

  // Мемоизированные настройки табов
  const screenOptions = React.useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: '#2E7D4A',
    tabBarInactiveTintColor: '#666',
    tabBarStyle: {
      height: Platform.select({
        ios: insets.bottom + 70,
        android: insets.bottom + 70,
        default: 80
      }),
      paddingTop: 8,
      paddingBottom: Platform.select({
        ios: insets.bottom + 8,
        android: insets.bottom + 8,
        default: 8
      }),
      paddingHorizontal: 4,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8
    },
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '600',
      marginTop: -2
    },
    tabBarIconStyle: {
      marginBottom: 2
    },
    lazy: true, // Ленивая загрузка табов
    unmountOnBlur: false // Оставляем в памяти для быстрого переключения
  }), [insets.bottom]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-coach"
        options={{
          title: 'AI-Коуч',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="psychology" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="enhanced-exercises"
        options={{
          title: 'Техники',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="science" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sounds"
        options={{
          title: 'Аудио',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="headphones" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'ИИ-Чат',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mini-games"
        options={{
          title: 'Игры',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="games" size={size - 2} color={color} />
          ),
        }}
      />
      
      {/* Скрытые страницы - доступны через навигацию, но не отображаются в табах */}
      <Tabs.Screen
        name="personalized-recommendations"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="advanced-analytics"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="enhanced-settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="gamification"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="psychology"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="therapy"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

export default React.memo(TabLayout);
