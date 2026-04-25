/**
 * techChangesService.js
 * Loads technical changes data and provides lookup functions
 * for viewing technical changes by Baubrett number.
 * Note: All Baubrett numbers share the same technical changes.
 */
import techChanges from '../data/tech_changes.json';
import baubrettNumbers from '../data/baubrett_numbers.json';

/**
 * Validate if a Baubrett number exists in the database.
 * @param {string} baubrettNumber — The Baubrett number to validate.
 * @returns {boolean} True if Baubrett exists.
 */
export function isValidBaubrett(baubrettNumber) {
  if (!baubrettNumber) return false;
  const query = String(baubrettNumber).trim();
  return baubrettNumbers.some((bb) => String(bb).trim() === query);
}

/**
 * Get all technical changes for any valid Baubrett number.
 * Since all Baubrett numbers share the same technical changes,
 * this returns the entire tech_changes array if Baubrett is valid.
 * @param {string} baubrettNumber — The Baubrett number.
 * @returns {Array|null} Array of all technical changes or null if Baubrett invalid.
 */
export function getTechChangesByBaubrett(baubrettNumber) {
  if (!isValidBaubrett(baubrettNumber)) {
    return null;
  }
  // All Baubrett numbers get the same technical changes
  return techChanges;
}

/**
 * Search Baubrett numbers by partial match.
 * @param {string} query — Partial Baubrett number.
 * @returns {Array} Array of matching Baubrett numbers.
 */
export function searchBaubrettNumbers(query) {
  if (!query) return [];
  const q = String(query).trim().toLowerCase();
  return baubrettNumbers
    .filter((bb) => String(bb).trim().toLowerCase().includes(q))
    .slice(0, 8); // Limit to 8 suggestions
}

/**
 * Returns all valid Baubrett numbers.
 */
export function getAllBaubrettNumbers() {
  return baubrettNumbers;
}

/**
 * Returns all technical changes (same for all Baubrett numbers).
 */
export function getAllTechChanges() {
  return techChanges;
}


