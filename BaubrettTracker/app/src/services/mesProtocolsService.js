/**
 * mesProtocolsService.js
 * Loads measurement protocols data and provides lookup functions
 * for viewing measurement protocols by FP-NO.
 */
import mesProtocols from '../data/mes_protocols.json';

/**
 * Get all unique FP-NO values.
 * @returns {Array<string>} Array of all FP-NO values
 */
export function getAllFPNumbers() {
  return Object.keys(mesProtocols);
}

/**
 * Get measurement protocol for a specific FP-NO.
 * @param {string} fpNo - The FP-NO to search for
 * @returns {Object|null} Protocol object with lines and totalLines, or null if not found
 */
export function getProtocolByFPNO(fpNo) {
  if (!fpNo) return null;
  const query = String(fpNo).trim().toUpperCase();
  return mesProtocols[query] || null;
}

/**
 * Search FP-NO by partial match (fuzzy search).
 * @param {string} query - Partial FP-NO to search for
 * @param {number} limit - Maximum suggestions to return
 * @returns {Array} Array of matching FP-NO strings
 */
export function searchFPNumbers(query, limit = 10) {
  if (!query) return [];
  const q = String(query).trim().toLowerCase();
  const suggestions = [];
  
  for (const fpNo of Object.keys(mesProtocols)) {
    if (fpNo.toLowerCase().includes(q)) {
      suggestions.push(fpNo);
      if (suggestions.length >= limit) break;
    }
  }
  return suggestions;
}

/**
 * Get all measurement protocols (for admin/export purposes).
 * @returns {Object} All protocols
 */
export function getAllProtocols() {
  return mesProtocols;
}