/**
 * LanguageContext.js - React Context for managing app language
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app_language');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
      await AsyncStorage.setItem('app_language', lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    languages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    ],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
