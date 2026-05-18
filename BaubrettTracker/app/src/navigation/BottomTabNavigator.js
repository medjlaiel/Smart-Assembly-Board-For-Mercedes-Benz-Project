/**
 * BottomTabNavigator.js
 * Bottom tab bar with theme support from AppContext.
 */
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import QRLibraryScreen from '../screens/QRLibraryScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import SettingsStackNavigator from './SettingsStackNavigator';
import { useApp } from '../contexts/AppContext';

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  assistantIcon: {
    width: 36,
    height: 36,
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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.subtext,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="QRLibrary"
        component={QRLibraryScreen}
        options={{
          tabBarLabel: t('qrCodes'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
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
                focused && { borderColor: theme.primary, borderWidth: 2 },
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}