import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2E7D4A', tabBarInactiveTintColor: '#666' }}>
      <Tabs.Screen name="index" options={{ title: 'Главная', tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="ai-coach" options={{ title: 'AI-Коуч', tabBarIcon: ({ color, size }) => <MaterialIcons name="psychology" size={size} color={color} /> }} />
      <Tabs.Screen name="enhanced-exercises" options={{ title: 'Техники', tabBarIcon: ({ color, size }) => <MaterialIcons name="science" size={size} color={color} /> }} />
      <Tabs.Screen name="sounds" options={{ title: 'Аудио', tabBarIcon: ({ color, size }) => <MaterialIcons name="headphones" size={size} color={color} /> }} />
      <Tabs.Screen name="ai-chat" options={{ title: 'ИИ-Чат', tabBarIcon: ({ color, size }) => <MaterialIcons name="chat" size={size} color={color} /> }} />
      <Tabs.Screen name="mini-games" options={{ title: 'Игры', tabBarIcon: ({ color, size }) => <MaterialIcons name="games" size={size} color={color} /> }} />
      <Tabs.Screen name="personalized-recommendations" options={{ href: null }} />
      <Tabs.Screen name="advanced-analytics" options={{ href: null }} />
      <Tabs.Screen name="enhanced-settings" options={{ href: null }} />
      <Tabs.Screen name="gamification" options={{ href: null }} />
      <Tabs.Screen name="psychology" options={{ href: null }} />
      <Tabs.Screen name="therapy" options={{ href: null }} />
      <Tabs.Screen name="exercises" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
    </Tabs>
  );
}