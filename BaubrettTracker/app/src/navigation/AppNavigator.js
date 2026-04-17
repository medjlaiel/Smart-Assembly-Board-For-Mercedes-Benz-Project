/**
 * AppNavigator.js
 * Defines the full screen navigation stack using React Navigation.
 */
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { COLORS } from '../assets/theme';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AdminDashboard from '../screens/AdminDashboard';
import HomeScreen from '../screens/HomeScreen';
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

const Stack = createStackNavigator();

// Shared header style across the whole app
const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: COLORS.background },
  // Smooth fade transition for all screens
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 300 } },
    close: { animation: 'timing', config: { duration: 200 } },
  },
};

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
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Baubrett Tracker',
          headerLeft: null,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Statistics')}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonIcon}>📊</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ 
          title: 'Statistics',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="SaveScanBaubrett"
        component={SaveScanBaubrettScreen}
        options={{ 
          title: 'Scan Baubrett',
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Stack.Screen
        name="SaveScanZone"
        component={SaveScanZoneScreen}
        options={{ 
          title: 'Scan Zone',
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Stack.Screen
        name="SaveConfirm"
        component={SaveConfirmScreen}
        options={{ 
          title: 'Confirm & Save',
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Stack.Screen
        name="ConsultScan"
        component={ConsultScanScreen}
        options={{ 
          title: 'Scan Baubrett',
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Stack.Screen
        name="ConsultResult"
        component={ConsultResultScreen}
        options={{ 
          title: 'Baubrett Details',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ 
          title: 'Search Database',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ 
          title: 'Location History',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="HowToUse"
        component={HowToUseScreen}
        options={{ 
          title: 'How to Use',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="TechChanges"
        component={TechChangesScreen}
        options={{ 
          title: 'Technical Changes',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ 
          title: 'Change Password',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="BaubrettList"
        component={BaubrettListScreen}
        options={{ 
          title: 'All Baubretts',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="Database"
        component={DatabaseScreen}
        options={{ 
          title: 'Database',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = {
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButtonIcon: {
    fontSize: 24,
  },
};