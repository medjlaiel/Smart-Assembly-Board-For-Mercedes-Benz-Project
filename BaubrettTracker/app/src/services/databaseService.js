/**
 * databaseService.js
 * Service to read and display the static database.json file contents.
 * 
 * Note: We use database.json instead of MyDataBase.xlsx because React Native/Expo
 * cannot handle require() calls for binary files like .xlsx. JSON is natively supported.
 */
import databaseJSON from '../data/database.json';

/**
 * Load the database.json file and return its content as JSON array
 * @returns {Promise<Array>} Array of records from the database
 */
export async function loadDatabaseRecords() {
  try {
    // Return the imported JSON data directly
    // The data is already loaded at module initialization time
    return databaseJSON || [];
  } catch (err) {
    console.error('loadDatabaseRecords error:', err);
    throw new Error('Failed to load database: ' + err.message);
  }
}

/**
 * Get all column headers from the database
 * @returns {Promise<Array>} Array of column names
 */
export async function getDatabaseHeaders() {
  try {
    // Get headers from the first record's keys
    if (!databaseJSON || databaseJSON.length === 0) {
      return [];
    }
    
    const firstRecord = databaseJSON[0];
    const headers = Object.keys(firstRecord);
    
    return headers;
  } catch (err) {
    console.error('getDatabaseHeaders error:', err);
    return [];
  }
}

/**
 * Get all database records (synchronous)
 * @returns {Array} Array of all records from the database
 */
export function getAll() {
  return databaseJSON || [];
}

/**
 * Get a Baubrett record by its BB_Nb (exact match)
 * @param {string} bbNb - The Baubrett number to search for
 * @returns {Object|undefined} The matching record, or undefined if not found
 */
export function getBaubrettByNumber(bbNb) {
  if (!databaseJSON || !bbNb) {
    return undefined;
  }
  
  const trimmedBbNb = String(bbNb).trim();
  return databaseJSON.find((record) => String(record.BB_Nb).trim() === trimmedBbNb);
}

/**
 * Search database by BB_Nb, SOM, or FP_NO (exact and partial matches)
 * @param {string} query - The search query
 * @returns {Array} Array of results with {type, record} objects
 */
export function searchDatabase(query) {
  if (!databaseJSON || !query) {
    return [];
  }
  
  const trimmedQuery = String(query).trim().toLowerCase();
  const results = [];
  
  databaseJSON.forEach((record) => {
    // Check BB_Nb (exact or starts with)
    if (String(record.BB_Nb).trim().toLowerCase() === trimmedQuery) {
      results.push({ type: 'bb_nb', record });
    } else if (String(record.BB_Nb).trim().toLowerCase().includes(trimmedQuery)) {
      results.push({ type: 'bb_nb', record });
    }
    
    // Check SOM (partial match)
    if (record.SOM && String(record.SOM).trim().toLowerCase().includes(trimmedQuery)) {
      if (!results.some(r => r.record.BB_Nb === record.BB_Nb && r.type === 'som')) {
        results.push({ type: 'som', record });
      }
    }
    
    // Check FP_NO (if it's an array or string)
    if (record.FP_NO) {
      const fpArray = Array.isArray(record.FP_NO) ? record.FP_NO : [record.FP_NO];
      if (fpArray.some(fp => String(fp).trim().toLowerCase().includes(trimmedQuery))) {
        if (!results.some(r => r.record.BB_Nb === record.BB_Nb && r.type === 'fp_no')) {
          results.push({ type: 'fp_no', record });
        }
      }
    }
  });
  
  return results;
}

/**
 * Fuzzy search the database by BB_Nb, SOM, or FP_NO
 * Uses substring matching with a limit on results
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of suggestions to return
 * @returns {Array} Array of suggestions with {type, record, displayText} objects
 */
export function searchDatabaseFuzzy(query, limit = 10) {
  if (!databaseJSON || !query) {
    return [];
  }
  
  const trimmedQuery = String(query).trim().toLowerCase();
  const suggestions = [];
  const seen = new Set();
  
  databaseJSON.forEach((record) => {
    if (suggestions.length >= limit) return;
    
    const bbNb = String(record.BB_Nb).trim().toLowerCase();
    const som = record.SOM ? String(record.SOM).trim().toLowerCase() : '';
    const fpArray = record.FP_NO 
      ? (Array.isArray(record.FP_NO) ? record.FP_NO : [record.FP_NO])
      : [];
    
    // Check BB_Nb match
    if (bbNb.includes(trimmedQuery) && !seen.has(`bb_nb_${record.BB_Nb}`)) {
      suggestions.push({
        type: 'bb_nb',
        record,
        displayText: `${record.BB_Nb}`,
      });
      seen.add(`bb_nb_${record.BB_Nb}`);
    }
    
    // Check SOM match
    if (som.includes(trimmedQuery) && !seen.has(`som_${record.BB_Nb}`)) {
      suggestions.push({
        type: 'som',
        record,
        displayText: `${record.BB_Nb} • SOM: ${record.SOM}`,
      });
      seen.add(`som_${record.BB_Nb}`);
    }
    
    // Check FP_NO matches
    fpArray.forEach((fp) => {
      if (String(fp).trim().toLowerCase().includes(trimmedQuery) && !seen.has(`fp_no_${record.BB_Nb}`)) {
        suggestions.push({
          type: 'fp_no',
          record,
          displayText: `${record.BB_Nb} • FP-NO: ${fp}`,
        });
        seen.add(`fp_no_${record.BB_Nb}`);
      }
    });
  });
  
  return suggestions.slice(0, limit);
}

/**
 * Get all zones with their Baubrett count from zoneAssignments.json
 * @returns {Promise<Array>} Array of zones with {key, label, count}
 */
export async function getZonesWithBaubrettCount() {
  try {
    // This would ideally come from an API, but we're using local JSON
    const zones = require('../data/zones').default;
    const zoneAssignments = require('../data/zoneAssignments.json');
    
    return zones.map((zone) => ({
      key: zone.key,
      label: zone.label,
      count: zoneAssignments[zone.key] ? zoneAssignments[zone.key].length : 0,
    }));
  } catch (err) {
    console.error('getZonesWithBaubrettCount error:', err);
    throw new Error('Failed to load zones: ' + err.message);
  }
}

/**
 * Get all Baubrett records assigned to a specific zone
 * @param {string} zoneKey - The zone key (e.g., 'ZONE_A', 'UFB01')
 * @returns {Promise<Array>} Array of Baubrett records
 */
export async function getBaubrettsByZone(zoneKey) {
  try {
    const zoneAssignments = require('../data/zoneAssignments.json');
    const baubrettNumbers = zoneAssignments[zoneKey] || [];
    
    if (baubrettNumbers.length === 0) {
      return [];
    }
    
    // Get full records from database
    const records = getAll();
    
    // Filter records that match the baubrett numbers in this zone
    const zoneBaubretts = records.filter((record) => 
      baubrettNumbers.includes(String(record.BB_Nb).trim())
    );
    
    return zoneBaubretts;
  } catch (err) {
    console.error('getBaubrettsByZone error:', err);
    throw new Error('Failed to load baubretts for zone: ' + err.message);
  }
}