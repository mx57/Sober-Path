import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Dimensions, Modal, TextInput, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashList } from '@shopify/flash-list';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CommunityService, SuccessStory, SupportPost, ExpertQA, ReactionType, CommunityGoal, GroupChallenge, PulseActivity } from '../../services/communityService';
import Animated, { FadeInUp, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { Skeleton } from '../../components/Skeleton';

const { width: screenWidth } = Dimensions.get('window');

const KarmaBadge = ({ userName }: { userName: string }) => {
  const [karma, setKarma] = useState(0);

  useEffect(() => {
    CommunityService.getUserKarma(userName).then(setKarma);
  }, [userName]);

  if (userName === 'Вы' || userName === 'Sober Path Bot') return null;

  const level = CommunityService.getKarmaLevel(karma);

  return (
    <View style={[styles.karmaBadge, { backgroundColor: level.color + '20' }]}>
      <MaterialIcons name={level.icon as any} size={12} color={level.color} />
      <Text style={[styles.karmaText, { color: level.color }]}>{karma}</Text>
    </View>
  );
};

const PostPoll = ({ poll, onVote }: { poll: any, onVote: (optionId: string) => void }) => {
  const totalVotes = poll.options.reduce((acc: number, curr: any) => acc + curr.votes, 0);

  return (
    <View style={styles.pollContainer}>
      <Text style={styles.pollQuestion}>{poll.question}</Text>
      {poll.options.map((option: any) => {
        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
        const isSelected = poll.userVote === option.id;

        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.pollOption, isSelected && styles.pollOptionSelected]}
            onPress={() => !poll.userVote && onVote(option.id)}
            disabled={!!poll.userVote}
          >
            {poll.userVote && (
              <View style={[styles.pollProgress, { width: `${percentage}%` }]} />
            )}
            <View style={styles.pollOptionContent}>
              <Text style={[styles.pollOptionText, isSelected && styles.pollOptionTextSelected]}>
                {option.text}
              </Text>
              {poll.userVote && (
                <Text style={styles.pollPercentage}>{percentage}%</Text>
              )}
            </View>
            {isSelected && (
              <MaterialIcons name="check-circle" size={16} color="#2E7D4A" style={styles.pollCheck} />
            )}
          </TouchableOpacity>
        );
      })}
      <Text style={styles.pollTotalVotes}>{totalVotes} голосов</Text>
    </View>
  );
};

const SuccessStoryCard = ({ story }: { story: SuccessStory }) => (
  <View style={styles.storyCard}>
    <View style={styles.storyHeader}>
      <Image source={{ uri: story.avatar }} style={styles.avatar} />
      <View>
        <Text style={styles.userName}>{story.userName}</Text>
        <Text style={styles.daysBadge}>{story.daysSober} дней трезвости</Text>
      </View>
    </View>
    <Text style={styles.storyText} numberOfLines={3}>{story.story}</Text>
  </View>
);

const CommunityGoalCard = ({ goal }: { goal: CommunityGoal }) => {
  const progress = goal.currentValue / goal.targetValue;
  return (
    <Animated.View entering={FadeInRight} style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalIconContainer, { backgroundColor: goal.color + '20' }]}>
          <MaterialIcons name={goal.icon as any} size={24} color={goal.color} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalValue}>{goal.currentValue} / {goal.targetValue} {goal.unit}</Text>
        </View>
      </View>
      <View style={styles.goalProgressBar}>
        <View style={[styles.goalProgressFill, { width: `${progress * 100}%`, backgroundColor: goal.color }]} />
      </View>
    </Animated.View>
  );
};

const ExpertQACard = ({ qa }: { qa: ExpertQA }) => (
  <View style={styles.expertCard}>
    <View style={styles.expertHeader}>
      <MaterialIcons name="help-center" size={24} color="#2E7D4A" />
      <Text style={styles.expertQuestion} numberOfLines={2}>{qa.question}</Text>
    </View>
    <View style={styles.expertAnswerContainer}>
      <Text style={styles.expertAnswerText} numberOfLines={3}>{qa.answer}</Text>
    </View>
    <View style={styles.expertFooter}>
      <Text style={styles.expertName}>{qa.expertName}</Text>
      <Text style={styles.expertTitle}>{qa.expertTitle}</Text>
    </View>
  </View>
);

