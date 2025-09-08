import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { psychologyTips, PsychologyTip } from '../../services/recoveryService';

export default function PsychologyPage() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const categories = [
    { id: 'all', title: 'Все', icon: 'psychology' },
    { id: 'motivation', title: 'Мотивация', icon: 'trending-up' },
    { id: 'coping', title: 'Преодоление', icon: 'shield' },
    { id: 'understanding', title: 'Понимание', icon: 'lightbulb' },
    { id: 'techniques', title: 'Техники', icon: 'build' }
  ];

  const filteredTips = selectedCategory === 'all' 
    ? psychologyTips 
    : psychologyTips.filter(tip => tip.category === selectedCategory);

  const renderTip = ({ item }: { item: PsychologyTip }) => {
    const isExpanded = expandedTip === item.id;
    
    return (
      <TouchableOpacity 
        style={styles.tipCard}
        onPress={() => setExpandedTip(isExpanded ? null : item.id)}
      >
        <View style={styles.tipHeader}>
          <View style={styles.tipTitleContainer}>
            <Text style={styles.tipTitle}>{item.title}</Text>
            <Text style={styles.readingTime}>{item.readingTime} мин</Text>
          </View>
          <MaterialIcons 
            name={isExpanded ? 'expand-less' : 'expand-more'} 
            size={24} 
            color="#2E7D4A" 
          />
        </View>
        
        {isExpanded && (
          <View style={styles.tipContent}>
            <Text style={styles.tipText}>{item.content}</Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {categories.find(cat => cat.id === item.category)?.title}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Психологическая поддержка</Text>
        <Text style={styles.subtitle}>
          Советы от профессиональных психологов
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <MaterialIcons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.id ? 'white' : '#2E7D4A'} 
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredTips}
        renderItem={renderTip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tipsContainer}
        showsVerticalScrollIndicator={false}
      />
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  categoriesContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    backgroundColor: 'white',
    gap: 6
  },
  selectedCategory: {
    backgroundColor: '#2E7D4A'
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D4A'
  },
  selectedCategoryText: {
    color: 'white'
  },
  tipsContainer: {
    padding: 20,
    gap: 15
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tipTitleContainer: {
    flex: 1,
    marginRight: 10
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 5
  },
  readingTime: {
    fontSize: 12,
    color: '#999'
  },
  tipContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  tipText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  categoryText: {
    fontSize: 12,
    color: '#2E7D4A',
    fontWeight: '500'
  }
});