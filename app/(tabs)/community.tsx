import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, Image, Dimensions, Modal, TextInput, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CommunityService, SuccessStory, SupportPost, ExpertQA, ReactionType, CommunityGoal, GroupChallenge } from '../../services/communityService';
import Animated, { FadeInUp, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { Skeleton } from '../../components/Skeleton';

const { width: screenWidth } = Dimensions.get('window');

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
  onPollVote
}: {
  post: SupportPost,
  onCommentPress: (post: SupportPost) => void,
  onReactionPress: (postId: string, reaction: ReactionType) => void,
  onPollVote?: (postId: string, optionId: string) => void
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
      default: return 'favorite-border';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'motivation': return '#FFC107';
      case 'question': return '#2196F3';
      case 'milestone': return '#E91E63';
      case 'daily_thread': return '#673AB7';
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
          <View style={styles.authorNameRow}>
            <Text style={styles.authorName}>{post.author}</Text>
            {post.authorDays && post.authorDays >= 100 && (
              <View style={styles.mentorBadge}>
                <MaterialIcons name="stars" size={12} color="white" />
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
        <View style={styles.pollContainer}>
          <Text style={styles.pollQuestion}>{post.poll.question}</Text>
          {post.poll.options.map(option => {
            const totalVotes = post.poll?.options.reduce((acc, curr) => acc + curr.votes, 0) || 1;
            const percentage = Math.round((option.votes / totalVotes) * 100);
            const isSelected = post.poll?.userVote === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.pollOption, isSelected && styles.pollOptionSelected]}
                onPress={() => onPollVote?.(post.id, option.id)}
              >
                <View style={[styles.pollProgress, { width: `${percentage}%` }]} />
                <Text style={[styles.pollOptionText, isSelected && styles.pollOptionTextSelected]}>
                  {option.text}
                </Text>
                <Text style={styles.pollPercentage}>{percentage}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    <Animated.View entering={FadeInUp} style={styles.pulseContainer}>
      <View style={styles.pulseDotContainer}>
        <View style={styles.pulseDot} />
        <View style={[styles.pulseDot, styles.pulseDotPing]} />
      </View>
      <Text style={styles.pulseText}>{activeUsers} участников сейчас онлайн и поддерживают друг друга</Text>
    </Animated.View>
  );
};

export default function CommunityPage() {
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [posts, setPosts] = useState<SupportPost[]>([]);
  const [expertQA, setExpertQA] = useState<ExpertQA[]>([]);
  const [communityGoals, setCommunityGoals] = useState<CommunityGoal[]>([]);
  const [groupChallenges, setGroupChallenges] = useState<(GroupChallenge & { isParticipating?: boolean })[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState('all');
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStoryModalVisible, setIsStoryModalVisible] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState<SupportPost | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'motivation' | 'question' | 'support' | 'milestone'>('support');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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
      setLiveRooms(CommunityService.getLiveRooms());
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleReactionPress = async (postId: string, reaction: ReactionType) => {
    await CommunityService.addReaction(postId, reaction);
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
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите текст поста');
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
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsModalVisible(false);
    Alert.alert('Успех', 'Ваш пост опубликован!');
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !selectedPostForComment) return;

    await CommunityService.addComment(selectedPostForComment.id);
    setPosts(posts.map(p =>
      p.id === selectedPostForComment.id
        ? { ...p, comments: p.comments + 1 }
        : p
    ));

    setNewCommentText('');
    setIsCommentModalVisible(false);
    Alert.alert('Комментарий добавлен', 'Ваше мнение важно для сообщества!');
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

  const handlePollVote = (postId: string, optionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts(currentPosts => currentPosts.map(p => {
      if (p.id === postId && p.poll) {
        if (p.poll.userVote) return p; // Already voted

        return {
          ...p,
          poll: {
            ...p.poll,
            userVote: optionId,
            options: p.poll.options.map(opt =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            )
          }
        };
      }
      return p;
    }));
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

  const filteredPosts = posts.filter(post =>
    selectedCircle === 'all' || post.category === selectedCircle
  );

  const renderHeader = () => {
    const mentorshipAdvice = CommunityService.getMentorshipAdvice(selectedCircle);
    const currentCircle = circles.find(c => c.id === selectedCircle);

    return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Живые комнаты</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalsContainer}
      >
        {isLoading ? (
          [1, 2].map(i => <Skeleton key={i} width={200} height={100} borderRadius={16} />)
        ) : (
          liveRooms.map(room => (
            <TouchableOpacity key={room.id} style={[styles.liveRoomCard, { borderLeftColor: room.color }]}>
              <Text style={styles.liveRoomTitle}>{room.title}</Text>
              <Text style={styles.liveRoomTopic}>{room.topic}</Text>
              <View style={styles.liveRoomFooter}>
                <MaterialIcons name="people" size={14} color="#666" />
                <Text style={styles.liveRoomParticipants}>{room.participants} в сети</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

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
        <Text style={styles.title}>Сообщество</Text>
        <Text style={styles.subtitle}>Вместе мы сильнее</Text>
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
        <FlatList
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
            onPollVote={handlePollVote}
            />
          )}
          ListHeaderComponent={renderHeader}
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
    gap: 6
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  mentorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F57F17',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2
  },
  mentorBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold'
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
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F44336',
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F44336',
  },
  liveRoomCard: {
    backgroundColor: 'white',
    width: 180,
    padding: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  liveRoomTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  liveRoomTopic: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  liveRoomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveRoomParticipants: {
    fontSize: 11,
    color: '#888',
  },
  pollContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  pollQuestion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pollOption: {
    height: 36,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pollOptionSelected: {
    borderColor: '#2E7D4A',
    borderWidth: 1.5,
  },
  pollProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E8F5E8',
  },
  pollOptionText: {
    fontSize: 13,
    color: '#444',
    zIndex: 1,
  },
  pollOptionTextSelected: {
    fontWeight: 'bold',
    color: '#2E7D4A',
  },
  pollPercentage: {
    position: 'absolute',
    right: 12,
    fontSize: 11,
    color: '#666',
    fontWeight: 'bold',
    zIndex: 1,
  }
});
