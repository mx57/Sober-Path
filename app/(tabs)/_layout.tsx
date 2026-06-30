import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const TabLayout = () => {
  const tabOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#2E7D4A',
    tabBarInactiveTintColor: '#666',
    tabBarStyle: {
      height: 60,
      paddingBottom: 10,
      paddingTop: 5
    }
  };

  const homeIcon = ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />;
  const coachIcon = ({ color, size }) => <MaterialIcons name="psychology" size={size} color={color} />;
  const courseIcon = ({ color, size }) => <MaterialIcons name="school" size={size} color={color} />;
  const articlesIcon = ({ color, size }) => <MaterialIcons name="menu-book" size={size} color={color} />;
  const settingsIcon = ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} />;

  return (
    <Tabs screenOptions={tabOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: homeIcon,
        }}
      />
      <Tabs.Screen
        name="ai-coach"
        options={{
          title: 'Коуч',
          tabBarIcon: coachIcon,
        }}
      />
      <Tabs.Screen
        name="micro-courses"
        options={{
          title: 'Курсы',
          tabBarIcon: courseIcon,
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: 'Статьи',
          tabBarIcon: articlesIcon,
        }}
      />
      <Tabs.Screen
        name="enhanced-settings"
        options={{
          title: 'Настройки',
          tabBarIcon: settingsIcon,
        }}
      />

      {/* Скрытые разделы */}
      <Tabs.Screen name="ai-chat" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="mini-games" options={{ href: null }} />
      <Tabs.Screen name="enhanced-exercises" options={{ href: null }} />
      <Tabs.Screen name="personalized-recommendations" options={{ href: null }} />
      <Tabs.Screen name="advanced-analytics" options={{ href: null }} />
      <Tabs.Screen name="gamification" options={{ href: null }} />
      <Tabs.Screen name="psychology" options={{ href: null }} />
      <Tabs.Screen name="therapy" options={{ href: null }} />
      <Tabs.Screen name="exercises" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="sounds" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="advanced-therapy" options={{ href: null }} />
    </Tabs>
  );
};

export default TabLayout;
