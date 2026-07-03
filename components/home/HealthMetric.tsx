import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface HealthMetricProps {
  metric: {
    icon: string;
    text: string;
    color: string;
    days: number;
    type: string;
  };
  onPress: () => void;
}

export const MemoizedHealthMetric = React.memo(function MemoizedHealthMetric({ metric, onPress }: HealthMetricProps) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.healthMetric, { borderColor: metric.color }]}>
      <MaterialIcons name={metric.icon as any} size={24} color={metric.color} />
      <Text style={styles.healthText}>{metric.text}</Text>
      <Text style={styles.healthDays}>{t('common.days')} {metric.days}+</Text>
      <View style={styles.tapHint}>
        <MaterialIcons name="info-outline" size={14} color={metric.color} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  healthMetric: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 120,
    position: 'relative'
  },
  healthText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center'
  },
  healthDays: {
    fontSize: 11,
    color: '#666',
    marginTop: 2
  },
  tapHint: {
    position: 'absolute',
    top: 4,
    right: 4,
    opacity: 0.6
  },
});