const SupportPostItem = ({
  post,
  onCommentPress,
  onReactionPress,
  onVotePress
}: {
  post: SupportPost,
  onCommentPress: (post: SupportPost) => void,
  onReactionPress: (postId: string, reaction: ReactionType) => void,
  onVotePress: (postId: string, optionId: string) => void
}) => {
  const isMentor = (post.authorDaysSober || 0) >= 365;
  const isRisingStar = (post.authorDaysSober || 0) >= 30 && (post.authorDaysSober || 0) < 365;
  const [showReactions, setShowReactions] = useState(false);
  const heartScale = useSharedValue(1);
  const heartAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motivation': return 'auto-awesome';
      case 'question': return 'help-outline';
      case 'milestone': return 'emoji-events';
      case 'daily_thread': return 'today';
      case 'poll': return 'poll';
      default: return 'favorite-border';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'motivation': return '#FFC107';
      case 'question': return '#2196F3';
      case 'milestone': return '#E91E63';
      case 'daily_thread': return '#673AB7';
      case 'poll': return '#FF5722';
      default: return '#2E7D4A';
    }
  };

  const handleReaction = (type: ReactionType) => {
    onReactionPress(post.id, type);
    setShowReactions(false);
    heartScale.value = withSequence(
      withSpring(1.5),
      withTiming(1, { duration: 200 })
    );
  };

  const reactions = post.reactions || { support: 0, agree: 0, hug: 0, like: 0 };

  return (
    <Animated.View entering={FadeInUp.delay(100)} style={[
      styles.postCard,
      post.category === 'daily_thread' && styles.dailyThreadCard
    ]}>
      <View style={styles.postHeader}>
        <View style={[styles.categoryIconContainer, { backgroundColor: getCategoryColor(post.category) + '20' }]}>
          <MaterialIcons name={getCategoryIcon(post.category)} size={20} color={getCategoryColor(post.category)} />
        </View>
        <View style={styles.authorInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.authorName}>{post.author}</Text>
            {post.authorSoberDays && post.authorSoberDays >= 100 && (
                <View style={styles.mentorBadge}>
                    <MaterialIcons name="verified" size={12} color="white" />
                    <Text style={styles.mentorBadgeText}>Наставник</Text>
                </View>
            )}
          </View>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) }]}>
            <Text style={styles.categoryBadgeText}>{post.category === 'daily_thread' ? 'Дневной поток' : post.category}</Text>
        </View>
      </View>

      <Text style={[
        styles.postContent,
        post.category === 'daily_thread' && styles.dailyThreadText
      ]}>{post.content}</Text>

      {post.poll && (
        <PostPoll poll={post.poll} onVote={(optionId) => onVotePress(post.id, optionId)} />
      )}

      {Object.values(reactions).some(v => v > 0) && (
        <View style={styles.reactionsSummary}>
          {reactions.support > 0 && <View style={styles.summaryBadge}><Text style={styles.summaryEmoji}>🛡️</Text><Text style={styles.summaryCount}>{reactions.support}</Text></View>}
          {reactions.agree > 0 && <View style={styles.summaryBadge}><Text style={styles.summaryEmoji}>🤝</Text><Text style={styles.summaryCount}>{reactions.agree}</Text></View>}
          {reactions.hug > 0 && <View style={styles.summaryBadge}><Text style={styles.summaryEmoji}>🫂</Text><Text style={styles.summaryCount}>{reactions.hug}</Text></View>}
          {reactions.like > 0 && <View style={styles.summaryBadge}><Text style={styles.summaryEmoji}>❤️</Text><Text style={styles.summaryCount}>{reactions.like}</Text></View>}
        </View>
      )}

      <View style={styles.postFooter}>
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowReactions(!showReactions)}
          >
            <Animated.View style={[styles.iconContainer, heartAnimStyle]}>
              <MaterialIcons
                name="add-reaction"
                size={20}
                color="#666"
              />
            </Animated.View>
            <Text style={styles.actionText}>Реакция</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => onCommentPress(post)}>
            <MaterialIcons name="chat-bubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {showReactions && (
        <Animated.View entering={FadeInUp} style={styles.reactionsPicker}>
          <TouchableOpacity style={styles.reactionOption} onPress={() => handleReaction('support')}>
            <Text style={styles.reactionEmoji}>🛡️</Text>
            <Text style={styles.reactionLabel}>Поддержка</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionOption} onPress={() => handleReaction('agree')}>
            <Text style={styles.reactionEmoji}>🤝</Text>
            <Text style={styles.reactionLabel}>Согласен</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionOption} onPress={() => handleReaction('hug')}>
            <Text style={styles.reactionEmoji}>🫂</Text>
            <Text style={styles.reactionLabel}>Обнимаю</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionOption} onPress={() => handleReaction('like')}>
            <Text style={styles.reactionEmoji}>❤️</Text>
            <Text style={styles.reactionLabel}>Люблю</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const CommunityPulse = () => {
  const [activeUsers, setActiveUsers] = useState(124);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const next = prev + Math.floor(Math.random() * 5) - 2;
        return next > 100 ? next : 100;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View entering={FadeInUp} style={styles.onlinePulseContainer}>
      <View style={styles.onlinePulseDotContainer}>
        <View style={styles.onlinePulseDot} />
        <View style={[styles.onlinePulseDot, styles.onlinePulseDotPing]} />
      </View>
      <Text style={styles.onlinePulseText}>{activeUsers} участников сейчас онлайн и поддерживают друг друга</Text>
    </Animated.View>
  );
};

