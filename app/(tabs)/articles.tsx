// Образовательные статьи о борьбе с алкогольной зависимостью

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
  TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { FlashList } from "@shopify/flash-list";

const { width: screenWidth } = Dimensions.get('window');

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number;
  preview: string;
  content: string;
  tags: string[];
  icon: string;
  color: string;
}

import { articlesDatabase } from '../../services/articlesDatabase';

const articles: Article[] = articlesDatabase;

const MemoizedArticleCard = React.memo(({ article, onPress }: {
  article: Article;
  onPress: () => void;
}) => {
  const scaleValue = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.96, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  };

  return (
    <Animated.View style={[styles.articleCard, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.articleContent}>
        <View style={styles.articleHeader}>
          <View style={[styles.iconBadge, { backgroundColor: article.color }]}>
            <MaterialIcons name={article.icon as any} size={24} color="white" />
          </View>
          <View style={styles.articleMeta}>
            <Text style={styles.categoryText}>{article.category}</Text>
            <Text style={styles.readTimeText}>{article.readTime} мин чтения</Text>
          </View>
        </View>
        
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articlePreview} numberOfLines={2}>
          {article.preview}
        </Text>
        
        <View style={styles.tagsContainer}>
          {article.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const MemoizedFilterChip = React.memo(({ label, selected, onPress, count }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  count: number;
}) => {
  const scaleValue = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  const handlePress = () => {
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
      runOnJS(onPress)();
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          selected && styles.selectedChip
        ]}
        onPress={handlePress}
      >
        <Text style={[
          styles.filterChipText,
          selected && styles.selectedChipText
        ]}>
          {label} ({count})
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function ArticlesPage() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (id) {
      const article = articles.find(a => a.id === id);
      if (article) {
        setSelectedArticle(article);
      }
    }
  }, [id]);

  const categories = useMemo(() => {
    const cats = new Set(articles.map(a => a.category));
    return ['Все', ...Array.from(cats)].sort();
  }, []);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (selectedCategory !== 'Все') {
      result = result.filter(a => a.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.preview.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  const getCategoryCount = useCallback((category: string) => {
    if (category === 'Все') return articles.length;
    return articles.filter(a => a.category === category).length;
  }, []);

  const handleArticlePress = useCallback((article: Article) => {
    setSelectedArticle(article);
  }, []);

  const renderHeader = () => (
    <View>
      {!searchQuery && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{articles.length}</Text>
            <Text style={styles.statLabel}>Статей</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{categories.length - 1}</Text>
            <Text style={styles.statLabel}>Категорий</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5.0</Text>
            <Text style={styles.statLabel}>Рейтинг</Text>
          </View>
        </View>
      )}

      {!searchQuery && (
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Выберите категорию</Text>
          <FlashList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <MemoizedFilterChip
                label={item}
                selected={selectedCategory === item}
                onPress={() => setSelectedCategory(item)}
                count={getCategoryCount(item)}
              />
            )}
            estimatedItemSize={120}
            contentContainerStyle={styles.filtersContainer}
          />
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {searchQuery ? `Результаты поиска (${filteredArticles.length})` : `📚 Статьи (${filteredArticles.length})`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <MaterialIcons name="menu-book" size={32} color="white" />
          <Text style={styles.headerTitle}>База знаний</Text>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск статей..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="cancel" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        <FlashList
          data={filteredArticles}
          renderItem={({ item }) => (
            <MemoizedArticleCard
              article={item}
              onPress={() => handleArticlePress(item)}
            />
          )}
          estimatedItemSize={200}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={64} color="#CCC" />
              <Text style={styles.emptyText}>Ничего не найдено</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('Все');
                }}
              >
                <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      <Modal
        visible={selectedArticle !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedArticle && (
          <View style={[styles.modalContainer, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedArticle(null)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <View style={styles.modalHeaderInfo}>
                <Text style={styles.modalCategory}>{selectedArticle.category}</Text>
                <Text style={styles.modalReadTime}>
                  {selectedArticle.readTime} мин чтения
                </Text>
              </View>
            </View>

            <Animated.ScrollView style={styles.modalContent}>
              <View style={[styles.iconBadge, styles.largeIconBadge, { backgroundColor: selectedArticle.color }]}>
                <MaterialIcons name={selectedArticle.icon as any} size={40} color="white" />
              </View>
              
              <Text style={styles.modalTitle}>{selectedArticle.title}</Text>
              
              <View style={styles.tagsContainer}>
                {selectedArticle.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.articleBody}>
                {selectedArticle.content.split('\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return null;
                  const isBold = paragraph.startsWith('**') && paragraph.endsWith('**');
                  const cleanText = isBold ? paragraph.slice(2, -2) : paragraph;
                  return (
                    <Text key={index} style={[styles.articleParagraph, isBold && styles.boldParagraph]}>
                      {cleanText}
                    </Text>
                  );
                })}
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="bookmark-border" size={20} color="#2E7D4A" />
                  <Text style={styles.actionButtonText}>Сохранить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="share" size={20} color="#2E7D4A" />
                  <Text style={styles.actionButtonText}>Поделиться</Text>
                </TouchableOpacity>
              </View>
            </Animated.ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 25 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginLeft: 10 },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 8 },
  listContent: { padding: 20 },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#2E7D4A' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  filtersSection: { marginBottom: 20 },
  filterTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  filtersContainer: { gap: 8, paddingRight: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8
  },
  selectedChip: { backgroundColor: '#2E7D4A', borderColor: '#1B4D2E' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  selectedChipText: { color: 'white' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D4A', marginBottom: 16 },
  articleCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3,
  },
  articleContent: { padding: 16 },
  articleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  articleMeta: { marginLeft: 12, flex: 1 },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#666', marginBottom: 2 },
  readTimeText: { fontSize: 10, color: '#999' },
  articleTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  articlePreview: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, color: '#666', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 15, marginBottom: 20 },
  resetButton: { backgroundColor: '#2E7D4A', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  resetButtonText: { color: 'white', fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  closeButton: { padding: 8 },
  modalHeaderInfo: { flex: 1, marginLeft: 12 },
  modalCategory: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 2 },
  modalReadTime: { fontSize: 11, color: '#999' },
  modalContent: { flex: 1, padding: 20 },
  largeIconBadge: { width: 70, height: 70, borderRadius: 35, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 15 },
  articleBody: { marginBottom: 30 },
  articleParagraph: { fontSize: 16, color: '#333', lineHeight: 24, marginBottom: 14 },
  boldParagraph: { fontWeight: 'bold', fontSize: 17, color: '#2E7D4A', marginTop: 8 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 40 },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#E8F5E8', gap: 6 },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: '#2E7D4A' }
});
