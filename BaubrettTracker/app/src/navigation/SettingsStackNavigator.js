/**
 * SettingsStackNavigator.js
 * Stack navigator for the Settings tab containing profile, language, about, and profile screens.
 */
import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { COLORS } from '../assets/theme';

import SettingsScreen from '../screens/SettingsScreen';
import ProfileOptionsScreen from '../screens/ProfileOptionsScreen';
import MyInformationScreen from '../screens/MyInformationScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import LanguageScreen from '../screens/LanguageScreen';
import AboutScreen from '../screens/AboutScreen';

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

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="SettingsMain" screenOptions={screenOptions}>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="ProfileOptions"
        component={ProfileOptionsScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="MyInformation"
        component={MyInformationScreen}
        options={{ title: 'My Information' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ title: 'Language' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About' }}
      />
    </Stack.Navigator>
  );
}