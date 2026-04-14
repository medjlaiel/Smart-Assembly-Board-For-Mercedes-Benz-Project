/**
 * authService.js
 * Handles user authentication: sign up, sign in, and user management.
 * Uses AsyncStorage for persistent storage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const USERS_KEY = 'baubrett_tracker_users';
const CURRENT_USER_KEY = 'baubrett_tracker_current_user';

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
      message: i18n.t('auth.accountCreated'),
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
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function changePassword(userId, currentPassword, newPassword) {
  try {
    console.log('changePassword called for userId:', userId); // Debug log
    
    const users = await getUsers();
    console.log('Retrieved users, searching for userId:', userId); // Debug log
    
    const userIndex = users.findIndex(u => u.id === userId);
    console.log('User found at index:', userIndex); // Debug log

    if (userIndex === -1) {
      console.warn('User not found:', userId); // Debug log
      return {
        success: false,
        message: i18n.t('drawer.userNotFound', 'User not found')
      };
    }

    const user = users[userIndex];
    console.log('Verifying current password'); // Debug log

    // Verify current password
    if (user.password !== currentPassword) {
      console.warn('Current password incorrect'); // Debug log
      return {
        success: false,
        message: i18n.t('drawer.incorrectPassword', 'Current password is incorrect')
      };
    }

    // Update password
    console.log('Updating password for user'); // Debug log
    users[userIndex].password = newPassword;
    await saveUsers(users);
    console.log('Password updated successfully'); // Debug log

    return {
      success: true,
      message: i18n.t('drawer.passwordChangedSuccess', 'Password changed successfully')
    };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: i18n.t('drawer.passwordChangeError', 'An error occurred')
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

/**
 * Get the currently logged-in user
 * @returns {Promise<Object|null>} Current user object or null
 */
export async function getCurrentUser() {
  try {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Set the currently logged-in user
 * @param {Object} user - User object (should have id, email, fullName)
 */
export async function setCurrentUser(user) {
  try {
    if (user) {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
}

/**
 * Clear current user session (logout)
 */
export async function clearCurrentUser() {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
}