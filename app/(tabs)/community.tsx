import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommunityPage() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Сообщество поддержки</Text>
        <Text style={styles.subtitle}>
          Поделитесь опытом и получите поддержку от других людей
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.comingSoonCard}>
          <MaterialIcons name="group-add" size={80} color="#2E7D4A" />
          <Text style={styles.comingSoonTitle}>Скоро появится!</Text>
          <Text style={styles.comingSoonText}>
            Мы работаем над созданием безопасного пространства для общения и взаимной поддержки.
          </Text>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Планируемые возможности:</Text>
            
            <View style={styles.featureItem}>
              <MaterialIcons name="forum" size={24} color="#2E7D4A" />
              <Text style={styles.featureText}>Форум для обсуждений</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialIcons name="support-agent" size={24} color="#2E7D4A" />
              <Text style={styles.featureText}>Группы взаимной поддержки</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialIcons name="emoji-events" size={24} color="#2E7D4A" />
              <Text style={styles.featureText}>Истории успеха</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialIcons name="chat" size={24} color="#2E7D4A" />
              <Text style={styles.featureText}>Анонимный чат поддержки</Text>
            </View>
          </View>
        </View>

        <View style={styles.currentSupportCard}>
          <Text style={styles.currentSupportTitle}>А пока...</Text>
          <Text style={styles.currentSupportText}>
            Используйте кнопку экстренной помощи для получения немедленной поддержки
          </Text>
          
          <View style={styles.helplineContainer}>
            <MaterialIcons name="phone" size={24} color="#FF6B6B" />
            <View style={styles.helplineInfo}>
              <Text style={styles.helplineTitle}>Телефон доверия</Text>
              <Text style={styles.helplineNumber}>8-800-200-0-200</Text>
              <Text style={styles.helplineDescription}>
                Бесплатная психологическая помощь 24/7
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.privacyCard}>
          <MaterialIcons name="security" size={24} color="#2E7D4A" />
          <Text style={styles.privacyTitle}>Конфиденциальность</Text>
          <Text style={styles.privacyText}>
            Все ваши данные хранятся локально на устройстве. Мы не собираем и не передаем 
            личную информацию третьим лицам. Ваша анонимность и приватность - наш приоритет.
          </Text>
        </View>
      </ScrollView>
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
    color: '#666',
    lineHeight: 22
  },
  content: {
    padding: 20,
    gap: 20
  },
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginTop: 20,
    marginBottom: 10
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30
  },
  featuresContainer: {
    width: '100%'
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 15,
    textAlign: 'center'
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  currentSupportCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500'
  },
  currentSupportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CC8400',
    marginBottom: 10
  },
  currentSupportText: {
    fontSize: 16,
    color: '#8B6914',
    lineHeight: 22,
    marginBottom: 20
  },
  helplineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    gap: 12
  },
  helplineInfo: {
    flex: 1
  },
  helplineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  helplineNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 5
  },
  helplineDescription: {
    fontSize: 14,
    color: '#666'
  },
  privacyCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    gap: 15
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10
  },
  privacyText: {
    fontSize: 14,
    color: '#4A6741',
    lineHeight: 20,
    flex: 1
  }
});