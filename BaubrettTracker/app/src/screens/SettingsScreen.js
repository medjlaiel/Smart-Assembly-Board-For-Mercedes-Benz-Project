/**
 * SettingsScreen.js
 * Settings menu: Profile, Language, Dark Mode, About — all themed via AppContext.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

function MenuRow({ icon, label, theme, onPress, rightContent }) {
  return (
    <TouchableOpacity style={[styles.row, { borderBottomColor: theme.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: theme.primary + '18' }]}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {rightContent || <Ionicons name="chevron-forward" size={20} color={theme.subtext} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const { theme, t, isDarkMode, toggleDarkMode } = useApp();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MenuRow
            icon="person-outline"
            label={t('profile')}
            theme={theme}
            onPress={() => navigation.navigate('ProfileOptions')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <MenuRow
            icon="language-outline"
            label={t('language')}
            theme={theme}
            onPress={() => navigation.navigate('Language')}
            rightContent={
              <View style={styles.langBadge}>
                <Text style={[styles.langBadgeText, { color: theme.text }]}>🇬🇧 EN</Text>
              </View>
            }
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <MenuRow
            icon="moon-outline"
            label={t('darkMode')}
            theme={theme}
            onPress={() => toggleDarkMode(!isDarkMode)}
            rightContent={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <MenuRow
            icon="information-circle-outline"
            label={t('about')}
            theme={theme}
            onPress={() => navigation.navigate('About')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  divider: { height: 1, opacity: 0.5, marginHorizontal: 16 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  label: { flex: 1, fontSize: 16, fontWeight: '600' },
  langBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  langBadgeText: { fontSize: 13, fontWeight: '500' },
});