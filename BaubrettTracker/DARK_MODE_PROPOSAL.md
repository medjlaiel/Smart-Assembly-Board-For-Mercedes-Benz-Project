# Proposition : Mode Sombre & Thème Personnalisable

## 🎯 Objectif
Permettre aux utilisateurs de choisir entre un thème clair et un thème sombre, avec possibilité de suivre les préférences système ou de forcer un mode manuel.

---

## 📋 Spécifications

### 1. **Architecture de Thème**

```
src/
├── assets/
│   ├── theme.js          (existant - thème clair)
│   └── themes/
│       ├── light.js      (thème clair actuel)
│       ├── dark.js       (nouveau - thème sombre)
│       └── index.js      (sélecteur de thème unifié)
```

### 2. **Nouveau Fichier : `theme.dark.js`**

Couleurs suggérées pour le mode sombre :

```javascript
export const COLORS = {
  primary: '#0A5FBF',        // Bleu Mercedes (inchangé)
  primaryDark: '#083A7D',    // Version plus foncée pour hover
  background: '#121212',     // Noir très foncé (Material Dark)
  surface: '#1E1E1E',        // Cartes, modales
  text: '#FFFFFF',           // Texte principal
  text2: '#B0B0B0',          // Texte secondaire
  text3: '#666666',          // Texte désactivé
  border: '#333333',         // Bordures
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  overlay: 'rgba(0,0,0,0.7)',
  shadow: '#000000',
};
```

### 3. **Nouveau Fichier : `ThemeContext.js`**

Context React pour gérer le thème global :

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_PREF_KEY = 'baubrett_theme_preference';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeMode, setThemeMode] = useState('system'); // 'system' | 'light' | 'dark'
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  // Charger la préférence sauvegardée
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_PREF_KEY);
        if (saved) {
          setThemeMode(saved);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  // Appliquer le thème selon le mode
  useEffect(() => {
    let theme;
    if (themeMode === 'system') {
      theme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
    } else if (themeMode === 'dark') {
      theme = darkTheme;
    } else {
      theme = lightTheme;
    }
    setCurrentTheme(theme);
  }, [themeMode, systemColorScheme]);

  const setThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_PREF_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme: currentTheme,
      themeMode,
      setThemePreference,
      isDark: themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark'),
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

### 4. **Modification d'App.js**

Ajouter le `ThemeProvider` :

```javascript
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>  {/* ← NOUVEAU */}
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#0A5FBF" />
              <AppNavigator />
            </NavigationContainer>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
```

### 5. **Sélecteur de Thème dans SettingsScreen**

Créer un nouvel écran `SettingsScreen` (ou ajouter dans HomeScreen header) :

**Option A - Bouton dans Header** (comme les statistiques) :
- Icône 🎨 ou ⚙️ dans le header à droite
- Navigation vers SettingsScreen

**Option B - Modal depuis HomeScreen** :
- Long press sur le logo ou bouton "Settings"

**Contenu du SettingsScreen** :

```javascript
export default function SettingsScreen({ navigation }) {
  const { themeMode, setThemePreference, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => setThemePreference('light')}
        >
          <Icon name="sunny" color={themeMode === 'light' ? COLORS.primary : COLORS.text2} />
          <Text style={styles.optionText}>{t('settings.lightMode')}</Text>
          {themeMode === 'light' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => setThemePreference('dark')}
        >
          <Icon name="moon" color={themeMode === 'dark' ? COLORS.primary : COLORS.text2} />
          <Text style={styles.optionText}>{t('settings.darkMode')}</Text>
          {themeMode === 'dark' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => setThemePreference('system')}
        >
          <Icon name="phone-portrait" color={themeMode === 'system' ? COLORS.primary : COLORS.text2} />
          <Text style={styles.optionText}>{t('settings.systemDefault')}</Text>
          {themeMode === 'system' && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
      </View>

      {/* Aperçu en direct */}
      <View style={[styles.preview, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
        <Text style={{ color: isDark ? '#FFF' : '#000' }}>
          {isDark ? 'Mode Sombre Actif' : 'Mode Clair Actif'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

### 6. **Traductions à Ajouter**

```json
{
  "settings": {
    "title": "Settings",
    "appearance": "Appearance",
    "lightMode": "Light Mode",
    "darkMode": "Dark Mode",
    "systemDefault": "System Default"
  }
}
```

### 7. **Migration des Composants Existants**

Remplacer tous les imports de `COLORS` par l'utilisation du contexte :

**Avant** :
```javascript
import { COLORS } from '../assets/theme';
// usage: backgroundColor: COLORS.background
```

**Après** :
```javascript
import { useTheme } from '../contexts/ThemeContext';
// dans le composant:
const { theme } = useTheme();
// usage: backgroundColor: theme.background
```

**Alternative** (recommandé) : Créer un `ThemeProvider` qui injecte les couleurs automatiquement via un HOC ou en modifiant les imports existants.

### 8. **Adaptation Automatique des Composants**

Utiliser `useTheme` dans tous les composants :

```javascript
// Exemple avec un composant existant
export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useTheme(); // ← NOUVEAU

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* ... */}
      <View style={[styles.hero, { backgroundColor: theme.primary }, SHADOW.medium]}>
        <Text style={[styles.heroTitle, { color: theme.white }]}>...</Text>
      </View>
    </SafeAreaView>
  );
}
```

### 9. **Icônes Nécessaires**

Installer `@expo/vector-icons` (déjà présent) et utiliser :
- `Ionicons` : `sunny`, `moon`, `phone-portrait`
- Ou `MaterialIcons` : `light-mode`, `dark-mode`, `devices`

### 10. **StatusBar Adaptatif**

```javascript
import { useTheme } from '../contexts/ThemeContext';

