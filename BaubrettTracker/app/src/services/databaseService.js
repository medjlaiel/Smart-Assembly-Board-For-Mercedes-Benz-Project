/**
 * databaseService.js
 * Loads the local JSON database (converted from Excel) and exposes
 * a simple lookup API used by the Consult flow.
 */
import database from '../data/database.json';

/**
 * Look up a Baubrett record by its BB_Nb number.
 * @param {string} bbNb — The scanned Baubrett number.
 * @returns {object|null} The matching record or null if not found.
 */
export function getBaubrettByNumber(bbNb) {
  if (!bbNb) return null;
  // Normalise: strip whitespace and leading apostrophes
  const query = String(bbNb).trim().replace(/^'+/, '');
  const found = database.find(
    (rec) => String(rec.BB_Nb).trim().replace(/^'+/, '') === query
  );
  return found || null;
}

/**
 * Returns all known BB_Nb values (useful for validation).
 */
export function getAllBBNumbers() {
  return database.map((r) => r.BB_Nb);
}

/**
 * Returns the full database array.
 */
export function getAll() {
  return database;
}
