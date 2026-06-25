// Образовательные статьи о борьбе с алкогольной зависимостью

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

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

// Используем базу данных статей
const articles: Article[] = articlesDatabase;

// Компоненты остаются теми же
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
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const fadeInValue = useSharedValue(0);
  const slideValue = useSharedValue(30);

  const fadeInAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: slideValue.value }]
  }));

  React.useEffect(() => {
    fadeInValue.value = withTiming(1, { duration: 800 });
    slideValue.value = withTiming(0, { duration: 800 });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(articles.map(a => a.category));
    return ['Все', ...Array.from(cats)];
  }, []);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'Все') return articles;
    return articles.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  const getCategoryCount = useCallback((category: string) => {
    if (category === 'Все') return articles.length;
    return articles.filter(a => a.category === category).length;
  }, []);

  const handleArticlePress = useCallback((article: Article) => {
    setSelectedArticle(article);
  }, []);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="menu-book" size={32} color="white" />
          <Text style={styles.headerTitle}>База знаний</Text>
          <Text style={styles.headerSubtitle}>
            {articles.length} научных статей о восстановлении
          </Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, fadeInAnimatedStyle]}>
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
            <Text style={styles.statNumber}>
              {Math.round(articles.reduce((sum, a) => sum + a.readTime, 0) / articles.length)}
            </Text>
            <Text style={styles.statLabel}>мин среднее</Text>
          </View>
        </View>

        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Выберите категорию</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {categories.map((category) => (
                <MemoizedFilterChip
                  key={category}
                  label={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  count={getCategoryCount(category)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.articlesContainer}>
          <Text style={styles.sectionTitle}>
            📚 Статьи ({filteredArticles.length})
          </Text>
          <View style={styles.articlesList}>
            {filteredArticles.map((article) => (
              <MemoizedArticleCard
                key={article.id}
                article={article}
                onPress={() => handleArticlePress(article)}
              />
            ))}
          </View>
        </View>
      </Animated.View>

      <Modal
        visible={selectedArticle !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedArticle && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
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

            <ScrollView style={styles.modalContent}>
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
                    <Text
                      key={index}
                      style={[
                        styles.articleParagraph,
                        isBold && styles.boldParagraph
                      ]}
                    >
                      {cleanText}
                    </Text>
                  );
                })}
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="bookmark-border" size={20} color="#2196F3" />
                  <Text style={styles.actionButtonText}>Сохранить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="share" size={20} color="#2196F3" />
                  <Text style={styles.actionButtonText}>Поделиться</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 25,
  },
  headerContent: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center'
  },
  content: {
    padding: 20
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A'
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  filtersSection: {
    marginBottom: 20
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedChip: {
    backgroundColor: '#2E7D4A',
    borderColor: '#1B4D2E'
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  selectedChipText: {
    color: 'white'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 16
  },
  articlesContainer: {
    marginBottom: 20
  },
  articlesList: {
    gap: 12
  },
  articleCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  articleContent: {
    padding: 16
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  articleMeta: {
    marginLeft: 12,
    flex: 1
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2
  },
  readTimeText: {
    fontSize: 11,
    color: '#999'
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  articlePreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  tagText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  closeButton: {
    padding: 8
  },
  modalHeaderInfo: {
    flex: 1,
    marginLeft: 12
  },
  modalCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2
  },
  modalReadTime: {
    fontSize: 12,
    color: '#999'
  },
  modalContent: {
    flex: 1,
    padding: 20
  },
  largeIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20
  },
  articleBody: {
    marginBottom: 30
  },
  articleParagraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
    marginBottom: 16
  },
  boldParagraph: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2E7D4A',
    marginTop: 8
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#E8F5E8',
    gap: 6
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D4A'
  }
});
