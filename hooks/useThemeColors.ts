import { useRecovery } from '../contexts/RecoveryContext';

export function useThemeColors() {
  const { userProfile } = useRecovery();
  const themeId = userProfile?.theme || 'nature';

  const themesColors: Record<string, {
    primary: string;
    secondary: string;
    gradient: [string, string];
    background: string;
    cardBackground: string;
    text: string;
    border: string;
    isDark: boolean;
  }> = {
    nature: {
      primary: '#2E7D4A',
      secondary: '#4CAF50',
      gradient: ['#2E7D4A', '#4CAF50'],
      background: '#F8F9FA',
      cardBackground: '#FFFFFF',
      text: '#333333',
      border: '#E0E0E0',
      isDark: false
    },
    ocean: {
      primary: '#1565C0',
      secondary: '#2196F3',
      gradient: ['#1565C0', '#2196F3'],
      background: '#F0F4F8',
      cardBackground: '#FFFFFF',
      text: '#333333',
      border: '#D0DDF0',
      isDark: false
    },
    sunset: {
      primary: '#E65100',
      secondary: '#FF9800',
      gradient: ['#E65100', '#FF9800'],
      background: '#FFF8F0',
      cardBackground: '#FFFFFF',
      text: '#333333',
      border: '#FFE0B2',
      isDark: false
    },
    minimal: {
      primary: '#37474F',
      secondary: '#607D8B',
      gradient: ['#37474F', '#607D8B'],
      background: '#F5F7F8',
      cardBackground: '#FFFFFF',
      text: '#333333',
      border: '#CFD8DC',
      isDark: false
    },
    dark: {
      primary: '#4CAF50',
      secondary: '#2A2A2A',
      gradient: ['#121212', '#1C1C1E'],
      background: '#121212',
      cardBackground: '#1C1C1E',
      text: '#ECEDEE',
      border: '#2C2C2E',
      isDark: true
    }
  };

  return themesColors[themeId] || themesColors.nature;
}