export default function App() {
  const { isDark } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={isDark ? '#121212' : '#0A5FBF'}
      />
      <AppNavigator />
    </NavigationContainer>
  );
}
```

---

## 🎨 **Design Mode Sombre**

### Palette de couleurs recommandée :

| Élément | Clair (actuel) | Sombre (proposé) |
|---------|----------------|------------------|
| Background | `#F5F7FA` | `#121212` |
| Surface | `#FFFFFF` | `#1E1E1E` |
| Texte principal | `#212121` | `#FFFFFF` |
| Texte secondaire | `#666666` | `#B0B0B0` |
| Bordure | `#E0E0E0` | `#333333` |
| Primary | `#0A5FBF` | `#0A5FBF` (inchangé) |

### Contrast Ratio :
- Texte sur fond sombre : minimum 4.5:1 (WCAG AA)
- Utiliser `rgba(255,255,255,0.87)` pour le texte principal
- Utiliser `rgba(255,255,255,0.6)` pour le texte secondaire

---

## 📱 **Wireframes**

### SettingsScreen - Mode Clair
```
┌─────────────────────────┐
│ ⚙️ Settings             │
├─────────────────────────┤
│ 🎨 Appearance          │
│                         │
│ ○ Light Mode           │
│   ☀️ Light Mode        │
│                         │
│ ● Dark Mode            │
│   🌙 Dark Mode         │
│                         │
│ ○ System Default       │
│   📱 System Default    │
│                         │
│ ─────────────────────  │
│                         │
│ Preview:               │
│ ┌───────────────────┐  │
│ │ Light Mode Active │  │
│ └───────────────────┘  │
└─────────────────────────┘
```

### SettingsScreen - Mode Sombre
```
┌─────────────────────────┐
│ ⚙️ Settings             │
├─────────────────────────┤
│ 🎨 Appearance          │
│                         │
│ ● Light Mode           │
│   ☀️ Light Mode        │
│                         │
│ ○ Dark Mode            │
│   🌙 Dark Mode         │
│                         │
│ ○ System Default       │
│   📱 System Default    │
│                         │
│ ─────────────────────  │
│                         │
│ Preview:               │
│ ┌───────────────────┐  │
│ │ Dark Mode Active  │  │
│ └───────────────────┘  │
└─────────────────────────┘
```

---

## 🔄 **Workflow de Navigation**

```
HomeScreen
    │
    ├─→ Header Button (🎨 ou ⚙️)
    │   └─→ SettingsScreen
    │       ├─→ Light Mode → Applique thème clair
    │       ├─→ Dark Mode → Applique thème sombre
    │       └─→ System Default → Suit système
    │
    └─→ (Persistance) → Sauvegarde dans AsyncStorage
```

---

## ✅ **Checklist d'Implémentation**

- [ ] Créer `src/assets/themes/light.js` (extraire de theme.js)
- [ ] Créer `src/assets/themes/dark.js` (nouvelles couleurs)
- [ ] Créer `src/assets/themes/index.js` (export unifié)
- [ ] Créer `src/contexts/ThemeContext.js`
- [ ] Ajouter `ThemeProvider` dans App.js
- [ ] Créer `src/screens/SettingsScreen.js`
- [ ] Ajouter route "Settings" dans AppNavigator
- [ ] Ajouter bouton Settings dans HomeScreen header
- [ ] Modifier tous les composants pour utiliser `useTheme()`
- [ ] Adapter StatusBar (style dynamique)
- [ ] Ajouter traductions (EN, DE, FR, AR)
- [ ] Tester sur iOS/Android
- [ ] Vérifier contrastes WCAG
- [ ] Documenter dans WORKFLOW_SCHEMATIC.md

---

## 📊 **Impact sur le Code Existant**

**Fichiers à modifier** (estimation) :
- ~30 composants (screens + components) → utiliser `useTheme()`
- `theme.js` → déplacer vers `themes/light.js`
- `App.js` → ajouter ThemeProvider
- `AppNavigator.js` → ajouter route Settings
- `HomeScreen.js` → ajouter bouton header
- `locales/*.json` → ajouter clés settings

**Temps estimé** : 2-3 heures pour un développeur expérimenté

---

## 🚀 **Avantages**

1. **Confort visuel** : Réduit la fatigue oculaire en atelier
2. **Autonomie batterie** : Écrans OLED économisent de l'énergie
3. **Professionnalisme** : Application moderne avec personnalisation
4. **Accessibilité** : Respecte les normes WCAG
5. **Flexibilité** : Choix laissé à l'utilisateur

---

## 📝 **Notes Techniques**

- Utiliser `useColorScheme` de React Native pour détecter le mode système
- Sauvegarder la préférence dans AsyncStorage (comme la langue)
- Prévoir un fallback si AsyncStorage indisponible
- Tester sur iOS et Android (comportements peuvent différer)
- Les icônes vectorielles doivent être adaptées aux deux thèmes

---

**Prêt à implémenter ?** Je peux créer tous les fichiers nécessaires et adapter l'existant !