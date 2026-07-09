import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming
} from 'react-native-reanimated';

interface StatCardProps {
  icon: string;
  number: number | string;
  label: string;
  primary?: boolean;
  index?: number;
  animatedStyle?: StyleProp<ViewStyle>;
}

export const StatCard = ({ icon, number, label, primary, index = 0, animatedStyle }: StatCardProps) => {
  const n = typeof number === 'number' ? number : parseInt(number, 10) || 0;

  const milestones = [
    { days: 1, label: 'Первый шаг', color: '#4CAF50' },
    { days: 7, label: 'Неделя', color: '#8BC34A' },
    { days: 30, label: 'Месяц', color: '#CDDC39' },
    { days: 90, label: 'Квартал', color: '#FFEB3B' },
    { days: 180, label: 'Полгода', color: '#FFC107' },
    { days: 365, label: 'Год!', color: '#FF9800' }
  ];

  const currentMilestone = milestones.reduce((prev, curr) =>
    (n >= curr.days) ? curr : prev
  , milestones[0]);

  const nextMilestone = milestones.find(m => m.days > n) || milestones[milestones.length - 1];
  const prevMilestoneDays = milestones.filter(m => m.days <= n).pop()?.days || 0;
  const progress = n >= 365 ? 1 : (n - prevMilestoneDays) / (nextMilestone.days - prevMilestoneDays);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 100, withSpring(0));
  }, []);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  const CardContainer = primary ? LinearGradient : View;
  const cardProps = primary ? {
    colors: ['#2E7D4A', '#4CAF50'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  } : {};

  return (
    <Animated.View style={[
      styles.statCard,
      primary && styles.primaryStatCard,
      animatedStyle,
      entranceStyle
    ]}>
      <CardContainer {...cardProps as any} style={styles.cardInternal}>
        <MaterialIcons name={icon as any} size={primary ? 40 : 28} color={primary ? 'white' : '#FF9800'} />
        <Text style={[styles.statNumber, primary && styles.statNumberPrimary]}>{number}</Text>
        <Text style={[styles.statLabel, primary && styles.statLabelPrimary]}>{label}</Text>

        {primary && (
          <View style={styles.milestoneContainer}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneText}>Этап: {currentMilestone.label}</Text>
              {n < 365 && (
                <Text style={styles.nextMilestoneText}>До {nextMilestone.label}: {nextMilestone.days - n} дн.</Text>
              )}
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        )}
      </CardContainer>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden'
  },
  cardInternal: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  primaryStatCard: {
    backgroundColor: '#2E7D4A',
    shadowColor: '#2E7D4A',
    shadowOpacity: 0.3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginTop: 8
  },
  statNumberPrimary: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500'
  },
  statLabelPrimary: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    fontWeight: '500'
  },
  milestoneContainer: {
    width: '100%',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nextMilestoneText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  }
});
