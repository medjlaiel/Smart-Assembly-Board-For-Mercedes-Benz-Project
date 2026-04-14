/**
 * databaseService.js
 * Service to read and display the static MyDataBase.xlsx file contents.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import XLSX from 'xlsx';

// Path to the database Excel file in assets
const DATABASE_ASSET = require('../assets/MyDataBase.xlsx');

/**
 * Load the MyDataBase.xlsx file and return its content as JSON array
 * @returns {Promise<Array>} Array of records from the database
 */
export async function loadDatabaseRecords() {
  try {
    // Load the asset using expo-asset
    const asset = Asset.fromModule(DATABASE_ASSET);
    await asset.downloadAsync();
    
    // Get the local URI of the asset
    const assetUri = asset.localUri || asset.uri;
    if (!assetUri) {
      throw new Error('Failed to get asset URI');
    }
    
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(assetUri, {
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
    // Load the asset using expo-asset
    const asset = Asset.fromModule(DATABASE_ASSET);
    await asset.downloadAsync();
    
    // Get the local URI of the asset
    const assetUri = asset.localUri || asset.uri;
    if (!assetUri) {
      throw new Error('Failed to get asset URI');
    }
    
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(assetUri, {
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