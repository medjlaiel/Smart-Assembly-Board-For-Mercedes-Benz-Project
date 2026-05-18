/**
 * BottomTabNavigator.js
 * Bottom tab bar with animated tab bar - header is in AppNavigator
 */
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import QRLibraryScreen from '../screens/QRLibraryScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import SettingsStackNavigator from './SettingsStackNavigator';
import AnimatedTabBar from '../components/AnimatedTabBar';
import { useApp } from '../contexts/AppContext';

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  assistantIcon: {
    width: 32,
    height: 32,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
  },
});

export default function BottomTabNavigator() {
  const { theme, t } = useApp();

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="QRLibrary"
        component={QRLibraryScreen}
        options={{
          tabBarLabel: t('qrCodes'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'qr-code' : 'qr-code-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarLabel: t('assistant'),
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/ai-assistant.png')}
              style={[
                styles.assistantIcon,
                focused && { borderColor: theme.primary, borderWidth: 2, opacity: 1 },
                !focused && { opacity: 0.6 },
              ]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: t('settings'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}