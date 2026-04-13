/**
 * HowToUseScreen.js
 * Step-by-step guide for new workers on how to use the app
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOW, FONT_SIZES } from '../assets/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function HowToUseScreen({ navigation }) {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      icon: 'login',
      title: t('drawer.step1Title', 'Log in'),
      description: t('drawer.step1', 'Log in with your company credentials'),
    },
    {
      number: 2,
      icon: 'save-alt',
      title: t('drawer.step2Title', 'Save Scan'),
      description: t('drawer.step2', 'Tap "Save Scan" to scan and register a Baubrett at a zone'),
    },
    {
      number: 3,
      icon: 'search',
      title: t('drawer.step3Title', 'Consult'),
      description: t('drawer.step3', 'Tap "Consult" to look up a Baubrett\'s current location'),
    },
    {
      number: 4,
      icon: 'history',
      title: t('drawer.step4Title', 'History'),
      description: t('drawer.step4', 'Use "History" to view past tracking records'),
    },
    {
      number: 5,
      icon: 'find-in-page',
      title: t('drawer.step5Title', 'Search'),
      description: t('drawer.step5', 'Use "Search" to find a specific Baubrett by number'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoIcon}>
              <Icon name="help-outline" size={32} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.appName}>How to Use</Text>
              <Text style={styles.appSubtitle}>A guide for new workers</Text>
            </View>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step.number} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{step.number}</Text>
                </View>
                <View style={styles.stepIconContainer}>
                  <Icon name={step.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
              <View style={styles.stepDescriptionContainer}>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
              {index < steps.length - 1 && <View style={styles.connector} />}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need more help? Contact the Digital Tools Team
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOW.medium,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  stepsContainer: {
    padding: 20,
  },
  stepCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 20,
    marginBottom: 16,
    ...SHADOW.small,
    position: 'relative',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  stepIconContainer: {
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  stepDescriptionContainer: {
    marginLeft: 44,
  },
  stepDescription: {
    fontSize: 15,
    color: COLORS.text2,
    lineHeight: 22,
  },
  connector: {
    position: 'absolute',
    left: 31,
    bottom: -16,
    width: 2,
    height: 16,
    backgroundColor: COLORS.border,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '60',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.text3,
    textAlign: 'center',
    lineHeight: 18,
  },
});