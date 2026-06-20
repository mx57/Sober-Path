
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
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

// Refactored Message component
const MessageBubble = React.memo(({ message }: { message: ChatMessage }) => {
  const isUser = message.isUser;
  return (
    <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
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
    </View>
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
                <Text style={styles.cardTitle}>Статус: {vm.insights.progressSummary}</Text>
                <Text>Сообщений: {vm.insights.conversationCount}</Text>
            </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, alignItems: 'center' },
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
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: 'white', alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
  scrollContent: { padding: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 }
});
