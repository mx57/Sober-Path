import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
}

export const StatCard = ({ icon, number, label, primary, index = 0 }: StatCardProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 100, withSpring(0));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View style={[
      styles.statCard,
      primary && styles.primaryStatCard,
      animatedStyle
    ]}>
      <MaterialIcons name={icon as any} size={primary ? 40 : 28} color={primary ? 'white' : '#FF9800'} />
      <Text style={[styles.statNumber, primary && styles.statNumberPrimary]}>{number}</Text>
      <Text style={[styles.statLabel, primary && styles.statLabelPrimary]}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  primaryStatCard: {
    backgroundColor: '#2E7D4A',
    alignItems: 'center',
    padding: 25
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
  }
});
