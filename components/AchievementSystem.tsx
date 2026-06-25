import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRecovery } from '../hooks/useRecovery';
import LottieView from 'lottie-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const AchievementSystem = () => {
  const { soberDays } = useRecovery();
  const [showLottie, setShowLottie] = useState(false);

  useEffect(() => {
    if (soberDays > 0 && soberDays % 7 === 0) {
      setShowLottie(true);
      const timer = setTimeout(() => setShowLottie(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [soberDays]);

  const achievements = [
    { id: 1, title: 'Первый шаг', days: 1, icon: 'flare', color: '#FFD700' },
    { id: 2, title: 'Неделя свободы', days: 7, icon: 'auto-awesome', color: '#C0C0C0' },
    { id: 3, title: 'Чистый месяц', days: 30, icon: 'military-tech', color: '#CD7F32' },
    { id: 4, title: 'Квартал побед', days: 90, icon: 'workspace-premium', color: '#2E7D4A' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ваши достижения</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {achievements.map((ach) => {
          const isUnlocked = soberDays >= ach.days;
          return (
            <Animated.View
              key={ach.id}
              entering={FadeInUp.delay(ach.id * 100)}
              style={[styles.card, !isUnlocked && styles.lockedCard]}
            >
              <MaterialIcons 
                name={ach.icon as any}
                size={40}
                color={isUnlocked ? ach.color : '#CCC'}
              />
              <Text style={[styles.achTitle, !isUnlocked && styles.lockedText]}>{ach.title}</Text>
              <Text style={styles.achDays}>{ach.days} дн.</Text>
            </Animated.View>
          );
        })}
      </ScrollView>

      {showLottie && (
        <View style={styles.lottieOverlay}>
          <LottieView
            source={require('../assets/lottie/celebration.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.celebrationText}>Потрясающий результат! 🎉</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2E7D4A', marginBottom: 15 },
  scroll: { gap: 12 },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    width: width * 0.35,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lockedCard: { opacity: 0.6, backgroundColor: '#F0F0F0' },
  achTitle: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
  lockedText: { color: '#999' },
  achDays: { fontSize: 10, color: '#666', marginTop: 4 },
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  lottie: { width: 200, height: 200 },
  celebrationText: { fontSize: 22, fontWeight: 'bold', color: '#2E7D4A', marginTop: 20 }
});

export default AchievementSystem;
