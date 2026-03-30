/**
 * LanguageSelector.js - Component to select app language
 * Shows current language with flag, opens modal to change
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS, FONT_SIZES, RADIUS, SHADOW } from '../assets/theme';

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLang = languages.find((l) => l.code === currentLanguage) || languages[0];

  const handleSelect = async (langCode) => {
    await changeLanguage(langCode);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{currentLang.flag}</Text>
        <Text style={styles.languageName}>{currentLang.name}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Language</Text>
          <FlatList
            data={languages}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  currentLanguage === item.code && styles.languageOptionSelected,
                ]}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={styles.optionFlag}>{item.flag}</Text>
                <Text
                  style={[
                    styles.optionName,
                    currentLanguage === item.code && styles.optionNameSelected,
                  ]}
                >
                  {item.name}
                </Text>
                {currentLanguage === item.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...SHADOW.small,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageName: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: 40,
    borderRadius: RADIUS.lg,
    padding: 20,
    ...SHADOW.medium,
  },
  modalTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  languageOptionSelected: {
    backgroundColor: COLORS.primary + '20', // 20 = ~12% opacity
  },
  optionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  optionName: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    flex: 1,
  },
  optionNameSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
