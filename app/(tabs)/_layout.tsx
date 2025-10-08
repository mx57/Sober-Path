import { Tabs } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import React from 'react'

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  return (
<Tabs screenOptions={{headerShown: false,tabBarActiveTintColor: '#2E7D4A',tabBarInactiveTintColor: '#666',tabBarStyle: {height: Platform.OS === 'ios' ? insets.bottom + 70 : 70,paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 8,paddingTop: 8,paddingHorizontal: 4}}}>
<Tabs.Screen name="index" options={{title: 'Главная',tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, {name: "home", size: size, color: color})}} />
<Tabs.Screen name="ai-coach" options={{title: 'AI-Коуч',tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, {name: "psychology", size: size, color: color})}} />
<Tabs.Screen name="enhanced-exercises" options={{title: 'Техники',tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, {name: "science", size: size, color: color})}} />
<Tabs.Screen name="sounds" options={{title: 'Аудио',tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, {name: "headphones", size: size, color: color})}} />
<Tabs.Screen name="ai-chat" options={{title: 'ИИ-Чат',tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, {name: "chat", size: size, color: color})}} />
<Tabs.Screen name="mini-games" options={{title: 'Игры',tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, {name: "games", size: size, color: color})}} />
<Tabs.Screen name="personalized-recommendations" options={{href: null}} />
<Tabs.Screen name="advanced-analytics" options={{href: null}} />
<Tabs.Screen name="enhanced-settings" options={{href: null}} />
<Tabs.Screen name="gamification" options={{href: null}} />
<Tabs.Screen name="psychology" options={{href: null}} />
<Tabs.Screen name="therapy" options={{href: null}} />
<Tabs.Screen name="exercises" options={{href: null}} />
<Tabs.Screen name="community" options={{href: null}} />
<Tabs.Screen name="profile" options={{href: null}} />
<Tabs.Screen name="analytics" options={{href: null}} />
</Tabs>
  )
}