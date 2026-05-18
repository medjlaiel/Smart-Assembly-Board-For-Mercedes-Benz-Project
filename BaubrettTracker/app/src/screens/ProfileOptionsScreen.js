/**
 * ProfileOptionsScreen.js
 * Profile options: My Information, Change Password, Language, Dark Mode, About Application.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import { useLanguage } from '../contexts/LanguageContext';

// ── Tappable Row ──────────────────────────────────────────────────
function ProfileRow({ icon, label, onPress, rightContent }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      {rightContent || <Ionicons name="chevron-forward" size={20} color={COLORS.text3} />}
    </TouchableOpacity>
  );
}

// ── Divider ────────────────────────────────────────────────────────
function RowDivider() {
  return <View style={styles.divider} />;
}

// ── Language Selector Modal ────────────────────────────────────────
function LanguagePickerModal({ visible, onClose }) {
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  const handleSelect = async (code) => {
    await changeLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Select Language</Text>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const active = currentLanguage === item.code;
            return (
              <TouchableOpacity
                style={[styles.langOption, active && styles.langOptionSelected]}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={styles.langFlag}>{item.flag}</Text>
                <Text style={[styles.langName, active && styles.langNameSelected]}>
                  {item.name}
                </Text>
                {active && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

// ── Main Screen ────────────────────────────────────────────────────
export default function ProfileOptionsScreen({ navigation }) {
  const { currentLanguage, languages } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const currentLang = languages.find((l) => l.code === currentLanguage) || languages[0];

  // Load dark mode preference on mount
  useEffect(() => {
    const load = async () => {
      try {
        const val = await AsyncStorage.getItem('dark_mode');
        if (val === 'true') setDarkMode(true);
      } catch (err) {
        console.error('Error loading dark mode:', err);
      }
    };
    load();
  }, []);

  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem('dark_mode', value ? 'true' : 'false');
    } catch (err) {
      console.error('Error saving dark mode:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── CARD 1: ACCOUNT ──────────────────────────────────── */}
        <View style={styles.card}>
          <ProfileRow
            icon="information-circle-outline"
            label="My Information"
            onPress={() => navigation.navigate('MyInformation')}
          />
          <RowDivider />
          <ProfileRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>

        {/* ── CARD 2: PREFERENCES ──────────────────────────────── */}
        <View style={styles.card}>
          <ProfileRow
            icon="language-outline"
            label="Language"
            onPress={() => setLangModalVisible(true)}
            rightContent={
              <View style={styles.langBadge}>
                <Text style={styles.langBadgeText}>{currentLang.flag} {currentLang.name}</Text>
              </View>
            }
          />
          <RowDivider />
          <ProfileRow
            icon="moon-outline"
            label="Dark Mode"
            onPress={() => toggleDarkMode(!darkMode)}
            rightContent={
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            }
          />
        </View>

        {/* ── CARD 3: ABOUT ────────────────────────────────────── */}
        <View style={styles.card}>
          <ProfileRow
            icon="information-circle-outline"
            label="About Application"
            onPress={() => {}}
            rightContent={null}
          />
          <View style={styles.aboutContent}>
            <Text style={styles.aboutText}>Baubrett Tracker v1.0.0</Text>
            <Text style={styles.aboutText}>Built with React Native</Text>
            <Text style={styles.aboutText}>For internal Mercedes-Benz use only</Text>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={14} color={COLORS.text3} />
              <Text style={styles.contactText}> support@baubrett-tracker.mercedes-benz.com</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Language Picker Modal */}
      <LanguagePickerModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginTop: 16,
    ...SHADOW.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border + '60',
    marginHorizontal: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  // Language badge
  langBadge: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  langBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  // About
  aboutContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 70, // align with label (iconBox width 40 + marginRight 14 + paddingHorizontal 16 = 70)
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.text2,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.text3,
  },
  // Language modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: 40,
    borderRadius: RADIUS.lg,
    padding: 20,
    ...SHADOW.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  langOptionSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  langFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  langName: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  langNameSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});