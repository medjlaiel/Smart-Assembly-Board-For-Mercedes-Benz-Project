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

/**
 * Fuzzy/partial search function for typeahead suggestions
 * Searches across BB_Nb, SOM, and FP_NO with partial matching
 * @param {string} query - Partial search query (min 2 characters recommended)
 * @param {number} limit - Maximum number of suggestions to return (default 10)
 * @returns {Array} Array of objects with { type, record, matchField, matchValue, displayText }
 */
export function searchDatabaseFuzzy(query, limit = 10) {
  if (!query || !query.trim() || query.trim().length < 2) return [];
  const trimmed = query.trim().toLowerCase();
  const results = [];
  const seenBB_Nb = new Set();

  // Search all records
  for (const record of database) {
    // Check BB_Nb partial match
    const bbNbStr = String(record.BB_Nb).toLowerCase();
    if (bbNbStr.includes(trimmed)) {
      seenBB_Nb.add(record.BB_Nb);
      results.push({
        type: 'bb_nb',
        record: record,
        matchField: 'BB_Nb',
        matchValue: record.BB_Nb,
        displayText: `${record.BB_Nb} — ${record.SOM}`
      });
      if (results.length >= limit) continue;
    }

    // Check SOM partial match (case-insensitive)
    if (record.SOM && String(record.SOM).toLowerCase().includes(trimmed)) {
      if (!seenBB_Nb.has(record.BB_Nb)) {
        seenBB_Nb.add(record.BB_Nb);
        results.push({
          type: 'som',
          record: record,
          matchField: 'SOM',
          matchValue: record.SOM,
          displayText: `${record.SOM} — ${record.BB_Nb}`
        });
        if (results.length >= limit) continue;
      }
    }

    // Check FP_NO array partial match
    if (record.FP_NO && Array.isArray(record.FP_NO)) {
      for (const fp of record.FP_NO) {
        if (String(fp).toLowerCase().includes(trimmed)) {
          if (!seenBB_Nb.has(record.BB_Nb)) {
            seenBB_Nb.add(record.BB_Nb);
            results.push({
              type: 'fp_no',
              record: record,
              matchField: 'FP_NO',
              matchValue: fp,
              displayText: `${fp} — ${record.BB_Nb} (${record.SOM})`
            });
            if (results.length >= limit) break;
          }
          break; // Only add one suggestion per record even if multiple FP_NO match
        }
      }
      if (results.length >= limit) continue;
    }
  }

  return results;
}
