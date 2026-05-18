/**
 * AppNavigator.js
 * Defines the full screen navigation stack using React Navigation.
 * Home screen has a custom header with burger menu, notification bell, and stats icon.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import DrawerMenu from '../components/DrawerMenu';
import NotificationCenter from '../components/NotificationCenter';
import { loadTrackingRecords } from '../services/trackingService';
import { getValidZoneKeys } from '../data/zones';
import { COLORS } from '../assets/theme';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AdminDashboard from '../screens/AdminDashboard';
import StatisticsScreen from '../screens/StatisticsScreen';
import SaveScanBaubrettScreen from '../screens/SaveScanBaubrettScreen';
import SaveScanZoneScreen from '../screens/SaveScanZoneScreen';
import SaveConfirmScreen from '../screens/SaveConfirmScreen';
import ConsultScanScreen from '../screens/ConsultScanScreen';
import ConsultResultScreen from '../screens/ConsultResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SearchScreen from '../screens/SearchScreen';
import HowToUseScreen from '../screens/HowToUseScreen';
import TechChangesScreen from '../screens/TechChangesScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import BaubrettListScreen from '../screens/BaubrettListScreen';
import DatabaseScreen from '../screens/DatabaseScreen';
import DatabasePickerScreen from '../screens/DatabasePickerScreen';
import UploadDocumentsScreen from '../screens/UploadDocumentsScreen';
import ZoneContentsScreen from '../screens/ZoneContentsScreen';
import MeasurementProtocolsScreen from '../screens/MeasurementProtocolsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ZoneResultsScreen from '../screens/ZoneResultsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ZonesListScreen from '../screens/ZonesListScreen';
import AddUserScreen from '../screens/AddUserScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: COLORS.background },
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 300 } },
    close: { animation: 'timing', config: { duration: 200 } },
  },
};

// ── Home Wrapper Component ─────────────────────────────────────────
function HomeScreenWrapper({ navigation }) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  // Load badge count
  const loadBadge = useCallback(async () => {
    try {
      const data = await loadTrackingRecords();
      const ufbKeys = getValidZoneKeys().filter((key) => key.startsWith('UFB'));
      const ufbStats = {};
      ufbKeys.forEach((key) => { ufbStats[key] = 0; });
      data.forEach((record) => {
        const zone = String(record.Zone).trim();
        if (ufbKeys.includes(zone)) ufbStats[zone] = (ufbStats[zone] || 0) + 1;
      });
      const incomplete = ufbKeys.filter((key) => (ufbStats[key] || 0) < 8).length;
      setBadgeCount(incomplete);
    } catch (err) {}
  }, []);

  useEffect(() => {
    loadBadge();
    const interval = setInterval(loadBadge, 30000);
    return () => clearInterval(interval);
  }, [loadBadge]);

  // Set up header buttons dynamically
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => setShowDrawer(true)} style={headerStyles.headerBtn}>
          <Icon name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={headerStyles.rightContainer}>
          <TouchableOpacity onPress={() => setShowNotifications(true)} style={headerStyles.headerBtn}>
            <Icon name="notifications" size={24} color="#FFFFFF" />
            {badgeCount > 0 && (
              <View style={headerStyles.badge}>
                <Text style={headerStyles.badgeText}>{badgeCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Statistics')} style={headerStyles.headerBtn}>
            <Icon name="bar-chart" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, badgeCount]);

  return (
    <View style={{ flex: 1 }}>
      <BottomTabNavigator />
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} navigation={navigation} />
      <NotificationCenter visible={showNotifications} onClose={() => setShowNotifications(false)} badgeCount={badgeCount} />
    </View>
  );
}

// ── Stack Navigator ────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Forgot Password' }}
      />
      <Stack.Screen
        name="ZoneResults"
        component={ZoneResultsScreen}
        options={{ title: 'Zone Results' }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{
          title: 'Baubrett Tracker',
          headerTitleStyle: { fontWeight: '800', fontSize: 18, color: '#FFFFFF' },
        }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: 'Statistics' }}
      />
      <Stack.Screen
        name="SaveScanBaubrett"
        component={SaveScanBaubrettScreen}
        options={{ title: 'Scan Baubrett', cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }}
      />
      <Stack.Screen
        name="SaveScanZone"
        component={SaveScanZoneScreen}
        options={{ title: 'Scan Zone', cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }}
      />
      <Stack.Screen
        name="SaveConfirm"
        component={SaveConfirmScreen}
        options={{ title: 'Confirm & Save', cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }}
      />
      <Stack.Screen
        name="ConsultScan"
        component={ConsultScanScreen}
        options={{ title: 'Scan Baubrett', cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS }}
      />
      <Stack.Screen
        name="ConsultResult"
        component={ConsultResultScreen}
        options={{ title: 'Baubrett Details' }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search Database' }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Location History' }}
      />
      <Stack.Screen
        name="HowToUse"
        component={HowToUseScreen}
        options={{ title: 'How to Use' }}
      />
      <Stack.Screen
        name="TechChanges"
        component={TechChangesScreen}
        options={{ title: 'Technical Changes' }}
      />
      <Stack.Screen
        name="BaubrettList"
        component={BaubrettListScreen}
        options={{ title: 'All Baubretts' }}
      />
      <Stack.Screen
        name="DatabasePicker"
        component={DatabasePickerScreen}
        options={{ title: 'Database' }}
      />
      <Stack.Screen
        name="Database"
        component={DatabaseScreen}
        options={{ title: 'MyDataBase' }}
      />
      <Stack.Screen
        name="UploadXlsx"
        component={UploadDocumentsScreen}
        options={{ title: 'Upload Documents' }}
      />
      <Stack.Screen
        name="ZonesList"
        component={ZonesListScreen}
        options={{ title: 'Zones' }}
      />
      <Stack.Screen
        name="ZoneContents"
        component={ZoneContentsScreen}
        options={{ title: 'Zone Contents' }}
      />
      <Stack.Screen
        name="MeasurementProtocols"
        component={MeasurementProtocolsScreen}
        options={{ title: 'Measurement Protocols' }}
      />
      <Stack.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ title: 'Assistant' }}
      />
      <Stack.Screen
        name="AddUserScreen"
        component={AddUserScreen}
        options={{ title: 'Add User Account' }}
      />
    </Stack.Navigator>
  );
}

// ── Header Styles ──────────────────────────────────────────────────
const headerStyles = StyleSheet.create({
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  headerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

const styles = {};