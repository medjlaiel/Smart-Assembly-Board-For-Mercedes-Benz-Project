/**
 * AttachmentBottomSheet.js
 * A modal bottom sheet that slides up from the bottom with attachment options
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AttachmentBottomSheet({ visible, onClose }) {
  const { t } = useTranslation();

  const bottomSheetOptions = [
    {
      id: 'camera',
      icon: 'camera-alt',
      title: t('attachment.camera.title', 'Take Photo'),
      description: t('attachment.camera.description', 'Capture a new photo'),
      color: COLORS.primary,
    },
    {
      id: 'gallery',
      icon: 'photo-library',
      title: t('attachment.gallery.title', 'Choose from Gallery'),
      description: t('attachment.gallery.description', 'Select an existing photo'),
      color: COLORS.accent,
    },
    {
      id: 'file',
      icon: 'insert-drive-file',
      title: t('attachment.file.title', 'Upload File'),
      description: t('attachment.file.description', 'Select a document or image'),
      color: COLORS.success,
    },
    {
      id: 'link',
      icon: 'link',
      title: t('attachment.link.title', 'Add Link'),
      description: t('attachment.link.description', 'Insert a URL reference'),
      color: COLORS.warning,
    },
  ];

  const handleOptionPress = (optionId) => {
    // Handle each option press - can be extended with actual functionality
    console.log('Selected option:', optionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.bottomSheetContainer} onStartShouldSetResponder={() => true}>
          {/* Handle bar indicator */}
          <View style={styles.handleBar} />

          {/* Title */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Attachment</Text>
          </View>

          {/* Options */}
          <ScrollView 
            style={styles.optionsScrollView}
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {bottomSheetOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleOptionPress(option.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: option.color + '15' }]}>
                  <Icon name={option.icon} size={28} color={option.color} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={COLORS.text3} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '70%',
    ...SHADOW.large,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsContainer: {
    padding: 16,
  },
  optionCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOW.small,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.text2,
    lineHeight: 18,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});