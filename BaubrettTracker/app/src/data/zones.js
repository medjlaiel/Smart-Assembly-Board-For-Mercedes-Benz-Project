/**
 * zones.js
 * Complete list of all valid zone QR codes.
 * Derived from allzones.html — keep in sync if zones change.
 *
 * Each entry: { key, label }
 *   key   — The string encoded in the QR code (scanned value)
 *   label — Human-readable display name
 */
const ZONES = [
  // ── Original zones ─────────────────────────────────────────
  { key: 'ZONE_A',       label: 'Zone A' },
  { key: 'ZONE_B',       label: 'Zone B' },
  { key: 'ZONE_C',       label: 'Zone C' },
  { key: 'ZONE_D',       label: 'Zone D' },
  { key: 'ZONE_E',       label: 'Zone E' },
  { key: 'ZONE_RESERVE', label: 'Zone Réserve' },
  // ── UFB zones ────────────────────────────────────────────────
  { key: 'UFB01', label: 'UFB 01' },
  { key: 'UFB02', label: 'UFB 02' },
  { key: 'UFB03', label: 'UFB 03' },
  { key: 'UFB04', label: 'UFB 04' },
  { key: 'UFB05', label: 'UFB 05' },
  { key: 'UFB06', label: 'UFB 06' },
  { key: 'UFB07', label: 'UFB 07' },
  { key: 'UFB08', label: 'UFB 08' },
  // ── EAP zones ────────────────────────────────────────────────
  { key: 'EAP1',  label: 'EAP 1'  },
  { key: 'EAP2',  label: 'EAP 2'  },
  { key: 'EAP3',  label: 'EAP 3'  },
  { key: 'EAP4',  label: 'EAP 4'  },
  { key: 'EAP5',  label: 'EAP 5'  },
  { key: 'EAP6',  label: 'EAP 6'  },
  { key: 'EAP7',  label: 'EAP 7'  },
  { key: 'EAP8',  label: 'EAP 8'  },
  { key: 'EAP9',  label: 'EAP 9'  },
  { key: 'EAP10', label: 'EAP 10' },
  { key: 'EAP11', label: 'EAP 11' },
  { key: 'EAP12', label: 'EAP 12' },
  { key: 'EAP13', label: 'EAP 13' },
  { key: 'EAP14', label: 'EAP 14' },
  { key: 'EAP15', label: 'EAP 15' },
  { key: 'EAP16', label: 'EAP 16' },
  { key: 'EAP17', label: 'EAP 17' },
  { key: 'EAP18', label: 'EAP 18' },
  { key: 'EAP19', label: 'EAP 19' },
  { key: 'EAP20', label: 'EAP 20' },
  { key: 'EAP21', label: 'EAP 21' },
  { key: 'EAP22', label: 'EAP 22' },
  { key: 'EAP23', label: 'EAP 23' },
  { key: 'EAP24', label: 'EAP 24' },
];

/**
 * Look up a zone by its QR key.
 * Returns { key, label } or null if the key is not a known zone.
 */
export function getZoneByKey(key) {
  if (!key) return null;
  return ZONES.find((z) => z.key === key.trim()) || null;
}

/**
 * Returns all valid zone keys (for validation).
 */
export function getValidZoneKeys() {
  return ZONES.map((z) => z.key);
}

export default ZONES;
