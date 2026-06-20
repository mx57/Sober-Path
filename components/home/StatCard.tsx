import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

interface StatCardProps {
  icon: string;
  number: number | string;
  label: string;
  primary?: boolean;
  animatedStyle?: any;
}

export const StatCard = ({ icon, number, label, primary, animatedStyle }: StatCardProps) => {
  const CardView = animatedStyle ? Animated.View : View;

  return (
    <CardView style={[
      styles.statCard,
      primary && styles.primaryStatCard,
      animatedStyle
    ]}>
      <MaterialIcons name={icon as any} size={primary ? 40 : 28} color={primary ? 'white' : '#FF9800'} />
      <Text style={[styles.statNumber, primary && styles.statNumberPrimary]}>{number}</Text>
      <Text style={[styles.statLabel, primary && styles.statLabelPrimary]}>{label}</Text>
    </CardView>
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