const BUDDY_CANDIDATES = [
  { name: 'Александр', soberDays: 45, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', lastStatus: 'Сегодня пробежал 5 км, полет нормальный!', statusIcon: 'directions-run' },
  { name: 'Екатерина', soberDays: 21, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', lastStatus: 'Читаю книгу по психологии и пью мятный чай ☕', statusIcon: 'menu-book' },
  { name: 'Максим', soberDays: 90, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80', lastStatus: 'Помог другу остаться трезвым на дне рождения!', statusIcon: 'sentiment-very-satisfied' },
  { name: 'Анна', soberDays: 8, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', lastStatus: 'Тяжело, но держусь благодаря поддержке сообщества!', statusIcon: 'favorite' }
];

export default function CommunityPage() {
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [posts, setPosts] = useState<SupportPost[]>([]);
  const [pulse, setPulse] = useState<PulseActivity[]>([]);
  const [expertQA, setExpertQA] = useState<ExpertQA[]>([]);
  const [communityGoals, setCommunityGoals] = useState<CommunityGoal[]>([]);
  const [groupChallenges, setGroupChallenges] = useState<(GroupChallenge & { isParticipating?: boolean })[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStoryModalVisible, setIsStoryModalVisible] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState<SupportPost | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'motivation' | 'question' | 'support' | 'milestone'>('support');
  const [isLoading, setIsLoading] = useState(true);
  const [userKarma, setUserKarma] = useState(0);

  // States for Sober Buddy feature
  const [buddy, setBuddy] = useState<any | null>(null);
  const [isSearchingBuddy, setIsSearchingBuddy] = useState(false);
  const [sentSupportToday, setSentSupportToday] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Load Karma
      const karma = await CommunityService.getUserKarma();
      setUserKarma(karma);

      // Load Buddy
      try {
        const storedBuddy = await AsyncStorage.getItem('sober_path_sober_buddy');
        if (storedBuddy) {
          setBuddy(JSON.parse(storedBuddy));
        }
        const storedSupport = await AsyncStorage.getItem('sober_path_support_today');
        if (storedSupport) {
          const dateStr = new Date().toDateString();
          if (storedSupport === dateStr) {
            setSentSupportToday(true);
          }
        }
      } catch (e) {
        console.error('Failed to load buddy state', e);
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStories(CommunityService.getSuccessStories());
      setExpertQA(CommunityService.getExpertQA());
      setCommunityGoals(CommunityService.getCommunityGoals());
      const loadedChallenges = await CommunityService.getGroupChallenges();
      setGroupChallenges(loadedChallenges);

      const loadedPosts = await CommunityService.getSupportPosts();
      const dailyThread = CommunityService.getDailyThread();

      // Ensure daily thread is at the top if it doesn't exist in loaded posts
      if (!loadedPosts.find(p => p.id === dailyThread.id)) {
        setPosts([dailyThread, ...loadedPosts]);
      } else {
        setPosts(loadedPosts);
      }

      setCircles(CommunityService.getCircles());
      setPulse(CommunityService.getCommunityPulse());
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleReactionPress = async (postId: string, reaction: ReactionType) => {
    await CommunityService.addReaction(postId, reaction);
    const updatedKarma = await CommunityService.addKarmaPoints(5);
    setUserKarma(updatedKarma);

    setPosts(currentPosts => currentPosts.map(p => {
      if (p.id === postId) {
        const reactions = p.reactions || { support: 0, agree: 0, hug: 0, like: 0 };
        return {
          ...p,
          reactions: { ...reactions, [reaction]: (reactions[reaction] || 0) + 1 }
        };
      }
      return p;
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleVotePress = async (postId: string, optionId: string) => {
    await CommunityService.voteInPoll(postId, optionId);
    const updatedKarma = await CommunityService.addKarmaPoints(10);
    setUserKarma(updatedKarma);

    setPosts(currentPosts => currentPosts.map(p => {
      if (p.id === postId && p.poll) {
        const updatedOptions = p.poll.options.map(o =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        );
        return { ...p, poll: { ...p.poll, options: updatedOptions, userVote: optionId } };
      }
      return p;
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите текст поста');
      return;
    }

    // ИИ-модерация на токсичность
    const modResult = CommunityService.moderatePostContent(newPostContent);
    if (!modResult.isApproved) {
      Alert.alert('ИИ-Модерация', modResult.reason);
      return;
    }

    const newPost: SupportPost = {
      id: `p${Date.now()}`,
      author: 'Вы',
      content: newPostContent,
      likes: 0,
      comments: 0,
      timeAgo: 'Только что',
      category: selectedCategory
    };

    await CommunityService.saveUserPost(newPost);
    const updatedKarma = await CommunityService.addKarmaPoints(15);
    setUserKarma(updatedKarma);

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsModalVisible(false);
    Alert.alert('Успех', 'Ваш пост успешно прошёл ИИ-модерацию и был опубликован!\n\nВы получили +15 очков Кармы 🌟 за вклад в сообщество.');
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !selectedPostForComment) return;

    await CommunityService.addComment(selectedPostForComment.id);
    const updatedKarma = await CommunityService.addKarmaPoints(10);
    setUserKarma(updatedKarma);

    setPosts(posts.map(p =>
      p.id === selectedPostForComment.id
        ? { ...p, comments: p.comments + 1 }
        : p
    ));

    setNewCommentText('');
    setIsCommentModalVisible(false);
    Alert.alert('Комментарий опубликован', 'Ваше сообщение добавлено!\n\nВы получили +10 очков Кармы 🌟.');
  };

  const handleCreateStory = () => {
    if (!newStoryContent.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите вашу историю');
      return;
    }

    const newStory: SuccessStory = {
      id: `s${Date.now()}`,
      userName: 'Вы',
      daysSober: 0, // Should ideally come from context
      story: newStoryContent,
      date: new Date().toISOString()
    };

    setStories([newStory, ...stories]);
    setNewStoryContent('');
    setIsStoryModalVisible(false);
    Alert.alert('Успех', 'Ваша история опубликована!');
  };

  const handleToggleChallenge = async (challengeId: string) => {
    const joined = await CommunityService.toggleChallengeParticipation(challengeId);
    const updatedChallenges = await CommunityService.getGroupChallenges();
    setGroupChallenges(updatedChallenges);

    Haptics.notificationAsync(
      joined ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    );

    Alert.alert(
      joined ? 'Вы присоединились!' : 'Вы покинули челендж',
      joined ? 'Вместе идти к цели легче. Удачи!' : 'Вы всегда можете вернуться позже.'
    );
  };

  const handleFindBuddy = async () => {
    setIsSearchingBuddy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(async () => {
      const randomIndex = Math.floor(Math.random() * BUDDY_CANDIDATES.length);
      const selectedBuddy = BUDDY_CANDIDATES[randomIndex];

      try {
        await AsyncStorage.setItem('sober_path_sober_buddy', JSON.stringify(selectedBuddy));
        setBuddy(selectedBuddy);
        setIsSearchingBuddy(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Ура!', `Мы подобрали вам напарника. Знакомьтесь, это ${selectedBuddy.name}!`);
      } catch (e) {
        console.error(e);
        setIsSearchingBuddy(false);
      }
    }, 1500);
  };

  const handleSendBuddySupport = async () => {
    if (!buddy) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const dateStr = new Date().toDateString();

    try {
      await AsyncStorage.setItem('sober_path_support_today', dateStr);
      setSentSupportToday(true);
      const updatedKarma = await CommunityService.addKarmaPoints(15);
      setUserKarma(updatedKarma);
      Alert.alert(
        'Импульс отправлен!',
        `Вы отправили поддержку напарнику ${buddy.name}. Ваша карма выросла: +15 очков (всего: ${updatedKarma})!`
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnpairBuddy = () => {
    Alert.alert(
      'Расторгнуть связь?',
      'Вы уверены, что хотите прекратить связь с этим напарником? Вы сможете найти нового в любое время.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Да, расторгнуть',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('sober_path_sober_buddy');
              await AsyncStorage.removeItem('sober_path_support_today');
              setBuddy(null);
              setSentSupportToday(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (e) {
              console.error(e);
            }
          }
        }
      ]
    );
  };

  const filteredPosts = posts.filter(post =>
    selectedCircle === 'all' || post.category === selectedCircle
  );

  const renderHeader = () => {
    const mentorshipAdvice = CommunityService.getMentorshipAdvice(selectedCircle);
    const currentCircle = circles.find(c => c.id === selectedCircle);

    return (
    <View>
      {!isLoading && pulse.length > 0 && (
        <View style={styles.pulseContainer}>
            <View style={styles.pulseHeader}>
                <View style={styles.pulseDot} />
                <Text style={styles.pulseTitle}>ПУЛЬС СООБЩЕСТВА</Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pulseScroll}
            >
                {pulse.map((act) => (
                    <View key={act.id} style={styles.pulseItem}>
                        <Text style={styles.pulseUser}>{act.userName}</Text>
                        <Text style={styles.pulseText}>{act.text}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Групповые челленджи</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalsContainer}
      >
        {isLoading ? (
          [1, 2].map(i => <Skeleton key={i} width={250} height={120} borderRadius={16} />)
        ) : (
          groupChallenges.map(challenge => (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.challengeCard,
                challenge.isParticipating && styles.activeChallengeCard
              ]}
              onPress={() => handleToggleChallenge(challenge.id)}
            >
              <View style={styles.challengeHeader}>
                <View style={[
                  styles.challengeBadge,
                  challenge.isParticipating && styles.activeChallengeBadge
                ]}>
                  <Text style={[
                    styles.challengeBadgeText,
                    challenge.isParticipating && styles.activeChallengeBadgeText
                  ]}>{challenge.category}</Text>
                </View>
                {challenge.isParticipating && (
                  <View style={styles.participatingBadge}>
                    <MaterialIcons name="check" size={12} color="white" />
                    <Text style={styles.participatingText}>Участвую</Text>
                  </View>
                )}
                <Text style={styles.challengeDays}>осталось {challenge.daysRemaining} дн.</Text>
              </View>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDesc} numberOfLines={2}>{challenge.description}</Text>
              <View style={styles.challengeFooter}>
                <MaterialIcons name="people" size={16} color={challenge.isParticipating ? '#2E7D4A' : '#666'} />
                <Text style={[
                  styles.challengeParticipants,
                  challenge.isParticipating && { color: '#2E7D4A', fontWeight: 'bold' }
                ]}>{challenge.participants} участников</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Цели сообщества</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalsContainer}
      >
        {isLoading ? (
          [1, 2].map(i => <Skeleton key={i} width={250} height={100} borderRadius={16} />)
        ) : (
          communityGoals.map(goal => (
            <CommunityGoalCard key={goal.id} goal={goal} />
          ))
        )}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Круги поддержки</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.circlesContainer}
      >
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} width={100} height={40} borderRadius={20} />)
        ) : (
          circles.map(circle => (
            <TouchableOpacity
              key={circle.id}
              style={[
                styles.circleButton,
                selectedCircle === circle.id && { backgroundColor: circle.color }
              ]}
              onPress={() => {
                setSelectedCircle(circle.id);
                Haptics.selectionAsync();
              }}
            >
              <MaterialIcons
                name={circle.icon}
                size={20}
                color={selectedCircle === circle.id ? 'white' : circle.color}
              />
              <Text style={[
                styles.circleText,
                selectedCircle === circle.id && { color: 'white' }
              ]}>
                {circle.name}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {currentCircle && selectedCircle !== 'all' && (
        <Animated.View entering={FadeInUp} style={styles.circleInfoCard}>
          <Text style={styles.circleInfoTitle}>{currentCircle.name}</Text>
          <Text style={styles.circleInfoDesc}>{currentCircle.description}</Text>
        </Animated.View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ответы экспертов</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContainer}
      >
        {isLoading ? (
          [1, 2].map(i => <Skeleton key={i} width={screenWidth * 0.8} height={180} borderRadius={16} />)
        ) : (
          expertQA.map(qa => (
            <ExpertQACard key={qa.id} qa={qa} />
          ))
        )}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Истории успеха</Text>
        {!isLoading && (
          <TouchableOpacity onPress={() => setIsStoryModalVisible(true)}>
            <Text style={styles.seeAllText}>Поделиться</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContainer}
      >
        {isLoading ? (
          [1, 2].map(i => <Skeleton key={i} width={screenWidth * 0.7} height={120} borderRadius={16} />)
        ) : (
          stories.map(story => (
            <SuccessStoryCard key={story.id} story={story} />
          ))
        )}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Советы наставников</Text>
      </View>

      <View style={styles.mentorshipContainer}>
        {isLoading ? (
          <Skeleton width="100%" height={80} borderRadius={16} />
        ) : (
          mentorshipAdvice.slice(0, 2).map((advice, idx) => (
            <Animated.View entering={FadeInUp.delay(idx * 100)} key={idx} style={styles.mentorshipCard}>
              <View style={styles.mentorshipHeader}>
                <View>
                  <Text style={styles.mentorshipAuthor}>{advice.author}</Text>
                  <Text style={styles.mentorshipRole}>{advice.role}</Text>
                </View>
                <MaterialIcons name="verified" size={20} color="#F57F17" />
              </View>
              <Text style={styles.mentorshipText}>«{advice.text}»</Text>
            </Animated.View>
          ))
        )}
      </View>

      {/* Секция: Трезвый напарник */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Трезвый напарник 🤝</Text>
      </View>
      <View style={styles.buddySectionContainer}>
        {isSearchingBuddy ? (
          <View style={styles.buddyLoadingContainer}>
            <Skeleton width="100%" height={100} borderRadius={16} />
            <Text style={styles.buddyLoadingText}>Анализируем прогресс сообщества и подбираем напарника...</Text>
          </View>
        ) : buddy ? (
          <Animated.View entering={FadeInRight} style={styles.buddyCard}>
            <View style={styles.buddyHeader}>
              <Image source={{ uri: buddy.avatar }} style={styles.buddyAvatar} />
              <View style={styles.buddyInfo}>
                <View style={styles.buddyNameRow}>
                  <Text style={styles.buddyName}>{buddy.name}</Text>
                  <View style={styles.buddyDaysBadge}>
                    <Text style={styles.buddyDaysText}>{buddy.soberDays} дней трезвости</Text>
                  </View>
                </View>
                <View style={styles.buddyStatusRow}>
                  <MaterialIcons name={buddy.statusIcon as any} size={14} color="#2E7D4A" style={{ marginRight: 4 }} />
                  <Text style={styles.buddyStatus} numberOfLines={2}>«{buddy.lastStatus}»</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleUnpairBuddy} style={styles.unpairButton}>
                <MaterialIcons name="link-off" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.supportButton, sentSupportToday && styles.supportButtonSent]}
              onPress={handleSendBuddySupport}
              disabled={sentSupportToday}
            >
              <MaterialIcons name={sentSupportToday ? "check" : "favorite"} size={18} color="white" style={{ marginRight: 6 }} />
              <Text style={styles.supportButtonText}>
                {sentSupportToday ? "Импульс поддержки отправлен" : "Отправить импульс поддержки (+15 Кармы)"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp} style={styles.buddyEmptyCard}>
            <Text style={styles.buddyEmptyText}>
              Проходить путь трезвости с напарником легче и эффективнее! Делитесь опытом, поддерживайте друг друга в сложные моменты и увеличивайте Карму.
            </Text>
            <TouchableOpacity onPress={handleFindBuddy} style={styles.findBuddyButton}>
              <MaterialIcons name="person-add" size={18} color="white" style={{ marginRight: 6 }} />
              <Text style={styles.findBuddyButtonText}>Найти трезвого напарника</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Лента поддержки</Text>
      </View>

      <CommunityPulse />
    </View>
  );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Сообщество</Text>
            <Text style={styles.subtitle}>Вместе мы сильнее</Text>
          </View>
          <View style={styles.karmaBadgeContainer}>
            <MaterialIcons name="stars" size={16} color="#FFD700" />
            <Text style={styles.karmaBadgeText}>Карма: {userKarma} 🌟</Text>
          </View>
        </View>
      </LinearGradient>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.content}>
          {renderHeader()}
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.postCard, { gap: 10 }]}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Skeleton width={32} height={32} borderRadius={16} />
                <View style={{ flex: 1, gap: 5 }}>
                  <Skeleton width="40%" height={15} />
                  <Skeleton width="20%" height={10} />
                </View>
              </View>
              <Skeleton width="100%" height={60} />
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <Skeleton width={50} height={20} />
                <Skeleton width={50} height={20} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlashList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SupportPostItem
              post={item}
              onCommentPress={(post) => {
                setSelectedPostForComment(post);
                setIsCommentModalVisible(true);
              }}
              onReactionPress={handleReactionPress}
              onVotePress={handleVotePress}
            />
          )}
          ListHeaderComponent={renderHeader}
          estimatedItemSize={250}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <MaterialIcons name="edit" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новый пост</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.categoryPicker}>
              {circles.filter(c => c.id !== 'all').map(circle => (
                <TouchableOpacity
                  key={circle.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === circle.id && { backgroundColor: circle.color }
                  ]}
                  onPress={() => setSelectedCategory(circle.id)}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    selectedCategory === circle.id && { color: 'white' }
                  ]}>
                    {circle.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="Поделитесь своими мыслями или вопросом..."
              multiline
              numberOfLines={6}
              value={newPostContent}
              onChangeText={setNewPostContent}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreatePost}
            >
              <Text style={styles.submitButtonText}>Опубликовать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isStoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsStoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ваша история успеха</Text>
              <TouchableOpacity onPress={() => setIsStoryModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHelperText}>Поделитесь своим путем. Ваша история может вдохновить других!</Text>

            <TextInput
              style={styles.postInput}
              placeholder="Как изменилась ваша жизнь? Какие советы вы дадите новичкам?"
              multiline
              numberOfLines={8}
              value={newStoryContent}
              onChangeText={setNewStoryContent}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateStory}
            >
              <Text style={styles.submitButtonText}>Опубликовать историю</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCommentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Комментарий</Text>
              <TouchableOpacity onPress={() => setIsCommentModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedPostForComment && (
              <View style={styles.targetPostPreview}>
                <Text style={styles.targetPostAuthor}>{selectedPostForComment.author}:</Text>
                <Text style={styles.targetPostText} numberOfLines={2}>{selectedPostForComment.content}</Text>
              </View>
            )}

            <TextInput
              style={styles.postInput}
              placeholder="Напишите слова поддержки..."
              multiline
              numberOfLines={4}
              value={newCommentText}
              onChangeText={setNewCommentText}
              textAlignVertical="top"
              autoFocus
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddComment}
            >
              <Text style={styles.submitButtonText}>Ответить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  karmaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  karmaText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  circlesContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 10
  },
  goalsContainer: {
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 10
  },
  goalCard: {
    backgroundColor: 'white',
    width: 250,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  goalValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  circleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  circleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  circleInfoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D4A',
    elevation: 2,
  },
  circleInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  circleInfoDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  header: {
    padding: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  karmaBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  karmaBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    paddingBottom: 100
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  seeAllText: {
    color: '#2E7D4A',
    fontWeight: '600'
  },
  storiesContainer: {
    paddingHorizontal: 15,
    gap: 15
  },
  challengeCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeBadgeText: {
    color: '#2E7D4A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  challengeDays: {
    fontSize: 11,
    color: '#F44336',
    fontWeight: '500',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  challengeDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  challengeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  challengeParticipants: {
    fontSize: 11,
    color: '#666',
  },
  activeChallengeCard: {
    borderColor: '#2E7D4A',
    borderWidth: 2,
    backgroundColor: '#F1F8F1',
  },
  activeChallengeBadge: {
    backgroundColor: '#2E7D4A',
  },
  activeChallengeBadgeText: {
    color: 'white',
  },
  participatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  participatingText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  storyCard: {
    backgroundColor: 'white',
    width: screenWidth * 0.7,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F0F0F0'
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  daysBadge: {
    fontSize: 12,
    color: '#2E7D4A',
    fontWeight: '600'
  },
  storyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  expertCard: {
    backgroundColor: 'white',
    width: screenWidth * 0.8,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D4A'
  },
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8
  },
  expertQuestion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  expertAnswerContainer: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10
  },
  expertAnswerText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    fontStyle: 'italic'
  },
  expertFooter: {
    marginTop: 'auto'
  },
  expertName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D4A'
  },
  expertTitle: {
    fontSize: 11,
    color: '#888'
  },
  mentorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F57F17',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  mentorBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  pulseContainer: {
    backgroundColor: '#E8F5E8',
    paddingVertical: 12,
    marginBottom: 10,
  },
  pulseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D4A',
  },
  pulseTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2E7D4A',
    letterSpacing: 1,
  },
  pulseScroll: {
    paddingHorizontal: 20,
    gap: 15,
  },
  pulseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    elevation: 1,
  },
  pulseUser: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  pulseText: {
    fontSize: 12,
    color: '#666',
  },
  mentorshipContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mentorshipCard: {
    backgroundColor: '#FFFDE7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFF59D',
    marginBottom: 12,
  },
  mentorshipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mentorshipAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  mentorshipRole: {
    fontSize: 11,
    color: '#BCAA00',
    marginBottom: 8,
  },
  mentorshipText: {
    fontSize: 13,
    color: '#5D4037',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  dailyThreadCard: {
    backgroundColor: '#F3E5F5',
    borderColor: '#673AB7',
    borderWidth: 1,
  },
  dailyThreadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A148C',
  },
  reactionsSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  summaryEmoji: {
    fontSize: 12,
  },
  summaryCount: {
    fontSize: 11,
    color: '#666',
    fontWeight: 'bold',
  },
  reactionsPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reactionOption: {
    alignItems: 'center',
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionLabel: {
    fontSize: 9,
    color: '#888',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  postCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5F6ED',
    alignItems: 'center',
    justifyContent: 'center'
  },
  authorInfo: {
    flex: 1
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  authorMentorBadge: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  starBadge: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  badgeEmoji: {
    fontSize: 10,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333',
  },
  timeAgo: {
    fontSize: 11,
    color: '#999'
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  postContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 15
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    gap: 20
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionText: {
    fontSize: 14,
    color: '#666'
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E7D4A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 400
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600'
  },
  postInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 150,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  submitButton: {
    backgroundColor: '#2E7D4A',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  targetPostPreview: {
    backgroundColor: '#F0F7F0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#2E7D4A'
  },
  targetPostAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 4
  },
  targetPostText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic'
  },
  modalHelperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20
  },
  onlinePulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  onlinePulseDotContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  onlinePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  onlinePulseDotPing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    opacity: 0.4,
  },
  onlinePulseText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  pollContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pollQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pollOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pollOptionSelected: {
    borderColor: '#2E7D4A',
    backgroundColor: '#E8F5E8',
  },
  pollProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(46, 125, 74, 0.1)',
  },
  pollOptionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  pollOptionText: {
    fontSize: 13,
    color: '#444',
  },
  pollOptionTextSelected: {
    color: '#2E7D4A',
    fontWeight: 'bold',
  },
  pollPercentage: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  pollCheck: {
    marginLeft: 8,
    zIndex: 1,
  },
  pollTotalVotes: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  buddySectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buddyLoadingContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buddyLoadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  buddyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5F6ED',
  },
  buddyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  buddyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#E5F6ED',
  },
  buddyInfo: {
    flex: 1,
  },
  buddyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buddyDaysBadge: {
    backgroundColor: '#E5F6ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  buddyDaysText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D4A',
  },
  buddyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buddyStatus: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    flex: 1,
  },
  unpairButton: {
    padding: 6,
  },
  supportButton: {
    backgroundColor: '#2E7D4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  supportButtonSent: {
    backgroundColor: '#A5D6A7',
  },
  supportButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  buddyEmptyCard: {
    backgroundColor: '#F1F8F4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  buddyEmptyText: {
    fontSize: 13,
    color: '#2E7D4A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 15,
  },
  findBuddyButton: {
    backgroundColor: '#2E7D4A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  findBuddyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  }
});
