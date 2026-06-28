import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, Image, Dimensions, Modal, TextInput, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CommunityService, SuccessStory, SupportPost } from '../../services/communityService';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
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

const SupportPostItem = ({ post, onCommentPress }: { post: SupportPost, onCommentPress: (post: SupportPost) => void }) => {
  const [liked, setLiked] = React.useState(false);
  const heartScale = useSharedValue(1);
  const heartAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motivation': return 'auto-awesome';
      case 'question': return 'help-outline';
      case 'milestone': return 'emoji-events';
      default: return 'favorite-border';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'motivation': return '#FFC107';
      case 'question': return '#2196F3';
      case 'milestone': return '#E91E63';
      default: return '#2E7D4A';
    }
  };

  const handleLike = () => {
    if (!liked) {
      heartScale.value = withSequence(
        withSpring(1.5),
        withTiming(1, { duration: 200 })
      );
      setLiked(true);
    } else {
      setLiked(false);
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={[styles.categoryIconContainer, { backgroundColor: getCategoryColor(post.category) + '20' }]}>
          <MaterialIcons name={getCategoryIcon(post.category)} size={20} color={getCategoryColor(post.category)} />
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author}</Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) }]}>
            <Text style={styles.categoryBadgeText}>{post.category}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={[styles.iconContainer, heartAnimStyle]}>
            <MaterialIcons
              name={liked ? "favorite" : "favorite-border"}
              size={20}
              color={liked ? "#E91E63" : "#666"}
            />
          </Animated.View>
          <Text style={[styles.actionText, liked && { color: '#E91E63' }]}>
            {liked ? post.likes + 1 : post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onCommentPress(post)}>
          <MaterialIcons name="chat-bubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]}>
          <MaterialIcons name="share" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function CommunityPage() {
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [posts, setPosts] = useState<SupportPost[]>([]);
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStories(CommunityService.getSuccessStories());
      const loadedPosts = await CommunityService.getSupportPosts();
      setPosts(loadedPosts);
      setCircles(CommunityService.getCircles());
      setIsLoading(false);
    };
    loadData();
  }, []);

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

  const filteredPosts = posts.filter(post =>
    selectedCircle === 'all' || post.category === selectedCircle
  );

  const renderHeader = () => (
    <View>
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
              onPress={() => setSelectedCircle(circle.id)}
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
        <Text style={styles.sectionTitle}>Лента поддержки</Text>
      </View>
    </View>
  );

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
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
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
  }
});
