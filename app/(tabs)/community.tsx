import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, Image, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CommunityService, SuccessStory, SupportPost, PostComment } from '../../services/communityService';

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

const SupportPostItem = ({ post, onComment }: { post: SupportPost, onComment: (postId: string) => void }) => {
  const [showComments, setShowComments] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motivation': return 'auto-awesome';
      case 'question': return 'help-outline';
      case 'milestone': return 'emoji-events';
      default: return 'favorite-border';
    }
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.categoryIconContainer}>
          <MaterialIcons name={getCategoryIcon(post.category)} size={20} color="#2E7D4A" />
        </View>
        <Text style={styles.authorName}>{post.author}</Text>
        <Text style={styles.timeAgo}>{post.timeAgo}</Text>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="favorite-border" size={18} color="#666" />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowComments(!showComments)}
        >
          <MaterialIcons name="chat-bubble-outline" size={18} color="#666" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onComment(post.id)}>
          <Text style={styles.replyText}>Ответить</Text>
        </TouchableOpacity>
      </View>

      {showComments && post.replies && post.replies.length > 0 && (
        <View style={styles.commentsSection}>
          {post.replies.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentTime}>{comment.timeAgo}</Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function CommunityPage() {
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [posts, setPosts] = useState<SupportPost[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStories(CommunityService.getSuccessStories());
    setPosts(CommunityService.getSupportPosts());
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    CommunityService.createPost('Вы', newPostContent, 'support');
    setNewPostContent('');
    setModalVisible(false);
    loadData();
  };

  const handleAddComment = () => {
    if (!newCommentContent.trim() || !activePostId) return;
    CommunityService.addComment(activePostId, 'Вы', newCommentContent);
    setNewCommentContent('');
    setCommentModalVisible(false);
    setActivePostId(null);
    loadData();
  };

  const openCommentModal = (postId: string) => {
    setActivePostId(postId);
    setCommentModalVisible(true);
  };

  const renderHeader = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Истории успеха</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Все</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContainer}
      >
        {stories.map(story => (
          <SuccessStoryCard key={story.id} story={story} />
        ))}
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

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SupportPostItem post={item} onComment={openCommentModal} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="edit" size={24} color="white" />
      </TouchableOpacity>

      {/* Модальное окно создания поста */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Новый пост</Text>
            <TouchableOpacity onPress={handleCreatePost}>
              <Text style={styles.postButton}>Опубликовать</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Поделитесь своими мыслями или прогрессом..."
            multiline
            value={newPostContent}
            onChangeText={setNewPostContent}
            autoFocus
          />
        </View>
      </Modal>

      {/* Модальное окно создания комментария */}
      <Modal visible={isCommentModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredView}
        >
          <View style={styles.commentModalView}>
            <Text style={styles.modalTitle}>Ваш ответ</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Напишите слова поддержки..."
              multiline
              value={newCommentContent}
              onChangeText={setNewCommentContent}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCommentModalVisible(false)}>
                <Text style={styles.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddComment}>
                <Text style={styles.submitText}>Ответить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
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
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  timeAgo: {
    fontSize: 12,
    color: '#999'
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  postButton: {
    color: '#2E7D4A',
    fontWeight: 'bold',
    fontSize: 16
  },
  textInput: {
    flex: 1,
    padding: 20,
    fontSize: 16,
    textAlignVertical: 'top'
  },
  replyText: {
    color: '#2E7D4A',
    fontSize: 14,
    fontWeight: '600'
  },
  commentsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12
  },
  commentItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333'
  },
  commentTime: {
    fontSize: 11,
    color: '#999'
  },
  commentContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  commentModalView: {
    width: screenWidth * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  commentInput: {
    height: 100,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
    textAlignVertical: 'top'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 15
  },
  cancelBtn: {
    padding: 10
  },
  cancelText: {
    color: '#666',
    fontWeight: '600'
  },
  submitBtn: {
    backgroundColor: '#2E7D4A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
