import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const TabLayout = () => {
  const tabOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#2E7D4A',
    tabBarInactiveTintColor: '#666'
  };

  const homeIcon = ({ color, size }) => React.createElement(MaterialIcons, { name: 'home', size, color });
  const coachIcon = ({ color, size }) => React.createElement(MaterialIcons, { name: 'psychology', size, color });
  const techIcon = ({ color, size }) => React.createElement(MaterialIcons, { name: 'science', size, color });
  const audioIcon = ({ color, size }) => React.createElement(MaterialIcons, { name: 'headphones', size, color });
  const chatIcon = ({ color, size }) => React.createElement(MaterialIcons, { name: 'chat', size, color });
  const gamesIcon = ({ color, size }) => React.createElement(MaterialIcons, { name: 'games', size, color });

  return React.createElement(Tabs, { screenOptions: tabOptions },
    React.createElement(Tabs.Screen, { name: 'index', options: { title: 'Главная', tabBarIcon: homeIcon } }),
    React.createElement(Tabs.Screen, { name: 'ai-coach', options: { title: 'AI-Коуч', tabBarIcon: coachIcon } }),
    React.createElement(Tabs.Screen, { name: 'enhanced-exercises', options: { title: 'Техники', tabBarIcon: techIcon } }),
    React.createElement(Tabs.Screen, { name: 'sounds', options: { title: 'Аудио', tabBarIcon: audioIcon } }),
    React.createElement(Tabs.Screen, { name: 'ai-chat', options: { title: 'ИИ-Чат', tabBarIcon: chatIcon } }),
    React.createElement(Tabs.Screen, { name: 'mini-games', options: { title: 'Игры', tabBarIcon: gamesIcon } }),
    React.createElement(Tabs.Screen, { name: 'personalized-recommendations', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'advanced-analytics', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'enhanced-settings', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'gamification', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'psychology', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'therapy', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'exercises', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'community', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'profile', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'analytics', options: { href: null } })
  );
};

export default TabLayout;