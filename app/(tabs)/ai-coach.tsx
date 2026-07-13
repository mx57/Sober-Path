
import React, { useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Modal,
  Dimensions, ActivityIndicator, ViewStyle
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAICoachViewModel, ChatMessage } from '../../hooks/useAICoachViewModel';
import { AICoachChallenge } from '../../services/AICoachService';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInUp,
  FadeInRight,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

const ChallengeCard = React.memo(({ challenge, onComplete }: {
  challenge: AICoachChallenge,
  onComplete: (id: string) => void
}) => (
  <Animated.View
    entering={FadeInRight.delay(200)}
    style={[styles.challengeCard, challenge.completed && styles.challengeCompleted]}
  >
    <View style={styles.challengeIconContainer}>
      <MaterialIcons name={challenge.icon as keyof typeof MaterialIcons.glyphMap} size={24} color={challenge.completed ? "#FFF" : "#2E7D4A"} />
    </View>
    <View style={styles.challengeInfo}>
      <Text style={[styles.challengeTitle, challenge.completed && styles.challengeCompletedText]}>
        {challenge.title}
      </Text>
      <Text style={[styles.challengePoints, challenge.completed && styles.challengeCompletedText]}>
        +{challenge.rewardPoints} XP
      </Text>
    </View>
    {!challenge.completed && (
      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onComplete(challenge.id);
        }}
      >
        <MaterialIcons name="check" size={20} color="white" />
      </TouchableOpacity>
    )}
  </Animated.View>
));
ChallengeCard.displayName = 'ChallengeCard';

