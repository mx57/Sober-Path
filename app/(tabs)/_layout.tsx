import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

type TabIconProps = { color: string; size: number };

const TabLayout = () => {
  const themeColors = useThemeColors();

  const tabOptions = {
    headerShown: false,
    tabBarActiveTintColor: themeColors.primary,
    tabBarInactiveTintColor: themeColors.isDark ? '#888' : '#666',
    tabBarStyle: {
      height: 60,
      paddingBottom: 10,
      paddingTop: 5,
      backgroundColor: themeColors.cardBackground,
      borderTopColor: themeColors.border,
    }
  };

  const homeIcon = ({ color, size }: TabIconProps) => <MaterialIcons name="home" size={size} color={color} />;
  const coachIcon = ({ color, size }: TabIconProps) => <MaterialIcons name="psychology" size={size} color={color} />;
  const courseIcon = ({ color, size }: TabIconProps) => <MaterialIcons name="school" size={size} color={color} />;
  const communityIcon = ({ color, size }: TabIconProps) => <MaterialIcons name="people" size={size} color={color} />;
  const settingsIcon = ({ color, size }: TabIconProps) => <MaterialIcons name="settings" size={size} color={color} />;

  return React.createElement(Tabs, { screenOptions: tabOptions },
    React.createElement(Tabs.Screen, { name: 'index', options: { title: 'Главная', tabBarIcon: homeIcon } }),
    React.createElement(Tabs.Screen, { name: 'community', options: { title: 'Общение', tabBarIcon: communityIcon } }),
    React.createElement(Tabs.Screen, { name: 'ai-coach', options: { title: 'AI-Коуч', tabBarIcon: coachIcon } }),
    React.createElement(Tabs.Screen, { name: 'courses', options: { title: 'Курсы', tabBarIcon: courseIcon } }),
    React.createElement(Tabs.Screen, { name: 'enhanced-settings', options: { title: 'Настройки', tabBarIcon: settingsIcon } }),
    React.createElement(Tabs.Screen, { name: 'articles', options: { href: null } }),
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
    React.createElement(Tabs.Screen, { name: 'sounds', options: { href: null } })
  );
};

export default TabLayout;
