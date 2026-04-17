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