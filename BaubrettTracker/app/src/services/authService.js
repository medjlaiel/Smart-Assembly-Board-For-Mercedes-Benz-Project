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
 * @param {string} matricule - User matricule
 * @returns {Promise<{success: boolean, message: string, user?: object}>}
 */
export async function signUp(email, password, fullName, matricule) {
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
      matricule: matricule.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save to storage
    const users = await getUsers();
    users.push(newUser);
    await saveUsers(users);

    return {
      success: true,
      message: i18n.t('auth.accountCreated'),
      user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName, matricule: newUser.matricule }
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
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        matricule: user.matricule || ''
      }
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

/**
 * Password reset flow (simulated email)
 * - sendResetCode(email): generates a 6-digit code and stores it with expiry
 * - verifyResetCode(email, code): verifies code and expiry
 * - resetPasswordWithCode(email, code, newPassword): verifies then updates password
 */
const RESET_CODES_KEY = 'baubrett_tracker_reset_codes';

const saveResetCodes = async (map) => {
  try {
    await AsyncStorage.setItem(RESET_CODES_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Error saving reset codes:', error);
  }
};

const loadResetCodes = async () => {
  try {
    const json = await AsyncStorage.getItem(RESET_CODES_KEY);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error('Error loading reset codes:', error);
    return {};
  }
};

export async function sendResetCode(email) {
  try {
    const users = await getUsers();
    const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      return { success: false, message: 'Email not found' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 minutes

    const map = await loadResetCodes();
    map[user.email] = { code, expiresAt };
    await saveResetCodes(map);

    // NOTE: In a production app you would send the code via email.
    // For this local/demo app we return the code so the developer can see it.
    console.log(`Password reset code for ${user.email}: ${code}`);

    return { success: true, message: 'Reset code sent', code };
  } catch (error) {
    console.error('sendResetCode error:', error);
    return { success: false, message: 'Error sending code' };
  }
}

export async function verifyResetCode(email, code) {
  try {
    const map = await loadResetCodes();
    const entry = map[(email || '').toLowerCase()];
    if (!entry) return { success: false, message: 'No code found' };
    if (Date.now() > entry.expiresAt) return { success: false, message: 'Code expired' };
    if (entry.code !== String(code).trim()) return { success: false, message: 'Code mismatch' };
    return { success: true };
  } catch (error) {
    console.error('verifyResetCode error:', error);
    return { success: false, message: 'Verification error' };
  }
}

export async function resetPasswordWithCode(email, code, newPassword) {
  try {
    const verify = await verifyResetCode(email, code);
    if (!verify.success) return verify;

    const users = await getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (idx === -1) return { success: false, message: 'User not found' };

    users[idx].password = newPassword;
    await saveUsers(users);

    // Remove the used code
    const map = await loadResetCodes();
    delete map[users[idx].email];
    await saveResetCodes(map);

    return { success: true, message: 'Password updated' };
  } catch (error) {
    console.error('resetPasswordWithCode error:', error);
    return { success: false, message: 'Reset error' };
  }
}