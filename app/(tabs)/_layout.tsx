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

  return React.createElement(Tabs, { screenOptions: tabOptions },
    React.createElement(Tabs.Screen, { name: 'index', options: { title: 'Главная', tabBarIcon: homeIcon } }),
    React.createElement(Tabs.Screen, { name: 'ai-coach', options: { title: 'AI-Коуч', tabBarIcon: coachIcon } }),
    React.createElement(Tabs.Screen, { name: 'courses', options: { title: 'Курсы', tabBarIcon: techIcon } }),
    React.createElement(Tabs.Screen, { name: 'articles', options: { title: 'Статьи', tabBarIcon: audioIcon } }),
    React.createElement(Tabs.Screen, { name: 'ai-chat', options: { title: 'ИИ-Чат', tabBarIcon: chatIcon } }),
    React.createElement(Tabs.Screen, { name: 'mini-games', options: { title: 'Игры', tabBarIcon: gamesIcon } }),
    React.createElement(Tabs.Screen, { name: 'enhanced-settings', options: { title: 'Настройки', tabBarIcon: settingsIcon } }),
    React.createElement(Tabs.Screen, { name: 'personalized-recommendations', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'advanced-analytics', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'gamification', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'psychology', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'therapy', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'enhanced-exercises', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'exercises', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'community', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'profile', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'analytics', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'sounds', options: { href: null } })
  );
};

export default TabLayout;
