/**
 * BottomTabNavigator.js
 * Bottom tab bar with a Home tab using Ionicons from @expo/vector-icons.
 */
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import QRLibraryScreen from '../screens/QRLibraryScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import { COLORS } from '../assets/theme';

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text3,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
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
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="QRLibrary"
        component={QRLibraryScreen}
        options={{
          tabBarLabel: 'QR Codes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarLabel: 'Assistant',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/ai-assistant.png')}
              style={[
                styles.assistantIcon,
                focused && { borderColor: COLORS.primary, borderWidth: 2 },
              ]}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
