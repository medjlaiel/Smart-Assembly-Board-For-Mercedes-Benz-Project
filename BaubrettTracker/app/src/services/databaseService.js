/**
 * databaseService.js
 * Service to read and display the static MyDataBase.xlsx file contents.
 */
import * as FileSystem from 'expo-file-system/legacy';
import XLSX from 'xlsx';

// Path to the database Excel file in assets
const DATABASE_FILE = require('../assets/MyDataBase.xlsx');

/**
 * Load the MyDataBase.xlsx file and return its content as JSON array
 * @returns {Promise<Array>} Array of records from the database
 */
export async function loadDatabaseRecords() {
  try {
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(DATABASE_FILE, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Parse the workbook
    const workbook = XLSX.read(base64, { type: 'base64' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json(sheet);
    
    return records || [];
  } catch (err) {
    console.error('loadDatabaseRecords error:', err);
    throw new Error('Failed to load database: ' + err.message);
  }
}

/**
 * Get all column headers from the Excel file
 * @returns {Promise<Array>} Array of column names
 */
export async function getDatabaseHeaders() {
  try {
    const base64 = await FileSystem.readAsStringAsync(DATABASE_FILE, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const workbook = XLSX.read(base64, { type: 'base64' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Get the first row as headers
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const headers = [];
    
    const col = range.s.c;
    const row = range.s.r;
    
    for (let c = col; c <= range.e.c; c++) {
      const cellAddress = { c: c, r: row };
      const cell = sheet[XLSX.utils.encode_cell(cellAddress)];
      headers.push(cell ? cell.v : `Column${c + 1}`);
    }
    
    return headers;
  } catch (err) {
    console.error('getDatabaseHeaders error:', err);
    return [];
  }
}