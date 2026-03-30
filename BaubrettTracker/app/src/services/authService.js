/**
 * authService.js
 * Handles user authentication: sign up, sign in, and user management.
 * Uses AsyncStorage for persistent storage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const USERS_KEY = 'baubrett_tracker_users';

/**
 * Get all users from storage
 * @returns {Array} Array of user objects
 */
const getUsers = async () => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

/**
 * Save users to storage
 * @param {Array} users - Array of user objects
 */
const saveUsers = async (users) => {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
};

/**
 * Check if an email already exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists
 */
export async function emailExists(email) {
  const users = await getUsers();
  return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password (plain text, should be hashed in production)
 * @param {string} fullName - User full name
 * @returns {Promise<{success: boolean, message: string, user?: object}>}
 */
export async function signUp(email, password, fullName) {
  try {
    // Check if email already exists
    const exists = await emailExists(email);
    if (exists) {
      return {
        success: false,
        message: i18n.t('signup.errors.usernameExists')
      };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase().trim(),
      password, // In production, this should be hashed!
      fullName: fullName.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to storage
    const users = await getUsers();
    users.push(newUser);
    await saveUsers(users);

    return {
      success: true,
      message: i18n.t('common.success'),
      user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName }
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      message: i18n.t('auth.signUpError')
    };
  }
}

/**
 * Sign in a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, message: string, user?: object}>}
 */
export async function signIn(email, password) {
  try {
    const users = await getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return {
        success: false,
        message: i18n.t('auth.invalidCredentials')
      };
    }

    return {
      success: true,
      message: i18n.t('common.success'),
      user: { id: user.id, email: user.email, fullName: user.fullName }
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      message: i18n.t('auth.signInError')
    };
  }
}

/**
 * Clear all users (for testing/development)
 */
export async function clearAllUsers() {
  try {
    await AsyncStorage.removeItem(USERS_KEY);
  } catch (error) {
    console.error('Error clearing users:', error);
  }
}
