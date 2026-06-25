import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const TabLayout = () => {
  const tabOptions = {
    headerShown: false,
    tabBarActiveTintColor: '#2E7D4A',
    tabBarInactiveTintColor: '#666'
  };

  return React.createElement(Tabs, { screenOptions: tabOptions },
    React.createElement(Tabs.Screen, { name: 'index', options: { title: 'Главная', tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, { name: 'home', size, color }) } }),
    React.createElement(Tabs.Screen, { name: 'ai-coach', options: { title: 'Коуч', tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, { name: 'psychology', size, color }) } }),
    React.createElement(Tabs.Screen, { name: 'journal', options: { title: 'Дневник', tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, { name: 'edit-note', size, color }) } }),
    React.createElement(Tabs.Screen, { name: 'articles', options: { title: 'База знаний', tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, { name: 'menu-book', size, color }) } }),
    React.createElement(Tabs.Screen, { name: 'community', options: { title: 'Сообщество', tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, { name: 'groups', size, color }) } }),
    React.createElement(Tabs.Screen, { name: 'enhanced-exercises', options: { title: 'Техники', tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, { name: 'science', size, color }) } }),
    React.createElement(Tabs.Screen, { name: 'enhanced-settings', options: { title: 'Настройки', tabBarIcon: ({ color, size }) => React.createElement(MaterialIcons, { name: 'settings', size, color }) } }),
    React.createElement(Tabs.Screen, { name: 'ai-chat', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'mini-games', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'personalized-recommendations', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'advanced-analytics', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'gamification', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'psychology', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'therapy', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'exercises', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'profile', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'analytics', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'sounds', options: { href: null } }),
    React.createElement(Tabs.Screen, { name: 'advanced-therapy', options: { href: null } })
  );
};

export default TabLayout;