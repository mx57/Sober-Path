import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = 'nature' | 'ocean' | 'sunset' | 'midnight';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
}

const THEME_COLORS: Record<AppTheme, ThemeColors> = {
  nature: {
    primary: '#2E7D4A',
    secondary: '#4CAF50',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#333333',
    subtext: '#666666',
    border: '#E0E0E0',
  },
  ocean: {
    primary: '#0277BD',
    secondary: '#03A9F4',
    background: '#F0F8FF',
    card: '#FFFFFF',
    text: '#01579B',
    subtext: '#4FC3F7',
    border: '#B3E5FC',
  },
  sunset: {
    primary: '#D84315',
    secondary: '#FF5722',
    background: '#FFF8E1',
    card: '#FFFFFF',
    text: '#BF360C',
    subtext: '#FF8A65',
    border: '#FFCCBC',
  },
  midnight: {
    primary: '#311B92',
    secondary: '#673AB7',
    background: '#121212',
    card: '#1E1E1E',
    text: '#EDE7F6',
    subtext: '#B39DDB',
    border: '#311B92',
  },
};

interface ThemeContextType {
  theme: AppTheme;
  colors: ThemeColors;
  setTheme: (theme: AppTheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>('nature');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('sober_path_theme');
      if (savedTheme) {
        setThemeState(savedTheme as AppTheme);
      }
    };
    loadTheme();
  }, []);

  const setTheme = useCallback(async (newTheme: AppTheme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('sober_path_theme', newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, colors: THEME_COLORS[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
