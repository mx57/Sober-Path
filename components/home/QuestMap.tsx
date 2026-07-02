import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QuestService, QuestMilestone } from '../../services/questService';
import { useAppTheme } from '../../contexts/ThemeContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface QuestMapProps {
  soberDays: number;
  onMilestonePress?: (milestone: QuestMilestone) => void;
}

export const QuestMap: React.FC<QuestMapProps> = ({ soberDays, onMilestonePress }) => {
  const { colors } = useAppTheme();
  const [milestones, setMilestones] = useState<QuestMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMilestones();
  }, [soberDays]);

  const loadMilestones = async () => {
    const data = await QuestService.getQuestMap(soberDays);
    setMilestones(data);
    setLoading(false);
  };

  const progressPercentage = useMemo(() =>
    QuestService.getProgressPercentage(milestones),
  [milestones]);

  const renderPath = () => {
    return (
      <View style={styles.pathContainer}>
        {milestones.map((m, index) => {
          const isLast = index === milestones.length - 1;
          const isCompleted = m.completed;
          const isUnlocked = m.unlocked;

          return (
            <React.Fragment key={m.id}>
              <Animated.View
                entering={FadeIn.delay(index * 100)}
                style={styles.nodeWrapper}
              >
                <TouchableOpacity
                  style={[
                    styles.node,
                    {
                      backgroundColor: isCompleted ? colors.primary : isUnlocked ? colors.secondary + '40' : '#E0E0E0',
                      borderColor: isCompleted ? colors.primary : isUnlocked ? colors.primary : '#BDBDBD'
                    }
                  ]}
                  onPress={() => onMilestonePress?.(m)}
                  disabled={!isUnlocked}
                >
                  <MaterialIcons
                    name={isCompleted ? "check" : isUnlocked ? "lock-open" : "lock"}
                    size={24}
                    color={isCompleted ? "white" : isUnlocked ? colors.primary : "#9E9E9E"}
                  />
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>{m.day}</Text>
                  </View>
                </TouchableOpacity>
                <Text style={[styles.nodeTitle, { color: isUnlocked ? '#333' : '#9E9E9E' }]} numberOfLines={1}>
                  {m.title}
                </Text>
              </Animated.View>

              {!isLast && (
                <View style={[
                  styles.connector,
                  { backgroundColor: isCompleted ? colors.primary : '#E0E0E0' }
                ]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.primary }]}>Карта квеста: 30 дней</Text>
          <Text style={styles.subtitle}>Пройдите путь к первому месяцу свободы</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={[styles.progressText, { color: colors.primary }]}>{progressPercentage}%</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: colors.secondary + '20' }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { backgroundColor: colors.primary, width: `${progressPercentage}%` }
            ]}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderPath()}
      </ScrollView>

      {soberDays > 0 && soberDays <= 30 && (
        <LinearGradient
          colors={[colors.primary + '10', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.infoCard}
        >
          <MaterialIcons name="info" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Следующий этап через {milestones.find(m => !m.completed && m.day > soberDays)?.day ?
              milestones.find(m => !m.completed && m.day > soberDays)!.day - soberDays : '?'} дн.
          </Text>
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  progressText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressBarContainer: {
    marginBottom: 25,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scrollContent: {
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  pathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeWrapper: {
    alignItems: 'center',
    width: 80,
  },
  node: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
    backgroundColor: 'white',
  },
  nodeTitle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  dayBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#333',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  connector: {
    height: 4,
    width: 30,
    marginHorizontal: -5,
    zIndex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  }
});
