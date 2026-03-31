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

/**
 * Search records by SOM (exact match, case-insensitive)
 * @param {string} som - The SOM to search for
 * @returns {Array} Array of matching records
 */
export function getRecordsBySOM(som) {
  if (!som) return [];
  const query = String(som).trim().toLowerCase();
  return database.filter(
    (rec) => rec.SOM && String(rec.SOM).trim().toLowerCase() === query
  );
}

/**
 * Search records by FP-NO (exact match within FP_NO array)
 * @param {string} fpNo - The FP-NO to search for
 * @returns {Array} Array of matching records
 */
export function getRecordsByFPNO(fpNo) {
  if (!fpNo) return [];
  const query = String(fpNo).trim();
  return database.filter(
    (rec) => rec.FP_NO && Array.isArray(rec.FP_NO) && rec.FP_NO.some(
      (fp) => String(fp).trim() === query
    )
  );
}

/**
 * Universal search function - determines type automatically
 * Tries to match by BB_Nb first (exact), then SOM (exact), then FP-NO (exact in array)
 * @param {string} query - Search query
 * @returns {Array} Array of objects with { type, record, matchField }
 */
export function searchDatabase(query) {
  if (!query || !query.trim()) return [];
  const trimmed = query.trim();

  // Search by BB_Nb (exact match)
  const bbNbRecord = getBaubrettByNumber(trimmed);
  const results = [];

  if (bbNbRecord) {
    results.push({
      type: 'bb_nb',
      record: bbNbRecord,
      matchField: 'BB_Nb'
    });
  }

  // Search by SOM (exact match, case-insensitive)
  const somRecords = getRecordsBySOM(trimmed);
  for (const rec of somRecords) {
    // Avoid duplicates if BB_Nb and SOM point to same record
    if (!results.find(r => r.record.BB_Nb === rec.BB_Nb)) {
      results.push({
        type: 'som',
        record: rec,
        matchField: 'SOM'
      });
    }
  }

  // Search by FP-NO (exact match in array)
  const fpNoRecords = getRecordsByFPNO(trimmed);
  for (const rec of fpNoRecords) {
    // Avoid duplicates
    if (!results.find(r => r.record.BB_Nb === rec.BB_Nb)) {
      results.push({
        type: 'fp_no',
        record: rec,
        matchField: 'FP_NO'
      });
    }
  }

  return results;
}
