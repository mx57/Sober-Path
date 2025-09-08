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
            ios: insets.bottom + 80,
            android: insets.bottom + 80,
            default: 90
          }),
          paddingTop: 8,
          paddingBottom: Platform.select({
            ios: insets.bottom + 12,
            android: insets.bottom + 12,
            default: 12
          }),
          paddingHorizontal: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Прогресс',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="timeline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="psychology"
        options={{
          title: 'Советы',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="psychology" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="therapy"
        options={{
          title: 'Терапия',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="healing" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'НЛП',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="self-improvement" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sounds"
        options={{
          title: 'Аудио',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="headphones" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Сообщество',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}