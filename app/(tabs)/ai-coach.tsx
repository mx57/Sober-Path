
import React, { useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Modal,
  Dimensions, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAICoachViewModel, ChatMessage } from '../../hooks/useAICoachViewModel';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

// Refactored Message component
const MessageBubble = React.memo(({ message }: { message: ChatMessage }) => {
  const isUser = message.isUser;
  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={[styles.messageContainer, isUser && styles.userMessageContainer]}
    >
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && (
          <View style={styles.aiHeader}>
            <MaterialIcons name="psychology" size={16} color="#2E7D4A" />
            <Text style={styles.aiLabel}>AI-Коуч</Text>
          </View>
        )}
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
          {message.text}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
});

export default function EnhancedAICoach() {
  const insets = useSafeAreaInsets();
  const vm = useAICoachViewModel();
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.header}>
        <MaterialIcons name="psychology" size={32} color="white" />
        <Text style={styles.title}>AI-Коуч 2.0</Text>
        <Text style={styles.headerStats}>Дней: {vm.soberDays}</Text>
      </LinearGradient>

      <View style={styles.tabBar}>
        {[
          { key: 'chat', label: 'Чат' },
          { key: 'insights', label: 'Анализ' },
          { key: 'notifications', label: 'Уведомления' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, vm.activeTab === tab.key && styles.activeTab]}
            onPress={() => vm.setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabLabel, vm.activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {vm.activeTab === 'chat' && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {vm.messages.map(m => <MessageBubble key={m.id} message={m} />)}
              {vm.isTyping && <ActivityIndicator color="#2E7D4A" style={{ margin: 10 }} />}
            </ScrollView>

            {vm.messages.length > 0 && !vm.messages[vm.messages.length - 1].isUser && vm.messages[vm.messages.length - 1].suggestions && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.suggestionsContainer}
                contentContainerStyle={styles.suggestionsContent}
              >
                {vm.messages[vm.messages.length - 1].suggestions?.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionButton}
                    onPress={() => vm.sendMessage(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={vm.inputText}
                onChangeText={vm.setInputText}
                placeholder="Напишите сообщение..."
              />
              <TouchableOpacity onPress={vm.sendMessage} disabled={!vm.inputText.trim()}>
                <MaterialIcons name="send" size={24} color={vm.inputText.trim() ? "#2E7D4A" : "#CCC"} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {vm.activeTab === 'insights' && vm.insights && (
            <ScrollView style={styles.scrollContent}>
                <View style={styles.insightCard}>
                  <Text style={styles.cardTitle}>Прогресс</Text>
                  <Text style={styles.statusText}>{vm.insights.progressSummary}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{vm.insights.conversationCount}</Text>
                      <Text style={styles.statLabel}>Сессий</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{vm.soberDays}</Text>
                      <Text style={styles.statLabel}>Дней</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Выявленные триггеры</Text>
                {vm.triggers && vm.triggers.length > 0 ? (
                  vm.triggers.map((trigger: any) => (
                    <View key={trigger.id} style={styles.triggerCard}>
                      <View style={styles.triggerHeader}>
                        <MaterialIcons
                          name={trigger.type === 'temporal' ? 'access-time' : 'error-outline'}
                          size={20}
                          color="#FF6B6B"
                        />
                        <Text style={styles.triggerName}>{trigger.name}</Text>
                        <View style={[styles.severityBadge, { backgroundColor: trigger.severity > 3 ? '#FFE5E5' : '#E5F6ED' }]}>
                          <Text style={[styles.severityText, { color: trigger.severity > 3 ? '#FF6B6B' : '#2E7D4A' }]}>
                            Ур. {trigger.severity}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.triggerDesc}>{trigger.description}</Text>
                      <View style={styles.countermeasuresContainer}>
                        {trigger.countermeasures.map((cm: string, idx: number) => (
                          <View key={idx} style={styles.cmBadge}>
                            <Text style={styles.cmText}>{cm}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Триггеры пока не выявлены. Продолжайте общение.</Text>
                )}
            </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 25,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  headerStats: { color: 'white', marginTop: 5 },
  tabBar: { flexDirection: 'row', margin: 10, backgroundColor: 'white', borderRadius: 10 },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  activeTab: { backgroundColor: '#2E7D4A', borderRadius: 10 },
  tabLabel: { color: '#2E7D4A', fontWeight: 'bold' },
  activeTabLabel: { color: 'white' },
  content: { flex: 1 },
  messagesContainer: { flex: 1, padding: 10 },
  messageContainer: { marginVertical: 5, alignItems: 'flex-start' },
  userMessageContainer: { alignItems: 'flex-end' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15 },
  userBubble: { backgroundColor: '#2E7D4A' },
  aiBubble: { backgroundColor: 'white', elevation: 2 },
  messageText: { fontSize: 16 },
  userMessageText: { color: 'white' },
  aiMessageText: { color: '#333' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  aiLabel: { fontSize: 10, fontWeight: 'bold', color: '#2E7D4A', marginLeft: 4 },
  timestamp: { fontSize: 10, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  suggestionsContainer: {
    maxHeight: 50,
    backgroundColor: '#F8F9FA',
  },
  suggestionsContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D4A',
    justifyContent: 'center',
  },
  suggestionText: {
    color: '#2E7D4A',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: 'white', alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
  scrollContent: { padding: 20 },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D4A', marginBottom: 10 },
  statusText: { fontSize: 16, color: '#333', marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#2E7D4A' },
  statLabel: { fontSize: 12, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  triggerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  triggerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  triggerName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 8, flex: 1 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  severityText: { fontSize: 10, fontWeight: 'bold' },
  triggerDesc: { fontSize: 14, color: '#666', marginBottom: 10 },
  countermeasuresContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cmBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cmText: { fontSize: 12, color: '#444' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' }
});
