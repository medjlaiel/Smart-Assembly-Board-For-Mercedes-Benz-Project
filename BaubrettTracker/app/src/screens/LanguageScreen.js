/**
 * LanguageScreen.js — Language selection screen
 * Displays three selectable language rows with flags and checkmark.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

export default function LanguageScreen() {
  const { language, setLanguage, theme, t, languages } = useApp();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {languages.map((lang) => {
          const active = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.row,
                { backgroundColor: theme.card, borderColor: theme.border },
                active && { borderColor: theme.primary, borderWidth: 2 },
              ]}
              onPress={() => setLanguage(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={[styles.name, { color: theme.text }]}>{lang.name}</Text>
              {active && (
                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  flag: { fontSize: 28, marginRight: 16 },
  name: { flex: 1, fontSize: 17, fontWeight: '600' },
});