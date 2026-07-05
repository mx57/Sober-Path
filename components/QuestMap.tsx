import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QuestMilestone } from '../services/questService';

const COLORS = {
  primary: '#2E7D4A',
  text: '#333333',
  textSecondary: '#666666',
  card: '#F0F0F0',
  border: '#E0E0E0',
};

interface QuestMapProps {
  milestones: QuestMilestone[];
  currentSoberDays: number;
}

export const QuestMap: React.FC<QuestMapProps> = ({ milestones, currentSoberDays }) => {
  const colors = COLORS;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Квест: Первые 30 дней</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {milestones.map((milestone, index) => {
          const isCompleted = currentSoberDays >= milestone.day;
          const isCurrent = !isCompleted && (index === 0 || currentSoberDays >= milestones[index - 1].day);

          return (
            <View key={milestone.id} style={styles.milestoneWrapper}>
              <View style={[
                styles.node,
                { backgroundColor: isCompleted ? colors.primary : colors.card },
                isCurrent && { borderColor: colors.primary, borderWidth: 2 }
              ]}>
                <MaterialIcons
                  name={isCompleted ? 'check-circle' : 'lock'}
                  size={24}
                  color={isCompleted ? '#fff' : colors.textSecondary}
                />
              </View>
              <Text style={[styles.dayText, { color: colors.text }]}>{milestone.day} день</Text>
              <Text style={[styles.nodeTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {milestone.title}
              </Text>

              {index < milestones.length - 1 && (
                <View style={[
                  styles.connector,
                  { backgroundColor: isCompleted ? colors.primary : colors.border }
                ]} />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  milestoneWrapper: {
    alignItems: 'center',
    width: 100,
    position: 'relative',
  },
  node: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dayText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  nodeTitle: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  connector: {
    position: 'absolute',
    top: 25,
    left: 75,
    width: 50,
    height: 3,
    zIndex: 1,
  }
});
