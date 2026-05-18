/**
 * AppContext.js — Global theme/settings context
 * Manages dark mode, language, computed theme, and translation function.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMARY = '#20B2AA';

const lightTheme = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  subtext: '#5A5A5A',
  border: '#E0E0E0',
  tabBar: '#FFFFFF',
  tabBarActive: PRIMARY,
  inputBg: '#F0F0F0',
  inputText: '#1A1A1A',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.5)',
  primary: PRIMARY,
};

const darkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#F0F0F0',
  subtext: '#AAAAAA',
  border: '#333333',
  tabBar: '#1E1E1E',
  tabBarActive: PRIMARY,
  inputBg: '#2A2A2A',
  inputText: '#F0F0F0',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.7)',
  primary: PRIMARY,
};

const translations = {
  en: {
    home: 'Home',
    qrCodes: 'QR Codes',
    assistant: 'Assistant',
    settings: 'Settings',
    profile: 'Profile',
    myInformation: 'My Information',
    changePassword: 'Change Password',
    language: 'Language',
    darkMode: 'Dark Mode',
    about: 'About',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    name: 'Name',
    employeeId: 'Employee ID',
    role: 'Role',
    operator: 'Operator',
    admin: 'Admin (PNAV)',
    appName: 'Baubrett Tracker',
    version: 'Version',
    description: 'Smart assembly board tracking system for Mercedes-Benz production lines.',
    developer: 'Developer',
    university: 'University',
    internshipYear: 'Internship Year',
    company: 'Company',
    selectLanguage: 'Select Language',
    profileSaved: 'Profile saved successfully',
    saveProfile: 'Save Profile',
    editProfile: 'Edit Profile',
    updatePassword: 'Update Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    passwordChanged: 'Password changed successfully',
    passwordMatch: 'Passwords match',
    passwordNoMatch: 'Passwords do not match',
    welcome: 'Welcome',
    logout: 'Logout',
  },
  fr: {
    home: 'Accueil',
    qrCodes: 'QR Codes',
    assistant: 'Assistant',
    settings: 'Paramètres',
    profile: 'Profil',
    myInformation: 'Mes Informations',
    changePassword: 'Changer le mot de passe',
    language: 'Langue',
    darkMode: 'Mode sombre',
    about: 'À propos',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    name: 'Nom',
    employeeId: 'ID Employé',
    role: 'Rôle',
    operator: 'Opérateur',
    admin: 'Admin (PNAV)',
    appName: 'Baubrett Tracker',
    version: 'Version',
    description: 'Système de suivi des panneaux d\'assemblage intelligent pour les chaînes de production Mercedes-Benz.',
    developer: 'Développeur',
    university: 'Université',
    internshipYear: 'Année de stage',
    company: 'Entreprise',
    selectLanguage: 'Choisir la langue',
    profileSaved: 'Profil enregistré avec succès',
    saveProfile: 'Enregistrer le profil',
    editProfile: 'Modifier le profil',
    updatePassword: 'Mettre à jour le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    passwordChanged: 'Mot de passe modifié avec succès',
    passwordMatch: 'Les mots de passe correspondent',
    passwordNoMatch: 'Les mots de passe ne correspondent pas',
    welcome: 'Bienvenue',
    logout: 'Déconnexion',
  },
  de: {
    home: 'Startseite',
    qrCodes: 'QR-Codes',
    assistant: 'Assistent',
    settings: 'Einstellungen',
    profile: 'Profil',
    myInformation: 'Meine Informationen',
    changePassword: 'Passwort ändern',
    language: 'Sprache',
    darkMode: 'Dunkelmodus',
    about: 'Über',
    save: 'Speichern',
    cancel: 'Abbrechen',
    edit: 'Bearbeiten',
    name: 'Name',
    employeeId: 'Mitarbeiter-ID',
    role: 'Rolle',
    operator: 'Bediener',
    admin: 'Admin (PNAV)',
    appName: 'Baubrett Tracker',
    version: 'Version',
    description: 'Intelligentes Baubrett-Tracking-System für Mercedes-Benz Produktionslinien.',
    developer: 'Entwickler',
    university: 'Universität',
    internshipYear: 'Praktikumsjahr',
    company: 'Unternehmen',
    selectLanguage: 'Sprache auswählen',
    profileSaved: 'Profil erfolgreich gespeichert',
    saveProfile: 'Profil speichern',
    editProfile: 'Profil bearbeiten',
    updatePassword: 'Passwort aktualisieren',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Passwort bestätigen',
    passwordChanged: 'Passwort erfolgreich geändert',
    passwordMatch: 'Passwörter stimmen überein',
    passwordNoMatch: 'Passwörter stimmen nicht überein',
    welcome: 'Willkommen',
    logout: 'Abmelden',
  },
};

const AppContext = createContext(null);

export function AppContextProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguageState] = useState('en');
  const [loaded, setLoaded] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [darkVal, langVal] = await Promise.all([
          AsyncStorage.getItem('dark_mode'),
          AsyncStorage.getItem('app_language'),
        ]);
        if (darkVal === 'true') setIsDarkMode(true);
        if (langVal) setLanguageState(langVal);
      } catch (err) {
        console.error('Error loading AppContext:', err);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  const toggleDarkMode = useCallback(async (value) => {
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem('dark_mode', value ? 'true' : 'false');
    } catch (err) {
      console.error('Error saving dark mode:', err);
    }
  }, []);

  const setLanguage = useCallback(async (lang) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('app_language', lang);
    } catch (err) {
      console.error('Error saving language:', err);
    }
  }, []);

  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  const t = useCallback((key) => {
    const langTranslations = translations[language] || translations.en;
    return langTranslations[key] || translations.en[key] || key;
  }, [language]);

  const value = useMemo(() => ({
    isDarkMode,
    toggleDarkMode,
    language,
    setLanguage,
    theme,
    t,
    loaded,
    languages: [
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    ],
  }), [isDarkMode, language, theme, t, toggleDarkMode, setLanguage, loaded]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppContextProvider');
  }
  return ctx;
}

export default AppContext;