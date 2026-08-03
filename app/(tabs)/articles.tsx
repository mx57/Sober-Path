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
import { useRecovery } from '../../hooks/useRecovery';
import { useThemeColors } from '../../hooks/useThemeColors';
import * as Haptics from 'expo-haptics';

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
  quiz?: any[];
}

import { articlesDatabase } from '../../services/articlesDatabase';
import { ArticleQuiz } from '../../components/ArticleQuiz';

const articles: Article[] = articlesDatabase;

const MemoizedArticleCard = React.memo(function MemoizedArticleCard({ article, onPress, isFavorite, onToggleFavorite }: {
  article: Article;
  onPress: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
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
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite(article.id);
            }}
            style={styles.favoriteBadge}
          >
            <MaterialIcons
              name={isFavorite ? "favorite" : "favorite-border"}
              size={20}
              color={isFavorite ? "#E91E63" : "#CCC"}
            />
          </TouchableOpacity>
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

const MemoizedFilterChip = React.memo(function MemoizedFilterChip({ label, selected, onPress, count }: {
  label: string;
  selected: boolean;
  onPress: () => void;
  count: number;
}) {
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
  const { isArticleFavorite, toggleFavoriteArticle, favoriteArticleIds } = useRecovery();
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeInfoTimeline, setActiveInfoTimeline] = useState<'1w' | '1m' | '6m' | '1y'>('1w');

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
    return ['Все', 'Избранное', ...Array.from(cats)].sort();
  }, []);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (selectedCategory === 'Избранное') {
      result = result.filter(a => favoriteArticleIds.includes(a.id));
    } else if (selectedCategory !== 'Все') {
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
    if (category === 'Избранное') return favoriteArticleIds.length;
    return articles.filter(a => a.category === category).length;
  }, [favoriteArticleIds]);

  const handleArticlePress = useCallback((article: Article) => {
    setSelectedArticle(article);
  }, []);

  const renderHeader = () => {
    const timelines = {
      '1w': {
        percentage: 35,
        title: 'Очищение и Сверхчувствительность',
        desc: 'Начало пути. Рецепторы перегружены и нечувствительны к обычным стимулам. Вы можете испытывать эмоциональные перепады, раздражительность или апатию, но нервная система уже начинает медленно очищаться от токсинов.',
        progressColor: '#FF9800',
        badge: 'Адаптация'
      },
      '1m': {
        percentage: 60,
        title: 'Регенерация Рецепторов',
        desc: 'Начало регенерации D2-рецепторов. Возвращается способность радоваться простым вещам: вкусной еде, физической активности, природе и общению. Качество сна заметно улучшается.',
        progressColor: '#2196F3',
        badge: 'Восстановление'
      },
      '6m': {
        percentage: 85,
        title: 'Стабилизация и Мотивация',
        desc: 'Плотность дофаминовых рецепторов практически полностью восстанавливается до нормы. Заметно улучшаются концентрация внимания, кратковременная память и возвращается здоровая долгосрочная мотивация.',
        progressColor: '#9C27B0',
        badge: 'Стабильность'
      },
      '1y': {
        percentage: 100,
        title: 'Полное Обновление Мозга',
        desc: 'Полная нормализация дофаминовой системы. Способность испытывать глубокое естественное удовольствие и долгосрочную увлеченность жизнью восстановлена на 100%. Когнитивный тонус на пике.',
        progressColor: '#2E7D4A',
        badge: 'Новая жизнь'
      }
    };

    const curTimeline = timelines[activeInfoTimeline];

    return (
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

      {/* DOPAMINE RECEPTOR RECOVERY INFOGRAPHIC */}
      {!searchQuery && (
        <View style={styles.infoWidgetContainer}>
          <View style={styles.infoWidgetHeader}>
            <MaterialIcons name="insights" size={22} color="#2E7D4A" />
            <Text style={styles.infoWidgetTitle}>Восстановление дофамина</Text>
          </View>
          <Text style={styles.infoWidgetSub}>
            Интерактивная карта регенерации дофаминовых рецепторов мозга на пути к полной трезвости:
          </Text>

          {/* Timeline Tabs */}
          <View style={styles.infoTabs}>
            {(['1w', '1m', '6m', '1y'] as const).map((t) => {
              const labels = { '1w': '1 Нед', '1m': '1 Мес', '6m': '6 Мес', '1y': '1 Год' };
              const isSelected = activeInfoTimeline === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.infoTabButton, isSelected && styles.infoTabButtonActive]}
                  onPress={() => {
                    setActiveInfoTimeline(t);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[styles.infoTabButtonText, isSelected && styles.infoTabButtonTextActive]}>
                    {labels[t]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Content Card */}
          <View style={styles.infoContentCard}>
            <View style={styles.infoContentHeader}>
              <Text style={styles.infoContentTitle}>{curTimeline.title}</Text>
              <View style={[styles.infoContentBadge, { backgroundColor: curTimeline.progressColor + '20' }]}>
                <Text style={[styles.infoContentBadgeText, { color: curTimeline.progressColor }]}>
                  {curTimeline.badge}
                </Text>
              </View>
            </View>

            <Text style={styles.infoContentDesc}>{curTimeline.desc}</Text>

            {/* Progress Bar */}
            <View style={styles.infoProgressRow}>
              <Text style={styles.infoProgressLabel}>Рецепторы:</Text>
              <View style={styles.infoProgressBar}>
                <View style={[
                  styles.infoProgressFill,
                  { width: `${curTimeline.percentage}%`, backgroundColor: curTimeline.progressColor }
                ]} />
              </View>
              <Text style={[styles.infoProgressValue, { color: curTimeline.progressColor }]}>
                {curTimeline.percentage}%
              </Text>
            </View>
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
  };

  const themeColors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient colors={themeColors.gradient} style={[styles.header, { paddingTop: insets.top + 10 }]}>
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
              isFavorite={isArticleFavorite(item.id)}
              onToggleFavorite={toggleFavoriteArticle}
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

              {selectedArticle.quiz && (
                <ArticleQuiz
                  questions={selectedArticle.quiz}
                  onComplete={(score) => {
                    console.log(`Quiz completed with score: ${score}`);
                    // Можно добавить логику награды здесь
                  }}
                />
              )}
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, isArticleFavorite(selectedArticle.id) && styles.activeActionButton]}
                  onPress={() => toggleFavoriteArticle(selectedArticle.id)}
                >
                  <MaterialIcons
                    name={isArticleFavorite(selectedArticle.id) ? "favorite" : "favorite-border"}
                    size={20}
                    color={isArticleFavorite(selectedArticle.id) ? "white" : "#2E7D4A"}
                  />
                  <Text style={[
                    styles.actionButtonText,
                    isArticleFavorite(selectedArticle.id) && styles.activeActionButtonText
                  ]}>
                    {isArticleFavorite(selectedArticle.id) ? 'В избранном' : 'В избранное'}
                  </Text>
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
  favoriteBadge: {
    padding: 8,
    marginRight: -8
  },
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
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 40, gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, backgroundColor: '#E8F5E8', gap: 6 },
  activeActionButton: { backgroundColor: '#E91E63' },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: '#2E7D4A' },
  activeActionButtonText: { color: 'white' },
  infoWidgetContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoWidgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoWidgetSub: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 15,
  },
  infoTabs: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
    padding: 4,
    borderRadius: 12,
    marginBottom: 15,
    gap: 4,
  },
  infoTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  infoTabButtonActive: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  infoTabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  infoTabButtonTextActive: {
    color: '#2E7D4A',
    fontWeight: 'bold',
  },
  infoContentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  infoContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoContentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  infoContentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  infoContentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContentDesc: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    marginBottom: 12,
  },
  infoProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoProgressLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
  },
  infoProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  infoProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoProgressValue: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 35,
    textAlign: 'right',
  }
});
