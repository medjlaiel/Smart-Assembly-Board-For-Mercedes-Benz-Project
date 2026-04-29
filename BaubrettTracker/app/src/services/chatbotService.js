/**
 * chatbotService.js
 * Handles communication with Anthropic Claude API for the AI Assistant.
 * Fetches live data from various services to provide context-aware answers.
 */
import Anthropic from '@anthropic-ai/sdk';
import { getAllBaubrettNumbers } from './techChangesService';
import { getDeletedBaubretts } from './deletedBaubrettService';
import { loadTrackingRecords } from './trackingService';
import { getAll } from './databaseService';

// Initialize Anthropic client with API key from environment
const getAnthropicClient = () => {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key not configured. Set EXPO_PUBLIC_ANTHROPIC_API_KEY in your environment.');
  }
  return new Anthropic({ apiKey });
};

/**
 * Build system prompt with live data context
 */
const buildSystemPrompt = async () => {
  const [allBaubretts, deletedBaubretts, trackingRecords, databaseEntries] = await Promise.all([
    getAllBaubrettNumbers(),
    getDeletedBaubretts(),
    loadTrackingRecords(),
    getAll()
  ]);

  const totalBaubretts = allBaubretts.length;
  const deletedArray = Array.from(deletedBaubretts);
  const deletedCount = deletedArray.length;

  // Calculate scanned vs unscanned (FIXED: exclude deleted from scanned count)
  const scannedSet = new Set();
  trackingRecords.forEach(record => {
    scannedSet.add(String(record.BB_Nb).trim());
  });

  // Only count scanned Baubretts that are NOT deleted
  const activeScannedCount = Array.from(scannedSet).filter(bb => !deletedBaubretts.has(bb)).length;
  const unscannedCount = totalBaubretts - activeScannedCount;

  // Build list of all baubretts with status
  const baubrettStatusList = allBaubretts.map(bb => {
    const bbStr = String(bb).trim();
    if (deletedBaubretts.has(bbStr)) {
      return `  - #${bbStr} (DELETED - moved to unscanned)`;
    } else if (scannedSet.has(bbStr)) {
      return `  - #${bbStr} (scanned)`;
    } else {
      return `  - #${bbStr} (not scanned yet)`;
    }
  }).join('\n');

  // Get recent scan activity (last 10 entries)
  const recentScans = trackingRecords
    .sort((a, b) => new Date(`${b.Date} ${b.Time}`) - new Date(`${a.Date} ${a.Time}`))
    .slice(0, 10)
    .map(r => `  - #${r.BB_Nb} in ${r.Zone} on ${r.Date} at ${r.Time}${r.UserName ? ` by ${r.UserName}` : ''}`)
    .join('\n');

  return `You are a helpful assistant for Mercedes-Benz Baubrett Tracker workers. 
Your job is to answer questions about Baubretts, scanning, and statistics.

LIVE DATA (current as of this message):
=====================================

Total Baubretts in database: ${totalBaubretts}
Total scanned (unique, excluding deleted): ${activeScannedCount}
Total unscanned (including deleted): ${unscannedCount}
Deleted Baubretts count: ${deletedCount}
Deleted Baubretts: ${deletedArray.length > 0 ? deletedArray.map(d => '#' + d).join(', ') : 'None'}

All Baubretts and their status:
${baubrettStatusList}

Recent scan activity (last 10):
${recentScans}

Database entries count: ${databaseEntries.length}

INSTRUCTIONS:
- Answer questions accurately based on the live data above
- When asked about unscanned Baubretts, include both deleted and never-scanned ones
- Deleted Baubretts are Baubretts that were removed from the active list but still count as unscanned
- Be concise and helpful. If you don't have enough information, say so.
- Always use the live data provided, do not make up numbers.
- When showing Baubrett numbers, always prefix with # (e.g., #4711)`;
};

/**
 * Send a message to Claude and get a response
 * @param {Array} conversationHistory - Array of {role: 'user'|'assistant', content: string}
 * @returns {Promise<string>} Bot response
 */
export async function sendChatMessage(conversationHistory) {
  try {
    const client = getAnthropicClient();
    const systemPrompt = await buildSystemPrompt();

    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Chatbot API error:', error);
    if (error.message.includes('API key')) {
      throw new Error('API key not configured. Please set EXPO_PUBLIC_ANTHROPIC_API_KEY.');
    }
    throw error;
  }
}

/**
 * Quick action: Get unscanned Baubretts count
 */
export async function getUnscannedCount() {
  const [allBaubretts, deletedBaubretts, trackingRecords] = await Promise.all([
    getAllBaubrettNumbers(),
    getDeletedBaubretts(),
    loadTrackingRecords()
  ]);

  const scannedSet = new Set();
  trackingRecords.forEach(r => scannedSet.add(String(r.BB_Nb).trim()));

  // Only count scanned Baubretts that are NOT deleted (active scanned)
  const activeScannedCount = Array.from(scannedSet).filter(bb => !deletedBaubretts.has(bb)).length;
  
  // Unscanned = total Baubretts - active scanned
  // This includes: deleted Baubretts + never-scanned Baubretts
  return allBaubretts.length - activeScannedCount;
}

/**
 * Quick action: Check if a specific Baubrett is scanned
 */
export async function isBaubrettScanned(bbNb) {
  const trackingRecords = await loadTrackingRecords();
  const scannedSet = new Set(trackingRecords.map(r => String(r.BB_Nb).trim()));
  return scannedSet.has(String(bbNb).trim());
}

/**
 * Quick action: Get list of deleted Baubretts
 */
export async function getDeletedList() {
  const deleted = await getDeletedBaubretts();
  return Array.from(deleted).sort();
}