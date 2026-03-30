# 📦 Baubrett Tracker — Complete Project

A mobile QR-code tracking system for Baubretts (cable boards).  
Built with **React Native + Expo** (iOS-first) and a local **Excel tracking file**.

---

## 📁 Project Structure

```
BaubrettTracker/
│
├── qr_generation/
│   └── generate_qr_codes.py      # Script to regenerate QR codes from Excel
│
├── qr_codes/
│   ├── baubretts/                 # Individual QR PNG per Baubrett
│   │   ├── 073043546.png
│   │   ├── 073043706.png
│   │   └── … (17 total)
│   └── all_baubrett_qrcodes.html # Printable QR sheet (open in browser → Print)
│
└── app/                           # React Native / Expo mobile app
    ├── App.js                     # Root entry point
    ├── app.json                   # Expo configuration
    ├── package.json               # Dependencies
    ├── babel.config.js
    └── src/
        ├── navigation/
        │   └── AppNavigator.js    # Stack navigator (all screens)
        ├── screens/
        │   ├── HomeScreen.js            # Landing: 2 action cards
        │   ├── SaveScanBaubrettScreen.js # Save flow step 1
        │   ├── SaveScanZoneScreen.js     # Save flow step 2
        │   ├── SaveConfirmScreen.js      # Save flow step 3 (write Excel)
        │   ├── ConsultScanScreen.js      # Consult flow step 1
        │   ├── ConsultResultScreen.js    # Consult flow step 2 (show DB data)
        │   └── HistoryScreen.js          # View + export tracking log
        ├── components/
        │   └── QRScannerView.js          # Reusable camera + viewfinder
        ├── services/
        │   ├── databaseService.js        # Read from JSON database
        │   └── trackingService.js        # Read/write XLSX tracking file
        ├── data/
        │   ├── database.json             # Converted from MyDataBase.xlsx
        │   └── zones.js                  # All valid zone codes
        └── assets/
            └── theme.js                  # Design tokens (colours, shadows, radii)
```

---

## ⚙️ Part 1 — QR Code Generation (Python)

### Prerequisites
```bash
pip install qrcode pillow openpyxl pandas
```

### Run
```bash
# Copy MyDataBase.xlsx to the project root, then:
cd BaubrettTracker
python qr_generation/generate_qr_codes.py
```

This will:
- Read `MyDataBase.xlsx`
- Generate `qr_codes/baubretts/<BB_Nb>.png` for each row
- Export `app/src/data/database.json` (used by the app)
- Create `qr_codes/all_baubrett_qrcodes.html` (open in browser → Cmd+P to print)

---

## 📱 Part 2 — Mobile App (React Native + Expo)

### Prerequisites

1. **Node.js** ≥ 18 — https://nodejs.org
2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```
3. **Expo Go** app on your iPhone  
   → App Store: search "Expo Go"

### Install dependencies
```bash
cd BaubrettTracker/app
npm install
```

### Start the dev server
```bash
npx expo start
```

A QR code will appear in the terminal.  
Open the **Camera** app on your iPhone, scan the terminal QR code → it opens in **Expo Go**.

---

## 🔄 App Flow Explained

### Flow 1 — Save a Baubrett (3 steps)

```
Home → SaveScanBaubrett → SaveScanZone → SaveConfirm
```

1. **Step 1**: Scan the Baubrett QR → validated against `database.json`
2. **Step 2**: Scan the Zone QR → validated against `zones.js` (ZONE_A … EAP24)
3. **Step 3**: Review summary → tap **Confirm & Save**
   - Writes a row to `baubrett_tracking.xlsx` (stored in app's document directory)
   - Columns: `BB_Nb | Zone | Date | Time`

### Flow 2 — Consult a Baubrett (2 steps)

```
Home → ConsultScan → ConsultResult
```

1. **Step 1**: Scan any Baubrett QR
2. **Step 2**: Instantly see:
   - SOM reference
   - Full accessories list
   - FP-NO numbers
   - Last known zone + timestamp

### History Screen

- Lists all saved tracking entries (newest first)
- Can be filtered to a single Baubrett (from ConsultResult)
- **Export** button shares `baubrett_tracking.xlsx` via iOS share sheet
  → AirDrop to Mac, email, save to Files, etc.

---

## 📦 Key Dependencies

| Library | Purpose |
|---|---|
| `expo-camera` | QR code scanning via iPhone camera |
| `expo-file-system` | Read/write files on device storage |
| `expo-sharing` | Export XLSX via iOS share sheet |
| `xlsx` | Parse and write Excel files in JS |
| `@react-navigation/stack` | Screen-to-screen navigation |
| `react-native-gesture-handler` | Swipe gestures for navigation |

---

## 🔐 iOS Permissions (already configured in app.json)

| Permission | Why |
|---|---|
| Camera | Scanning QR codes |
| Photo Library | (optional) exporting |

---

## 🗃 Data Files

| File | Location | Format |
|---|---|---|
| Source database | `app/src/data/database.json` | JSON (17 Baubretts) |
| Zone definitions | `app/src/data/zones.js` | JS module (38 zones) |
| Tracking log | Device: `Documents/baubrett_tracking.xlsx` | Excel (appended at each save) |

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| Camera permission denied | Settings → Privacy → Camera → Expo Go → Enable |
| "Unknown Baubrett" after scan | Check BB_Nb in database.json matches exactly |
| Expo Go shows blank screen | Shake phone → Reload, or restart `npx expo start` |
| Excel export not working | Ensure at least one entry has been saved first |
| QR codes not scanning | Ensure good lighting; hold steady 20–30 cm from code |

---

## 🔄 Regenerating after DB changes

When `MyDataBase.xlsx` is updated:

```bash
# In project root:
python qr_generation/generate_qr_codes.py
# Then restart the app so it picks up the new database.json
```

---

## 🚀 Building for Production (optional)

To create a standalone `.ipa` without Expo Go:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account (free)
eas login

# Build for iOS (requires Apple Developer account for device install)
eas build --platform ios --profile preview
```

---

*Built for iPhone · React Native 0.74 · Expo SDK 51 · March 2026*