// Refactored Message component
const MessageBubble = React.memo(({ message, onArticlePress, onCoursePress, onSpeak, isSpeaking }: {
  message: ChatMessage,
  onArticlePress: (id: string) => void,
  onCoursePress: (id: string) => void,
  onSpeak: (text: string) => void,
  isSpeaking: boolean
}) => {
  const isUser = message.isUser;
  const isHighUrgency = message.urgency === 'high' || message.urgency === 'critical';

  const getBubbleStyle = (): ViewStyle[] => {
    const base: ViewStyle[] = [styles.messageBubble];
    if (isUser) {
      base.push(styles.userBubble);
    } else {
      base.push(styles.aiBubble);
      if (message.urgency === 'critical') base.push(styles.criticalBubble);
      else if (message.urgency === 'high') base.push(styles.highUrgencyBubble);
    }
    return base;
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={[styles.messageContainer, isUser && styles.userMessageContainer]}
    >
      <View style={getBubbleStyle()}>
        {!isUser && (
          <View style={styles.aiHeader}>
            <View style={styles.aiLabelRow}>
              <MaterialIcons
                name={isHighUrgency ? "report-problem" : "psychology"}
                size={16}
                color={isHighUrgency ? "#FF5252" : "#2E7D4A"}
              />
              <Text style={[styles.aiLabel, isHighUrgency && { color: '#FF5252' }]}>
                {isHighUrgency ? 'Экстренный Коуч' : 'AI-Коуч'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onSpeak(message.text)} style={styles.speakButton}>
              <MaterialIcons
                name={isSpeaking ? "volume-up" : "volume-mute"}
                size={18}
                color={isHighUrgency ? "#FF5252" : "#2E7D4A"}
              />
            </TouchableOpacity>
          </View>
        )}
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.aiMessageText,
          isHighUrgency && { color: message.urgency === 'critical' ? 'white' : '#D32F2F' }
        ]}>
          {message.text}
        </Text>

        {message.exercise && (
          <View style={styles.exerciseProgressContainer}>
            <View style={styles.exerciseProgressBar}>
              {message.exercise.steps.map((_: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.exerciseProgressStep,
                    idx <= message.exercise.currentStep && styles.exerciseProgressStepActive
                  ]}
                />
              ))}
            </View>
            <Text style={styles.exerciseStepInfo}>
              Шаг {message.exercise.currentStep + 1} из {message.exercise.steps.length}
            </Text>
          </View>
        )}
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
        </Text>

        {!isUser && message.recommendedArticles && message.recommendedArticles.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationTitle}>Рекомендуемые статьи:</Text>
            {message.recommendedArticles.map(article => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleLink}
                onPress={() => onArticlePress(article.id)}
              >
                <MaterialIcons name="article" size={16} color="#2E7D4A" />
                <Text style={styles.articleLinkText}>{article.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isUser && message.recommendedCourses && message.recommendedCourses.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationTitle}>Рекомендуемые курсы:</Text>
            {message.recommendedCourses.map(course => (
              <TouchableOpacity
                key={course.id}
                style={styles.articleLink}
                onPress={() => onCoursePress(course.id)}
              >
                <MaterialIcons name="school" size={16} color="#2E7D4A" />
                <Text style={styles.articleLinkText}>{course.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
});
MessageBubble.displayName = 'MessageBubble';

export default function EnhancedAICoach() {
  const insets = useSafeAreaInsets();
  const vm = useAICoachViewModel();
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

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
            {vm.challenges && vm.challenges.length > 0 && (
              <View style={styles.challengesSection}>
                <Text style={styles.sectionSmallTitle}>Ежедневные испытания</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.challengesScroll}
                >
                  {vm.challenges.map(ch => (
                    <ChallengeCard
                      key={ch.id}
                      challenge={ch}
                      onComplete={vm.completeChallenge}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {vm.messages.length === 1 && vm.chatStarters.length > 0 && (
                <View style={styles.startersContainer}>
                  <Text style={styles.startersTitle}>Частые вопросы:</Text>
                  <View style={styles.startersGrid}>
                    {vm.chatStarters.map((starter, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.starterButton}
                        onPress={() => vm.sendMessage(starter)}
                      >
                        <Text style={styles.starterText}>{starter}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {vm.messages.map(m => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onArticlePress={(id) => router.push({ pathname: '/articles', params: { id } })}
                  onCoursePress={(id) => router.push({ pathname: '/micro-courses', params: { id } })}
                  onSpeak={vm.speak}
                  isSpeaking={vm.isSpeaking}
                />
              ))}
              {vm.isTyping && (
                <View style={styles.typingContainer}>
                  <ActivityIndicator size="small" color="#2E7D4A" />
                  <Text style={styles.typingText}>Коуч печатает...</Text>
                </View>
              )}
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
              <TouchableOpacity
                onPress={() => {
                  if (vm.inputText.trim()) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    vm.sendMessage();
                  }
                }}
                disabled={!vm.inputText.trim()}
              >
                <MaterialIcons name="send" size={24} color={vm.inputText.trim() ? "#2E7D4A" : "#CCC"} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {vm.activeTab === 'insights' && vm.insights && (
            <ScrollView style={styles.scrollContent}>
                {vm.insights.psychologicalProfile && (
                  <View style={styles.profileCard}>
                    <Text style={styles.cardTitle}>Психологический профиль</Text>
                    <View style={styles.profileSections}>
                      <View style={styles.profileSection}>
                        <Text style={styles.profileSectionTitle}>💪 Сильные стороны</Text>
                        <View style={styles.profileTags}>
                          {vm.insights.psychologicalProfile.strengths.length > 0 ? (
                            vm.insights.psychologicalProfile.strengths.map((s: string, i: number) => (
                              <View key={i} style={[styles.profileTag, { backgroundColor: '#E8F5E8' }]}>
                                <Text style={[styles.profileTagText, { color: '#2E7D4A' }]}>{s}</Text>
                              </View>
                            ))
                          ) : <Text style={styles.emptySmallText}>Анализируем...</Text>}
                        </View>
                      </View>
                      <View style={styles.profileSection}>
                        <Text style={styles.profileSectionTitle}>🎯 Уязвимости</Text>
                        <View style={styles.profileTags}>
                          {vm.insights.psychologicalProfile.vulnerabilities.length > 0 ? (
                            vm.insights.psychologicalProfile.vulnerabilities.map((v: string, i: number) => (
                              <View key={i} style={[styles.profileTag, { backgroundColor: '#FFF3E0' }]}>
                                <Text style={[styles.profileTagText, { color: '#E65100' }]}>{v}</Text>
                              </View>
                            ))
                          ) : <Text style={styles.emptySmallText}>Анализируем...</Text>}
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.insightCard}>
                  <Text style={styles.cardTitle}>Прогресс</Text>
                  <Text style={styles.statusText}>{vm.insights.progressSummary}</Text>

                  {vm.insights.achievements && vm.insights.achievements.length > 0 && (
                    <View style={styles.achievementsMemory}>
                      <Text style={styles.achievementsMemoryTitle}>Зафиксированные успехи:</Text>
                      {vm.insights.achievements.map((ach: string, idx: number) => (
                        <View key={idx} style={styles.achievementMemoryItem}>
                          <MaterialIcons name="stars" size={16} color="#FFC107" />
                          <Text style={styles.achievementMemoryText}>{ach.replace('Упоминание прогресса: ', '')}</Text>
                        </View>
                      ))}
                    </View>
                  )}

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

                {vm.roadmap && (
                  <View style={styles.roadmapCard}>
                    <View style={styles.roadmapHeader}>
                      <MaterialIcons name="event-note" size={24} color="#2E7D4A" />
                      <View>
                        <Text style={styles.roadmapTitle}>План на {vm.roadmap.weekNumber}-ю неделю</Text>
                        <Text style={styles.roadmapFocus}>Фокус: {vm.roadmap.focus}</Text>
                      </View>
                    </View>
                    <View style={styles.roadmapTasks}>
                      {vm.roadmap.tasks.map((task: any) => (
                        <TouchableOpacity
                          key={task.id}
                          style={styles.roadmapTaskItem}
                          onPress={() => vm.toggleTask(task.id)}
                        >
                          <MaterialIcons
                            name={task.completed ? "check-box" : "check-box-outline-blank"}
                            size={24}
                            color={task.completed ? "#2E7D4A" : "#CCC"}
                          />
                          <Text style={[styles.roadmapTaskText, task.completed && styles.roadmapTaskCompleted]}>
                            {task.text}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

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
  highUrgencyBubble: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    borderWidth: 1,
  },
  criticalBubble: {
    backgroundColor: '#D32F2F',
  },
  messageText: { fontSize: 16 },
  exerciseProgressContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  exerciseProgressBar: {
    flexDirection: 'row',
    height: 4,
    gap: 4,
    marginBottom: 6,
  },
  exerciseProgressStep: {
    flex: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  exerciseProgressStepActive: {
    backgroundColor: '#2E7D4A',
  },
  exerciseStepInfo: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  userMessageText: { color: 'white' },
  aiMessageText: { color: '#333' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  aiLabelRow: { flexDirection: 'row', alignItems: 'center' },
  aiLabel: { fontSize: 10, fontWeight: 'bold', color: '#2E7D4A', marginLeft: 4 },
  speakButton: { padding: 4 },
  timestamp: { fontSize: 10, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  recommendationsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  recommendationTitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  articleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    gap: 6,
  },
  articleLinkText: {
    fontSize: 12,
    color: '#2E7D4A',
    fontWeight: '500',
    flex: 1,
  },
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
  sectionSmallTitle: { fontSize: 14, fontWeight: 'bold', color: '#2E7D4A', marginHorizontal: 15, marginTop: 10, marginBottom: 5 },
  challengesSection: { backgroundColor: '#E8F5E8', paddingVertical: 10 },
  challengesScroll: { paddingHorizontal: 10, gap: 10 },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
    elevation: 2,
    gap: 10
  },
  challengeCompleted: { backgroundColor: '#2E7D4A' },
  challengeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  challengePoints: { fontSize: 12, color: '#2E7D4A', fontWeight: '600' },
  challengeCompletedText: { color: 'white' },
  completeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2E7D4A',
    alignItems: 'center',
    justifyContent: 'center'
  },
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
  achievementsMemory: {
    backgroundColor: '#FFFDE7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  achievementsMemoryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 8,
  },
  roadmapCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D4A',
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  roadmapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  roadmapFocus: {
    fontSize: 12,
    color: '#2E7D4A',
    fontWeight: '600',
  },
  roadmapTasks: {
    gap: 10,
  },
  roadmapTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  roadmapTaskText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  roadmapTaskCompleted: {
    color: '#AAA',
    textDecorationLine: 'line-through',
  },
  achievementMemoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  achievementMemoryText: {
    fontSize: 13,
    color: '#5D4037',
  },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' },
  emptySmallText: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    borderTopWidth: 4,
    borderTopColor: '#673AB7',
  },
  profileSections: {
    gap: 15,
  },
  profileSection: {
    gap: 8,
  },
  profileSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  profileTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileTagText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  startersContainer: {
    padding: 15,
    backgroundColor: '#F0F7F0',
    borderRadius: 16,
    marginBottom: 15,
  },
  startersTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D4A',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  startersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  starterButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  starterText: {
    fontSize: 13,
    color: '#444',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  }
});
