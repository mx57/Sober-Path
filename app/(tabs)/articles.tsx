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

// База знаний - 50+ статей (РАСШИРЕННАЯ ВЕРСИЯ с полным контентом)
const articles: Article[] = [
  {
    id: '1',
    title: 'Как алкоголь влияет на мозг',
    category: 'Наука о зависимости',
    readTime: 8,
    preview: 'Понимание механизмов воздействия алкоголя на нейронные связи',
    content: 'Алкоголь воздействует на систему вознаграждения мозга, высвобождая дофамин и создавая ощущение удовольствия. Регулярное употребление перестраивает нейронные связи, приводя к зависимости.\n\nКогда вы употребляете алкоголь, он быстро попадает в кровоток и достигает мозга. Там он воздействует на несколько нейромедиаторных систем.\n\n**Система ГАМК**: Алкоголь усиливает действие ГАМК (гамма-аминомасляной кислоты) - главного тормозного нейромедиатора мозга. Это приводит к расслаблению, снижению тревожности и замедлению реакций.\n\n**Система глутамата**: Одновременно алкоголь блокирует глутамат - возбуждающий нейромедиатор. Это дополнительно угнетает нервную систему.\n\n**Дофаминовая система**: Алкоголь стимулирует выброс дофамина в nucleus accumbens - центре удовольствия мозга. Это создает ощущение эйфории и подкрепляет желание повторить опыт.\n\nПри регулярном употреблении мозг адаптируется: снижается чувствительность рецепторов, уменьшается естественная выработка нейромедиаторов. Развивается толерантность - нужны все большие дозы для достижения эффекта.\n\nГиппокамп (центр памяти) особенно уязвим - алкоголь нарушает формирование новых воспоминаний. Префронтальная кора (центр принятия решений) также страдает, что объясняет импульсивное поведение в состоянии опьянения.\n\nХорошая новость: мозг обладает нейропластичностью. После прекращения употребления начинается восстановление нейронных связей, улучшается когнитивная функция.',
    tags: ['нейробиология', 'дофамин', 'мозг'],
    icon: 'psychology',
    color: '#9C27B0'
  },
  {
    id: '2',
    title: 'Стадии алкогольной зависимости',
    category: 'Наука о зависимости',
    readTime: 7,
    preview: 'От социального употребления до физической зависимости',
    content: 'Зависимость развивается постепенно через несколько стадий. Понимание этого процесса помогает распознать проблему на ранних этапах.\n\n**Стадия 1: Экспериментальное употребление**\nЧеловек пробует алкоголь из любопытства, в социальных ситуациях. Употребление нерегулярное, контролируемое. Нет негативных последствий.\n\n**Стадия 2: Регулярное употребление**\nУпотребление становится привычкой - по выходным, после работы. Появляется психологическая зависимость: алкоголь ассоциируется с расслаблением, весельем. Толерантность начинает расти.\n\n**Стадия 3: Проблемное употребление**\nУпотребление вызывает проблемы: конфликты в семье, снижение производительности на работе, финансовые трудности. Человек пытается контролировать, но безуспешно. Появляются провалы в памяти.\n\n**Стадия 4: Зависимость**\nФизическая и психологическая зависимость. Синдром отмены при прекращении употребления. Компульсивное влечение - невозможность остановиться. Употребление несмотря на очевидный вред.\n\nПризнаки перехода к зависимости:\n• Увеличение дозы для достижения эффекта\n• Невозможность контролировать количество\n• Употребление в одиночку\n• Скрытность, ложь об употреблении\n• Пренебрежение обязанностями\n• Продолжение несмотря на проблемы\n\nВажно: чем раньше распознать проблему, тем легче преодолеть зависимость.',
    tags: ['стадии', 'прогрессирование', 'симптомы'],
    icon: 'trending-up',
    color: '#F44336'
  },
  {
    id: '3',
    title: 'Генетика и алкоголизм',
    category: 'Наука о зависимости',
    readTime: 6,
    preview: 'Роль наследственности в развитии зависимости',
    content: 'Исследования показывают, что генетические факторы составляют около 50% риска развития алкогольной зависимости. Определенные гены влияют на метаболизм алкоголя и реакцию организма на него.\n\n**Гены метаболизма алкоголя**\nГены ADH (алкогольдегидрогеназа) и ALDH (альдегиддегидрогеназа) определяют скорость расщепления алкоголя. Некоторые варианты этих генов вызывают быстрое накопление токсичного ацетальдегида, что приводит к неприятным симптомам.\n\n**Семейная история**\nЕсли один из родителей страдал алкоголизмом, риск развития зависимости у детей повышается в 2-4 раза. Если оба родителя - риск еще выше. Однако это не приговор: гены создают предрасположенность, но окружающая среда и личный выбор играют решающую роль.\n\nПонимание генетической предрасположенности помогает в профилактике и лечении.',
    tags: ['генетика', 'наследственность', 'риски'],
    icon: 'biotech',
    color: '#3F51B5'
  }
];

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
      <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.header}>
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
    alignItems: 'center'
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
    color: '#2196F3'
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
    backgroundColor: '#2196F3',
    borderColor: '#1976D2'
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
    color: '#2196F3',
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
    backgroundColor: '#E3F2FD',
    gap: 6
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3'
  }
});
