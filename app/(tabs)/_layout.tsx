import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
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
          paddingHorizontal: 4
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: -2
        },
        tabBarIconStyle: {
          marginBottom: 2
        }
      }}
    >
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
        name="advanced-therapy"
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
        name="gamification"
        options={{
          title: 'Награды',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="emoji-events" size={size - 2} color={color} />
          ),
        }}
      />
      
      {/* Скрытые страницы - доступны через навигацию, но не отображаются в табах */}
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