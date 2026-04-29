/**
 * deletedBaubrettService.js
 * Service to manage permanently deleted Baubrett numbers.
 * Uses AsyncStorage for persistent storage that survives app restarts.
 * 
 * When a Baubrett is deleted from the active list, it's marked as deleted
 * and will appear in the Statistics as "unscanned" from that point forward.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for deleted baubrett IDs
const DELETED_BAUBRETT_KEY = '@deleted_baubretts';

/**
 * Get all deleted Baubrett numbers from persistent storage.
 * @returns {Promise<Set<string>>} Set of deleted Baubrett numbers
 */
export async function getDeletedBaubretts() {
  try {
    const stored = await AsyncStorage.getItem(DELETED_BAUBRETT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(parsed);
    }
    return new Set();
  } catch (err) {
    console.error('getDeletedBaubretts error:', err);
    return new Set();
  }
}

/**
 * Mark a Baubrett as permanently deleted.
 * @param {string} bbNb - The Baubrett number to delete
 * @returns {Promise<boolean>} true on success
 */
export async function deleteBaubrett(bbNb) {
  try {
    if (!bbNb || typeof bbNb !== 'string') {
      throw new Error('Invalid Baubrett number');
    }

    const trimmedBbNb = String(bbNb).trim();
    if (!trimmedBbNb) {
      throw new Error('Baubrett number cannot be empty');
    }

    // Get existing deleted baubretts
    const deletedSet = await getDeletedBaubretts();
    
    // Add the new deletion
    deletedSet.add(trimmedBbNb);
    
    // Save back to storage
    const array = Array.from(deletedSet);
    await AsyncStorage.setItem(DELETED_BAUBRETT_KEY, JSON.stringify(array));
    
    return true;
  } catch (err) {
    console.error('deleteBaubrett error:', err);
    return false;
  }
}

/**
 * Restore a previously deleted Baubrett (undo deletion).
 * @param {string} bbNb - The Baubrett number to restore
 * @returns {Promise<boolean>} true on success
 */
export async function restoreBaubrett(bbNb) {
  try {
    if (!bbNb || typeof bbNb !== 'string') {
      throw new Error('Invalid Baubrett number');
    }

    const trimmedBbNb = String(bbNb).trim();
    
    // Get existing deleted baubretts
    const deletedSet = await getDeletedBaubretts();
    
    // Remove from deleted set
    deletedSet.delete(trimmedBbNb);
    
    // Save back to storage
    const array = Array.from(deletedSet);
    await AsyncStorage.setItem(DELETED_BAUBRETT_KEY, JSON.stringify(array));
    
    return true;
  } catch (err) {
    console.error('restoreBaubrett error:', err);
    return false;
  }
}

/**
 * Check if a Baubrett is marked as deleted.
 * @param {string} bbNb - The Baubrett number to check
 * @returns {Promise<boolean>} true if deleted
 */
export async function isBaubrettDeleted(bbNb) {
  try {
    if (!bbNb) return false;
    
    const trimmedBbNb = String(bbNb).trim();
    const deletedSet = await getDeletedBaubretts();
    
    return deletedSet.has(trimmedBbNb);
  } catch (err) {
    console.error('isBaubrettDeleted error:', err);
    return false;
  }
}

/**
 * Clear all deleted baubrett records (for testing/reset purposes).
 * @returns {Promise<boolean>} true on success
 */
export async function clearAllDeletedBaubretts() {
  try {
    await AsyncStorage.removeItem(DELETED_BAUBRETT_KEY);
    return true;
  } catch (err) {
    console.error('clearAllDeletedBaubretts error:', err);
    return false;
  }
}