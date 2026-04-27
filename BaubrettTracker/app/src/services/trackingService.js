/**
 * trackingService.js
 * Handles reading and writing the location-tracking Excel file.
 *
 * The tracking file is stored in the app's document directory so it
 * persists across app restarts and can be shared / exported.
 *
 * Columns: BB_Nb | Zone | Date | Time | UserName | UserEmail
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import XLSX from 'xlsx';

// Path where the tracking workbook lives on the device
const TRACKING_FILE = FileSystem.documentDirectory + 'baubrett_tracking.xlsx';

/**
 * Load existing tracking records from the XLSX file.
 * Returns an empty array if the file doesn't exist yet.
 */
export async function loadTrackingRecords() {
  try {
    const info = await FileSystem.getInfoAsync(TRACKING_FILE);
    if (!info.exists) return [];

    // Read the file as base64 and parse with xlsx
    const base64 = await FileSystem.readAsStringAsync(TRACKING_FILE, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const workbook = XLSX.read(base64, { type: 'base64' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json(sheet);
    return records;
  } catch (err) {
    console.error('loadTrackingRecords error:', err);
    return [];
  }
}

/**
 * Append a new tracking entry and persist the workbook.
 * @param {string} bbNb   — Baubrett number
 * @param {string} zone   — Zone key (e.g. "ZONE_A", "UFB03")
 * @returns {boolean} true on success
 */
export async function saveTrackingEntry(bbNb, zone, userName, userEmail) {
  try {
      // Validate inputs
      if (!bbNb || !zone || typeof bbNb !== 'string' || typeof zone !== 'string') {
        throw new Error('Invalid parameters: Baubrett number and zone are required');
      }
      if (!bbNb.trim() || !zone.trim()) {
        throw new Error('Invalid parameters: Baubrett number and zone cannot be empty');
      }
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR'); // DD/MM/YYYY
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Load existing data
    const existing = await loadTrackingRecords();

    // Append new row
    const newRow = {
      BB_Nb: bbNb,
      Zone: zone,
      Date: date,
      Time: time,
      UserName: userName || '',
      UserEmail: userEmail || ''
    };
    const allRows = [...existing, newRow];

    // Build workbook
    const ws = XLSX.utils.json_to_sheet(allRows);

    // Style header row — bold text, blue fill
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0A5FBF' } },
      alignment: { horizontal: 'center' },
    };
    ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'].forEach((cell) => {
      if (ws[cell]) ws[cell].s = headerStyle;
    });

    // Set column widths
    ws['!cols'] = [
      { wch: 16 },  // BB_Nb
      { wch: 18 },  // Zone
      { wch: 14 },  // Date
      { wch: 10 },  // Time
      { wch: 20 },  // UserName
      { wch: 25 }   // UserEmail
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tracking');

    // Write as base64
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    await FileSystem.writeAsStringAsync(TRACKING_FILE, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return true;
  } catch (err) {
    console.error('saveTrackingEntry error:', err);
    return false;
  }
}

/**
 * Get all tracking entries for a specific BB_Nb (history view).
 */
export async function getHistoryForBaubrett(bbNb) {
  const all = await loadTrackingRecords();
  return all.filter(
    (r) => String(r.BB_Nb).trim() === String(bbNb).trim()
  );
}

/**
 * Share / export the tracking Excel file using the system share sheet.
 */
export async function exportTrackingFile() {
  const info = await FileSystem.getInfoAsync(TRACKING_FILE);
  if (!info.exists) throw new Error('No tracking file found yet.');
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(TRACKING_FILE, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Export Baubrett Tracking',
    UTI: 'com.microsoft.excel.xlsx',
  });
}

/**
 * Get all baubretts scanned in a specific zone (with their latest scan info).
 * 
 * DATA PERSISTENCE:
 * This function queries the persistent baubrett_tracking.xlsx file stored in
 * FileSystem.documentDirectory. The file persists across app sessions and is
 * updated whenever a new scan is recorded in HistoryScreen.
 * 
 * @param {string} zone - Zone key (e.g. "ZONE_A", "UFB03")
 * @returns {Array} Array of unique baubretts scanned in zone, with latest scan timestamp
 */
export async function getBaubrettsScannedInZone(zone) {
  const all = await loadTrackingRecords();
  const filtered = all.filter(r => String(r.Zone || '').trim() === String(zone || '').trim());
  
  // Get unique BB_Nb with latest scan info
  const map = new Map();
  filtered.forEach(r => {
    const key = String(r.BB_Nb).trim();
    if (!map.has(key) || new Date(`${r.Date} ${r.Time}`) > new Date(`${map.get(key).Date} ${map.get(key).Time}`)) {
      map.set(key, r);
    }
  });
  return Array.from(map.values());
}

/**
 * Delete a specific tracking entry.
 * @param {object} entry - The entry to delete with BB_Nb, Zone, Date, Time
 * @returns {boolean} true on success
 */
export async function deleteTrackingEntry(entry) {
  try {
    // Load existing data
    const existing = await loadTrackingRecords();

    // Filter out the entry to delete
    const filtered = existing.filter(r =>
      !(String(r.BB_Nb).trim() === String(entry.BB_Nb).trim() &&
        String(r.Zone).trim() === String(entry.Zone).trim() &&
        r.Date === entry.Date &&
        r.Time === entry.Time)
    );

    if (filtered.length === existing.length) {
      throw new Error('Entry not found');
    }

    // Build workbook with filtered data
    const ws = XLSX.utils.json_to_sheet(filtered);

    // Style header row — bold text, blue fill
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '0A5FBF' } },
      alignment: { horizontal: 'center' },
    };
    ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'].forEach((cell) => {
      if (ws[cell]) ws[cell].s = headerStyle;
    });

    // Set column widths
    ws['!cols'] = [
      { wch: 16 },  // BB_Nb
      { wch: 18 },  // Zone
      { wch: 14 },  // Date
      { wch: 10 },  // Time
      { wch: 20 },  // UserName
      { wch: 25 }   // UserEmail
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tracking');

    // Write as base64
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    await FileSystem.writeAsStringAsync(TRACKING_FILE, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return true;
  } catch (err) {
    console.error('deleteTrackingEntry error:', err);
    return false;
  }
}
