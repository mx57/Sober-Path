import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QuestMilestone } from '../services/questService';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  primary: '#2E7D4A',
  secondary: '#4CAF50',
  text: '#333333',
  textSecondary: '#666666',
  card: '#F0F0F0',
  border: '#E0E0E0',
  accent: '#FFB300',
};

interface QuestMapProps {
  milestones: QuestMilestone[];
  currentSoberDays: number;
}

export const QuestMap: React.FC<QuestMapProps> = ({ milestones, currentSoberDays }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<QuestMilestone | null>(null);
  const colors = COLORS;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="map" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Квест: Первые 30 дней</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {milestones.map((milestone, index) => {
          const isCompleted = currentSoberDays >= milestone.day;
          const isCurrent = !isCompleted && (index === 0 || currentSoberDays >= milestones[index - 1].day);

          return (
            <Animated.View
              entering={FadeInRight.delay(index * 150)}
              key={milestone.id}
              style={styles.milestoneWrapper}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedMilestone(milestone)}
                style={[
                  styles.node,
                  { backgroundColor: isCompleted ? colors.primary : isCurrent ? 'white' : colors.card },
                  isCurrent && { borderColor: colors.primary, borderWidth: 2 }
                ]}
              >
                <MaterialIcons
                  name={isCompleted ? milestone.icon as any : isCurrent ? milestone.icon as any : 'lock'}
                  size={24}
                  color={isCompleted ? '#fff' : isCurrent ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
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
            </Animated.View>
          );
        })}
      </ScrollView>

      <Modal
        visible={selectedMilestone !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMilestone(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMilestone && (
              <>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.modalHeader}
                >
                  <MaterialIcons name={selectedMilestone.icon as any} size={48} color="white" />
                  <Text style={styles.modalTitle}>{selectedMilestone.title}</Text>
                  <Text style={styles.modalDay}>{selectedMilestone.day} день пути</Text>
                </LinearGradient>

                <View style={styles.modalBody}>
                  <Text style={styles.modalDescription}>{selectedMilestone.description}</Text>

                  <View style={styles.rewardSection}>
                    <View style={styles.rewardHeader}>
                      <MaterialIcons name="stars" size={20} color={colors.accent} />
                      <Text style={styles.rewardTitle}>Награда:</Text>
                    </View>
                    <Text style={styles.rewardText}>{selectedMilestone.reward}</Text>
                  </View>

                  <View style={styles.statusSection}>
                    <MaterialIcons
                      name={currentSoberDays >= selectedMilestone.day ? "check-circle" : "info"}
                      size={20}
                      color={currentSoberDays >= selectedMilestone.day ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                      styles.statusText,
                      { color: currentSoberDays >= selectedMilestone.day ? colors.primary : colors.textSecondary }
                    ]}>
                      {currentSoberDays >= selectedMilestone.day ? 'Завершено' : `Нужно еще ${selectedMilestone.day - currentSoberDays} дн.`}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedMilestone(null)}
                >
                  <Text style={styles.closeButtonText}>Понятно</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.85,
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  modalDay: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  modalBody: {
    padding: 24,
    gap: 20,
  },
  modalDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    textAlign: 'center',
  },
  rewardSection: {
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFF176',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rewardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F57F17',
    textTransform: 'uppercase',
  },
  rewardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
  }
});
