/**
 * ProfileOptionsScreen.js
 * Profile options: My Information, Change Password, Language, Dark Mode, About Application.
 * Uses AppContext for theme and translations.
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
import { useApp } from '../contexts/AppContext';

function ProfileRow({ icon, label, theme, onPress, rightContent }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: theme.primary + '18' }]}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {rightContent || <Ionicons name="chevron-forward" size={20} color={theme.subtext} />}
    </TouchableOpacity>
  );
}

function RowDivider() {
  return <View style={styles.divider} />;
}

function LanguagePickerModal({ visible, onClose }) {
  const { language, setLanguage, languages, theme } = useApp();
  const handleSelect = async (code) => {
    await setLanguage(code);
    onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]} />
      </TouchableWithoutFeedback>
      <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
        <Text style={[styles.modalTitle, { color: theme.text }]}>Select Language</Text>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const active = language === item.code;
            return (
              <TouchableOpacity
                style={[styles.langOption, { backgroundColor: theme.background }, active && { backgroundColor: theme.primary + '20' }]}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={styles.langFlag}>{item.flag}</Text>
                <Text style={[styles.langName, { color: theme.text }, active && { color: theme.primary, fontWeight: '600' }]}>{item.name}</Text>
                {active && <Ionicons name="checkmark" size={20} color={theme.primary} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

export default function ProfileOptionsScreen({ navigation }) {
  const { theme, t, isDarkMode, toggleDarkMode, language, languages } = useApp();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ProfileRow icon="information-circle-outline" label={t('myInformation')} theme={theme} onPress={() => navigation.navigate('MyInformation')} />
          <RowDivider />
          <ProfileRow icon="lock-closed-outline" label={t('changePassword')} theme={theme} onPress={() => navigation.navigate('ChangePassword')} />
        </View>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ProfileRow icon="language-outline" label={t('language')} theme={theme} onPress={() => setLangModalVisible(true)} rightContent={<View style={[styles.langBadge, { backgroundColor: theme.background }]}><Text style={[styles.langBadgeText, { color: theme.text }]}>{currentLang.flag} {currentLang.name}</Text></View>} />
          <RowDivider />
          <ProfileRow icon="moon-outline" label={t('darkMode')} theme={theme} onPress={() => toggleDarkMode(!isDarkMode)} rightContent={<Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#FFFFFF" />} />
        </View>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ProfileRow icon="information-circle-outline" label={t('about')} theme={theme} onPress={() => {}} rightContent={null} />
          <View style={styles.aboutContent}>
            <Text style={[styles.aboutText, { color: theme.subtext }]}>{t('appName')} v1.0.0</Text>
            <Text style={[styles.aboutText, { color: theme.subtext }]}>Built with React Native</Text>
            <Text style={[styles.aboutText, { color: theme.subtext }]}>For internal Mercedes-Benz use only</Text>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={14} color={theme.subtext} />
              <Text style={[styles.contactText, { color: theme.text }]}> support@baubrett-tracker.mercedes-benz.com</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <LanguagePickerModal visible={langModalVisible} onClose={() => setLangModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  divider: { height: 1, opacity: 0.5, marginHorizontal: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  label: { flex: 1, fontSize: 16, fontWeight: '600' },
  langBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  langBadgeText: { fontSize: 13, fontWeight: '500' },
  aboutContent: { paddingHorizontal: 16, paddingBottom: 16, paddingLeft: 70 },
  aboutText: { fontSize: 14, lineHeight: 20 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  contactText: { fontSize: 13 },
  modalOverlay: { flex: 1 },
  modalContent: { margin: 40, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  langOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  langFlag: { fontSize: 24, marginRight: 12 },
  langName: { fontSize: 16, flex: 1 },
});