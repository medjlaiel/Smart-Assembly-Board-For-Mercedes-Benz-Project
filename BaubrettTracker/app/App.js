/**
 * App.js — Root entry point
 * Sets up navigation container and gesture handler.
 */
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/contexts/LanguageContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#0A5FBF" />
          <AppNavigator />
        </NavigationContainer>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
