/**
 * AppNavigator.js
 * Defines the full screen navigation stack using React Navigation.
 */
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../assets/theme';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SaveScanBaubrettScreen from '../screens/SaveScanBaubrettScreen';
import SaveScanZoneScreen from '../screens/SaveScanZoneScreen';
import SaveConfirmScreen from '../screens/SaveConfirmScreen';
import ConsultScanScreen from '../screens/ConsultScanScreen';
import ConsultResultScreen from '../screens/ConsultResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createStackNavigator();

// Shared header style across the whole app
const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: COLORS.background },
};

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerShown: false }}
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
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: 'Statistics' }}
      />
      <Stack.Screen
        name="SaveScanBaubrett"
        component={SaveScanBaubrettScreen}
        options={{ title: 'Scan Baubrett' }}
      />
      <Stack.Screen
        name="SaveScanZone"
        component={SaveScanZoneScreen}
        options={{ title: 'Scan Zone' }}
      />
      <Stack.Screen
        name="SaveConfirm"
        component={SaveConfirmScreen}
        options={{ title: 'Confirm & Save' }}
      />
      <Stack.Screen
        name="ConsultScan"
        component={ConsultScanScreen}
        options={{ title: 'Scan Baubrett' }}
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
