/**
 * DrawerMenu.js
 * Left side drawer with accordion/expandable sections: Profile, About, Logout
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';
import AuthInput from './AuthInput';
import PasswordStrengthBar from './PasswordStrengthBar';
import { changePassword } from '../services/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 320;

export default function DrawerMenu({ visible, onClose, navigation }) {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const translateX = new Animated.Value(-DRAWER_WIDTH);

  // Expanded section state: 'profile' | 'about' | null (only one expanded at a time)
  const [expandedSection, setExpandedSection] = useState(null);

  // About sub-items expansion state
  const [expandedAboutItem, setExpandedAboutItem] = useState(null);

  // Change Password Modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Animate drawer in/out
  useEffect(() => {
    if (visible) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
      // Reset states when closing
      setExpandedSection(null);
      setExpandedAboutItem(null);
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    }
  }, [visible]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
    // Collapse about sub-items when collapsing profile
    if (section !== 'profile') {
      setExpandedAboutItem(null);
    }
  };

  const toggleAboutItem = (item) => {
    // If navigating to HowToUse, don't toggle, just navigate
    if (item === 'howto') {
      navigation.navigate('HowToUse');
      return;
    }
    setExpandedAboutItem(expandedAboutItem === item ? null : item);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    Alert.alert(
      t('drawer.logoutConfirmTitle', 'Logout'),
      t('drawer.logoutConfirmMessage', 'Are you sure you want to logout?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    // Validate
    if (!currentPassword) {
      setPasswordError(t('drawer.currentPasswordRequired', 'Current password is required'));
      return;
    }
    if (!newPassword) {
      setPasswordError(t('drawer.newPasswordRequired', 'New password is required'));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t('drawer.passwordMinLength', 'Password must be at least 8 characters'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('drawer.passwordsDoNotMatch', 'Passwords do not match'));
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword(currentUser.id, currentPassword, newPassword);
      if (result.success) {
        Alert.alert(t('common.success'), t('drawer.passwordChangedSuccess', 'Password changed successfully'), [
          { text: t('common.ok'), onPress: () => setShowChangePasswordModal(false) },
        ]);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.message || t('drawer.passwordChangeFailed', 'Failed to change password'));
      }
    } catch (error) {
      setPasswordError(t('drawer.passwordChangeError', 'An error occurred'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: visible ? 1 : 0,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.overlayTouchable}
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── PROFILE SECTION ───────────────────────────────────── */}
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('profile')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>Profile</Text>
                <Icon
                  name={expandedSection === 'profile' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color={COLORS.text3}
                />
              </TouchableOpacity>

              {expandedSection === 'profile' && (
                <View style={styles.sectionContent}>
                  <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>{getInitials(currentUser?.fullName)}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.userName}>{currentUser?.fullName || t('drawer.unknownUser', 'User')}</Text>
                      <Text style={styles.userEmail}>{currentUser?.email || ''}</Text>
                      <Text style={styles.userId}>ID: {currentUser?.id || ''}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.changePasswordBtn} onPress={() => setShowChangePasswordModal(true)}>
                    <Icon name="lock" size={18} color={COLORS.primary} />
                    <Text style={styles.changePasswordText}>{t('drawer.changePassword', 'Change Password')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── ABOUT SECTION ────────────────────────────────────── */}
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('about')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>About</Text>
                <Icon
                  name={expandedSection === 'about' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color={COLORS.text3}
                />
              </TouchableOpacity>

              {expandedSection === 'about' && (
                <View style={[styles.sectionContent, styles.aboutContent]}>
                  {/* App Version - expandable */}
                  <TouchableOpacity
                    style={styles.aboutItemHeader}
                    onPress={() => toggleAboutItem('version')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.aboutItemTitle}>App Version</Text>
                    <Icon
                      name={expandedAboutItem === 'version' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={20}
                      color={COLORS.text3}
                    />
                  </TouchableOpacity>
                  {expandedAboutItem === 'version' && (
                    <View style={styles.aboutItemContent}>
                      <Text style={styles.aboutText}>v1.0.0</Text>
                      <Text style={styles.aboutSubtext}>Built with React Native</Text>
                      <Text style={[styles.aboutSubtext, styles.disclaimer]}>For internal Mercedes-Benz use only</Text>
                    </View>
                  )}

                  {/* Contact - expandable */}
                  <TouchableOpacity
                    style={styles.aboutItemHeader}
                    onPress={() => toggleAboutItem('contact')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.aboutItemTitle}>Contact</Text>
                    <Icon
                      name={expandedAboutItem === 'contact' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={20}
                      color={COLORS.text3}
                    />
                  </TouchableOpacity>
                  {expandedAboutItem === 'contact' && (
                    <View style={styles.aboutItemContent}>
                      <Text style={styles.aboutText}>support@baubrett-tracker.mercedes-benz.com</Text>
                      <Text style={styles.aboutSubtext}>Mercedes-Benz Assembly — Digital Tools Team</Text>
                    </View>
                  )}

                  {/* How to Use - navigates to separate screen */}
                  <TouchableOpacity
                    style={styles.aboutItemHeader}
                    onPress={() => toggleAboutItem('howto')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.aboutItemTitle}>How to Use</Text>
                    <Icon
                      name="chevron-right"
                      size={20}
                      color={COLORS.text3}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── LOGOUT BUTTON ────────────────────────────────────── */}
            <View style={styles.logoutSection}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="logout" size={20} color={COLORS.error} />
                <Text style={styles.logoutText}>{t('auth.logout', 'Logout')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Change Password Modal */}
          {showChangePasswordModal && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('drawer.changePassword', 'Change Password')}</Text>
                  <TouchableOpacity onPress={() => setShowChangePasswordModal(false)}>
                    <Icon name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <AuthInput
                    label={t('drawer.currentPassword', 'Current Password')}
                    iconName="lock"
                    placeholder={t('drawer.enterCurrentPassword', 'Enter current password')}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    showSecureToggle
                    secureTextEntry
                  />

                  <AuthInput
                    label={t('drawer.newPassword', 'New Password')}
                    iconName="lock-outline"
                    placeholder={t('drawer.enterNewPassword', 'Enter new password')}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    showSecureToggle
                    secureTextEntry
                  />

                  <PasswordStrengthBar password={newPassword} />

                  <AuthInput
                    label={t('drawer.confirmPassword', 'Confirm New Password')}
                    iconName="check-circle-outline"
                    placeholder={t('drawer.confirmNewPassword', 'Confirm new password')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    showSecureToggle
                    secureTextEntry
                  />

                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.submitButton, isChangingPassword && styles.submitButtonDisabled]}
                    onPress={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    <Text style={styles.submitButtonText}>
                      {isChangingPassword ? t('common.loading') : t('drawer.savePassword', 'Save Password')}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
  keyboardAvoid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.surface,
    height: '100%',
    ...SHADOW.large,
  },
  // Section (accordion) styles
  sectionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionContent: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  aboutContent: {
    paddingBottom: 8,
  },
  // Profile section
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.text2,
    marginBottom: 2,
  },
  userId: {
    fontSize: 11,
    color: COLORS.text3,
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  changePasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // About section items
  aboutItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  aboutItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  aboutItemContent: {
    paddingBottom: 16,
    paddingLeft: 4,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.text2,
    marginBottom: 2,
  },
  aboutSubtext: {
    fontSize: 13,
    color: COLORS.text3,
    marginTop: 4,
    lineHeight: 18,
  },
  disclaimer: {
    color: COLORS.error,
    fontStyle: 'italic',
    marginTop: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
    width: 20,
  },
  stepText: {
    fontSize: 12,
    color: COLORS.text2,
    flex: 1,
    lineHeight: 18,
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.error + '40',
    borderRadius: RADIUS.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.small,
  },
  logoutText: {
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: 10,
  },

  // Change Password Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    ...SHADOW.large,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    ...SHADOW.medium,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.text3,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});