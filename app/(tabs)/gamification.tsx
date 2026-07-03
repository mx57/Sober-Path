import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Platform, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withRepeat,
  interpolate 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  category: 'days' | 'techniques' | 'social' | 'health' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
  benefits?: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  objectives: {
    text: string;
    completed: boolean;
    progress: number;
    maxProgress: number;
  }[];
  rewards: {
    xp: number;
    badges?: string[];
    unlocks?: string[];
  };
  timeLimit?: Date;
  category: string;
}

interface UserLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  title: string;
  benefits: string[];
}

export default function GamificationDashboard() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'achievements' | 'challenges' | 'leaderboard' | 'rewards'>('achievements');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 5,
    currentXP: 1250,
    xpToNextLevel: 1750,
    title: 'Начинающий Воин',
    benefits: ['Доступ к базовым техникам', 'Ежедневные награды', 'Базовая аналитика']
  });

  // Web alert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  // Анимации
  const levelAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const celebrationAnimation = useSharedValue(0);

  useEffect(() => {
    loadGamificationData();
    
    levelAnimation.value = withSpring(1);
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const loadGamificationData = () => {
    // Данные достижений
    const achievementsData: Achievement[] = [
      {
        id: '1',
        title: 'Первый день',
        description: 'Прожить первый день без алкоголя',
        icon: 'today',
        progress: 1,
        maxProgress: 1,
        category: 'days',
        rarity: 'common',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        xpReward: 50
      },
      {
        id: '2',
        title: 'Неделя силы',
        description: '7 дней подряд без алкоголя',
        icon: 'calendar-view-week',
        progress: 7,
        maxProgress: 7,
        category: 'days',
        rarity: 'rare',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        xpReward: 200
      },
      {
        id: '3',
        title: 'Мастер техник',
        description: 'Изучить 10 психологических техник',
        icon: 'psychology',
        progress: 7,
        maxProgress: 10,
        category: 'techniques',
        rarity: 'epic',
        unlocked: false,
        xpReward: 500
      },
      {
        id: '4',
        title: 'Центурион',
        description: '100 дней трезвости',
        icon: 'military-tech',
        progress: 45,
        maxProgress: 100,
        category: 'days',
        rarity: 'legendary',
        unlocked: false,
        xpReward: 2000,
        benefits: ['Эксклюзивные техники', 'Персональный коуч', 'VIP поддержка']
      },
      {
        id: '5',
        title: 'Социальная бабочка',
        description: 'Помочь 5 участникам сообщества',
        icon: 'people',
        progress: 2,
        maxProgress: 5,
        category: 'social',
        rarity: 'rare',
        unlocked: false,
        xpReward: 300
      }
    ];

    // Данные вызовов
    const challengesData: Challenge[] = [
      {
        id: '1',
        title: 'Утренний ритуал',
        description: 'Выполняйте утренние техники 7 дней подряд',
        type: 'weekly',
        difficulty: 'easy',
        objectives: [
          { text: 'Медитация 10 минут', completed: true, progress: 5, maxProgress: 7 },
          { text: 'Дыхательные упражнения', completed: false, progress: 3, maxProgress: 7 },
          { text: 'Позитивные аффирмации', completed: false, progress: 4, maxProgress: 7 }
        ],
        rewards: { xp: 300, badges: ['Раннее утро'] },
        timeLimit: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        category: 'wellness'
      },
      {
        id: '2',
        title: 'Кризис-менеджер',
        description: 'Преодолейте 3 кризисных момента без срыва',
        type: 'monthly',
        difficulty: 'hard',
        objectives: [
          { text: 'Использовать экстренные техники', completed: true, progress: 2, maxProgress: 3 },
          { text: 'Обратиться за поддержкой', completed: false, progress: 1, maxProgress: 3 },
          { text: 'Записать урок из кризиса', completed: false, progress: 1, maxProgress: 3 }
        ],
        rewards: { xp: 800, badges: ['Антикризисный герой'], unlocks: ['Продвинутые техники'] },
        category: 'resilience'
      },
      {
        id: '3',
        title: 'Здоровый образ жизни',
        description: 'Поддерживайте здоровые привычки целую неделю',
        type: 'weekly',
        difficulty: 'medium',
        objectives: [
          { text: '8 часов сна каждый день', completed: false, progress: 4, maxProgress: 7 },
          { text: '2 литра воды в день', completed: false, progress: 6, maxProgress: 7 },
          { text: '30 минут физической активности', completed: false, progress: 5, maxProgress: 7 }
        ],
        rewards: { xp: 400, badges: ['Здоровяк'] },
        category: 'health'
      }
    ];

    setAchievements(achievementsData);
    setChallenges(challengesData);
  };

  const getRarityColor = (rarity: string): readonly [string, string] => {
    switch (rarity) {
      case 'common': return ['#95A5A6', '#BDC3C7'];
      case 'rare': return ['#3498DB', '#5DADE2'];
      case 'epic': return ['#9B59B6', '#BB8FCE'];
      case 'legendary': return ['#F39C12', '#F8C471'];
      default: return ['#95A5A6', '#BDC3C7'];
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#27AE60';
      case 'medium': return '#F39C12';
      case 'hard': return '#E74C3C';
      case 'extreme': return '#8E44AD';
      default: return '#95A5A6';
    }
  };

  const claimAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      celebrationAnimation.value = withSpring(1);
      showWebAlert(
        'Достижение разблокировано! 🎉',
        `Поздравляем! Вы получили "${achievement.title}" и ${achievement.xpReward} XP!`,
        () => {
          celebrationAnimation.value = withSpring(0);
        }
      );
    }
  };

  const animatedLevelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelAnimation.value }]
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulseAnimation.value * 0.1 }]
  }));

  const renderAchievementsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {/* Уровень пользователя */}
      <Animated.View style={[styles.levelCard, animatedLevelStyle]}>
        <LinearGradient
          colors={['#2E7D4A', '#4CAF50']}
          style={styles.levelGradient}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelNumber}>Уровень {userLevel.level}</Text>
              <Text style={styles.levelTitle}>{userLevel.title}</Text>
            </View>
            <Animated.View style={[styles.levelIcon, pulseStyle]}>
              <MaterialIcons name="military-tech" size={32} color="#FFD700" />
            </Animated.View>
          </View>
          
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>{userLevel.currentXP} / {userLevel.xpToNextLevel} XP</Text>
            <View style={styles.xpBar}>
              <View 
                style={[
                  styles.xpFill, 
                  { width: `${(userLevel.currentXP / userLevel.xpToNextLevel) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Достижения */}
      <Text style={styles.sectionTitle}>Достижения</Text>
      {achievements.map((achievement) => (
        <View key={achievement.id} style={styles.achievementCard}>
          <LinearGradient
            colors={getRarityColor(achievement.rarity)}
            style={styles.achievementGradient}
          >
            <View style={styles.achievementHeader}>
              <MaterialIcons 
                name={achievement.icon as any} 
                size={40} 
                color={achievement.unlocked ? '#FFF' : 'rgba(255,255,255,0.5)'} 
              />
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementTitle, !achievement.unlocked && styles.lockedText]}>
                  {achievement.title}
                </Text>
                <Text style={[styles.achievementDescription, !achievement.unlocked && styles.lockedText]}>
                  {achievement.description}
                </Text>
                <Text style={[styles.achievementReward, !achievement.unlocked && styles.lockedText]}>
                  +{achievement.xpReward} XP
                </Text>
              </View>
              {achievement.unlocked && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </View>

            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, !achievement.unlocked && styles.lockedText]}>
                {achievement.progress} / {achievement.maxProgress}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(achievement.progress / achievement.maxProgress) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            {achievement.unlocked && achievement.progress >= achievement.maxProgress && !achievement.unlockedAt && (
              <TouchableOpacity 
                style={styles.claimButton}
                onPress={() => claimAchievement(achievement.id)}
              >
                <Text style={styles.claimButtonText}>Получить награду</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      ))}
    </ScrollView>
  );

  const renderChallengesTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionTitle}>Активные вызовы</Text>
      {challenges.map((challenge) => (
        <View key={challenge.id} style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              <View style={styles.challengeMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
                  <Text style={styles.difficultyText}>{challenge.difficulty.toUpperCase()}</Text>
                </View>
                <Text style={styles.challengeType}>{challenge.type}</Text>
              </View>
            </View>
          </View>

          <View style={styles.objectivesContainer}>
            <Text style={styles.objectivesTitle}>Цели:</Text>
            {challenge.objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <MaterialIcons 
                  name={objective.completed ? "check-circle" : "radio-button-unchecked"} 
                  size={20} 
                  color={objective.completed ? "#4CAF50" : "#999"} 
                />
                <View style={styles.objectiveInfo}>
                  <Text style={[styles.objectiveText, objective.completed && styles.completedText]}>
                    {objective.text}
                  </Text>
                  <View style={styles.objectiveProgress}>
                    <View 
                      style={[
                        styles.objectiveProgressFill, 
                        { width: `${(objective.progress / objective.maxProgress) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.objectiveProgressText}>
                    {objective.progress}/{objective.maxProgress}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.rewardsContainer}>
            <Text style={styles.rewardsTitle}>Награды:</Text>
            <Text style={styles.rewardText}>+{challenge.rewards.xp} XP</Text>
            {challenge.rewards.badges && challenge.rewards.badges.map((badge, index) => (
              <Text key={index} style={styles.badgeText}>🏆 {badge}</Text>
            ))}
          </View>

          {challenge.timeLimit && (
            <View style={styles.timeLimit}>
              <MaterialIcons name="access-time" size={16} color="#FF6B6B" />
              <Text style={styles.timeLimitText}>
                До: {challenge.timeLimit.toLocaleDateString('ru')}
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderLeaderboardTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionTitle}>Рейтинг сообщества</Text>
      
      <View style={styles.leaderboardCard}>
        <Text style={styles.leaderboardTitle}>Топ игроков этой недели</Text>
        
        {[
          { rank: 1, name: 'Алексей М.', level: 12, xp: 5420, streak: 45 },
          { rank: 2, name: 'Мария К.', level: 10, xp: 4890, streak: 38 },
          { rank: 3, name: 'Дмитрий В.', level: 9, xp: 4200, streak: 42 },
          { rank: 4, name: 'Вы', level: 5, xp: 1250, streak: 8 },
          { rank: 5, name: 'Анна С.', level: 6, xp: 1180, streak: 12 }
        ].map((player) => (
          <View key={player.rank} style={[
            styles.leaderboardItem,
            player.name === 'Вы' && styles.currentPlayer
          ]}>
            <View style={styles.rankContainer}>
              <Text style={[styles.rankText, player.rank <= 3 && styles.topRank]}>
                #{player.rank}
              </Text>
              {player.rank === 1 && <MaterialIcons name="emoji-events" size={20} color="#FFD700" />}
              {player.rank === 2 && <MaterialIcons name="emoji-events" size={20} color="#C0C0C0" />}
              {player.rank === 3 && <MaterialIcons name="emoji-events" size={20} color="#CD7F32" />}
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerStats}>
                Уровень {player.level} • {player.xp} XP • {player.streak} дней
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderRewardsTab = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.sectionTitle}>Магазин наград</Text>
      
      <View style={styles.currencyCard}>
        <MaterialIcons name="stars" size={32} color="#FFD700" />
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyAmount}>1,250 XP</Text>
          <Text style={styles.currencyLabel}>Доступно для трат</Text>
        </View>
      </View>

      {[
        {
          id: '1',
          name: 'Персональная консультация',
          description: 'Индивидуальная сессия с психологом',
          cost: 2000,
          icon: 'psychology',
          category: 'premium'
        },
        {
          id: '2',
          name: 'Эксклюзивные техники',
          description: 'Доступ к продвинутым методам терапии',
          cost: 1500,
          icon: 'auto-awesome',
          category: 'content'
        },
        {
          id: '3',
          name: 'Персональный аватар',
          description: 'Уникальный аватар для профиля',
          cost: 500,
          icon: 'account-circle',
          category: 'cosmetic'
        },
        {
          id: '4',
          name: 'Дополнительная мотивация',
          description: 'Персональные мотивационные сообщения',
          cost: 800,
          icon: 'favorite',
          category: 'feature'
        }
      ].map((reward) => (
        <View key={reward.id} style={styles.rewardCard}>
          <MaterialIcons name={reward.icon as any} size={40} color="#2E7D4A" />
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardName}>{reward.name}</Text>
            <Text style={styles.rewardDescription}>{reward.description}</Text>
            <Text style={styles.rewardCost}>{reward.cost} XP</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.purchaseButton,
              userLevel.currentXP < reward.cost && styles.purchaseButtonDisabled
            ]}
            disabled={userLevel.currentXP < reward.cost}
            onPress={() => showWebAlert('Покупка', `Приобрести "${reward.name}" за ${reward.cost} XP?`)}
          >
            <Text style={[
              styles.purchaseButtonText,
              userLevel.currentXP < reward.cost && styles.purchaseButtonTextDisabled
            ]}>
              {userLevel.currentXP >= reward.cost ? 'Купить' : 'Недостаточно XP'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Достижения</Text>
        <MaterialIcons name="emoji-events" size={28} color="#FFD700" />
      </View>

      {/* Табы */}
      <View style={styles.tabBar}>
        {[
          { key: 'achievements', icon: 'emoji-events', label: 'Награды' },
          { key: 'challenges', icon: 'assignment', label: 'Вызовы' },
          { key: 'leaderboard', icon: 'leaderboard', label: 'Рейтинг' },
          { key: 'rewards', icon: 'redeem', label: 'Магазин' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <MaterialIcons 
              name={tab.icon as any} 
              size={18} 
              color={activeTab === tab.key ? 'white' : '#2E7D4A'} 
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'achievements' && renderAchievementsTab()}
        {activeTab === 'challenges' && renderChallengesTab()}
        {activeTab === 'leaderboard' && renderLeaderboardTab()}
        {activeTab === 'rewards' && renderRewardsTab()}
      </View>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, minWidth: 280, maxWidth: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{alertConfig.title}</Text>
              <Text style={{ fontSize: 16, marginBottom: 20, lineHeight: 22 }}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={{ backgroundColor: '#2E7D4A', padding: 10, borderRadius: 4, alignItems: 'center' }}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 15,
    gap: 4
  },
  activeTab: {
    backgroundColor: '#2E7D4A'
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  activeTabLabel: {
    color: 'white'
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: 20,
    gap: 20
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  levelCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20
  },
  levelGradient: {
    padding: 25
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  levelInfo: {
    flex: 1
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white'
  },
  levelTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4
  },
  levelIcon: {
    padding: 10
  },
  xpContainer: {
    gap: 8
  },
  xpText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4
  },
  achievementCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15
  },
  achievementGradient: {
    padding: 20
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15
  },
  achievementInfo: {
    flex: 1
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5
  },
  achievementDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5
  },
  achievementReward: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 'bold'
  },
  lockedText: {
    opacity: 0.5
  },
  progressContainer: {
    gap: 8
  },
  progressText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'right'
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3
  },
  claimButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center'
  },
  claimButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  challengeHeader: {
    marginBottom: 15
  },
  challengeInfo: {
    gap: 8
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white'
  },
  challengeType: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize'
  },
  objectivesContainer: {
    marginBottom: 15
  },
  objectivesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10
  },
  objectiveInfo: {
    flex: 1
  },
  objectiveText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999'
  },
  objectiveProgress: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 4
  },
  objectiveProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2
  },
  objectiveProgressText: {
    fontSize: 12,
    color: '#666'
  },
  rewardsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  rewardsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  rewardText: {
    fontSize: 12,
    color: '#666'
  },
  badgeText: {
    fontSize: 12,
    color: '#FF9800'
  },
  timeLimit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  timeLimitText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: 'bold'
  },
  leaderboardCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15,
    textAlign: 'center'
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 15
  },
  currentPlayer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    borderRadius: 8,
    borderBottomWidth: 0
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
    gap: 5
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666'
  },
  topRank: {
    color: '#2E7D4A'
  },
  playerInfo: {
    flex: 1
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  playerStats: {
    fontSize: 12,
    color: '#666'
  },
  currencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    gap: 15
  },
  currencyInfo: {
    flex: 1
  },
  currencyAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  currencyLabel: {
    fontSize: 14,
    color: '#666'
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    gap: 15
  },
  rewardInfo: {
    flex: 1
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  rewardCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800'
  },
  purchaseButton: {
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  purchaseButtonDisabled: {
    backgroundColor: '#E0E0E0'
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  purchaseButtonTextDisabled: {
    color: '#999'
  }
});