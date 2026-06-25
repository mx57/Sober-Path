
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { JournalService, JournalEntry } from '../../services/journalService';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mood, setMood] = useState(3);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const result = await JournalService.getEntries();
    if (result.success) {
      setEntries(result.data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!inputText.trim()) return;
    setIsSaving(true);
    const result = await JournalService.addEntry(inputText, mood);
    if (result.success) {
      setEntries([result.data, ...entries]);
      setInputText('');
      setMood(3);
      Alert.alert('Запись сохранена', 'Ваш AI-коуч проанализировал запись.');
    }
    setIsSaving(false);
  };

  const deleteEntry = async (id: string) => {
    Alert.alert(
      'Удалить запись?',
      'Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            const result = await JournalService.deleteEntry(id);
            if (result.success) {
              setEntries(entries.filter(e => e.id !== id));
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2E7D4A', '#4CAF50']} style={styles.header}>
        <MaterialIcons name="edit-note" size={32} color="white" />
        <Text style={styles.title}>Умный дневник</Text>
      </LinearGradient>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Как прошел ваш день?</Text>
          <View style={styles.moodSelector}>
            {[1, 2, 3, 4, 5].map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setMood(m)}
                style={[styles.moodBtn, mood === m && styles.moodBtnSelected]}
              >
                <Text style={styles.moodEmoji}>
                  {m === 1 ? '😢' : m === 2 ? '😕' : m === 3 ? '😐' : m === 4 ? '😊' : '😄'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Опишите свои чувства, события или мысли..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.saveBtn, !inputText.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!inputText.trim() || isSaving}
          >
            {isSaving ? <ActivityIndicator color="white" /> : (
              <>
                <MaterialIcons name="check" size={20} color="white" />
                <Text style={styles.saveBtnText}>Сохранить и проанализировать</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Ваши записи ({entries.length})</Text>

        {loading ? (
          <ActivityIndicator color="#2E7D4A" style={{ marginTop: 20 }} />
        ) : entries.map((entry, index) => (
          <Animated.View
            key={entry.id}
            entering={FadeInDown.delay(index * 100)}
            style={styles.entryCard}
          >
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>
                {new Date(entry.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </Text>
              <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                <MaterialIcons name="delete-outline" size={20} color="#999" />
              </TouchableOpacity>
            </View>
            <Text style={styles.entryContent}>{entry.content}</Text>

            {entry.aiAnalysis && (
              <View style={styles.analysisBox}>
                <View style={styles.analysisHeader}>
                  <MaterialIcons name="psychology" size={18} color="#2E7D4A" />
                  <Text style={styles.analysisTitle}>AI Анализ</Text>
                </View>
                <View style={styles.tagsRow}>
                  {entry.aiAnalysis.dominantEmotions.map(e => (
                    <View key={e} style={styles.emotionTag}>
                      <Text style={styles.tagText}>{e}</Text>
                    </View>
                  ))}
                  {entry.aiAnalysis.potentialTriggers.map(t => (
                    <View key={t} style={[styles.emotionTag, { backgroundColor: '#FFE5E5' }]}>
                      <Text style={[styles.tagText, { color: '#FF6B6B' }]}>⚡ {t}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.analysisAdvice}>{entry.aiAnalysis.advice}</Text>
              </View>
            )}
          </Animated.View>
        ))}
      </ScrollView>
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
  content: { flex: 1, padding: 15 },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  moodSelector: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  moodBtn: { padding: 10, borderRadius: 12, backgroundColor: '#F0F0F0' },
  moodBtnSelected: { backgroundColor: '#E8F5E8', borderWidth: 1, borderColor: '#2E7D4A' },
  moodEmoji: { fontSize: 24 },
  textInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 15
  },
  saveBtn: {
    backgroundColor: '#2E7D4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8
  },
  saveBtnDisabled: { backgroundColor: '#999' },
  saveBtnText: { color: 'white', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 15 },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  entryDate: { fontSize: 12, color: '#999' },
  entryContent: { fontSize: 16, color: '#333', lineHeight: 22, marginBottom: 12 },
  analysisBox: {
    backgroundColor: '#F1F8F1',
    borderRadius: 12,
    padding: 12,
    marginTop: 5,
  },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 5 },
  analysisTitle: { fontSize: 12, fontWeight: 'bold', color: '#2E7D4A', textTransform: 'uppercase' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  emotionTag: { backgroundColor: '#E8F5E8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, color: '#2E7D4A', fontWeight: '600' },
  analysisAdvice: { fontSize: 13, color: '#444', fontStyle: 'italic', lineHeight: 18 }
});
