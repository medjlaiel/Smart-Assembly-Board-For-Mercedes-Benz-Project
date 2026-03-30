#!/usr/bin/env python3
"""
generate_qr_codes.py
────────────────────
Reads MyDataBase.xlsx, extracts BB_Nb values, and generates:
  1. Individual QR code PNGs  → qr_codes/baubretts/<BB_Nb>.png
  2. A printable HTML sheet   → qr_codes/all_baubrett_qrcodes.html

Usage:
  pip install qrcode pillow openpyxl pandas
  python generate_qr_codes.py

Requirements: MyDataBase.xlsx must be in the same folder (or update EXCEL_PATH).
"""
import os
import json
import re
import base64
import pandas as pd
import qrcode
from PIL import Image, ImageDraw, ImageFont

# ── Configuration ─────────────────────────────────────────────────────────────
EXCEL_PATH = 'MyDataBase.xlsx'
OUTPUT_DIR = 'qr_codes/baubretts'
HTML_OUT   = 'qr_codes/all_baubrett_qrcodes.html'
DB_JSON    = 'app/src/data/database.json'
# ──────────────────────────────────────────────────────────────────────────────


def parse_json_list(val):
    """Parse the messy JSON strings stored in the Accessories / FP-NO columns."""
    if not isinstance(val, str):
        return []
    val = re.sub(r'Here.*?list of strings:\s*\n*', '', val, flags=re.DOTALL)
    val = re.sub(r'>\s*', '', val)
    try:
        return json.loads(val.strip())
    except Exception:
        return re.findall(r'"([^"]+)"', val)


def load_database(excel_path: str):
    """Read Excel and return a clean list of records."""
    df = pd.read_excel(excel_path)
    df['BB_Nb'] = df['BB_Nb'].astype(str).str.strip().str.lstrip("'")
    records = []
    for _, row in df.iterrows():
        records.append({
            'BB_Nb':       str(row['BB_Nb']).strip(),
            'SOM':         str(row['SOM']).strip(),
            'Accessories': parse_json_list(row.get('Accessories', '')),
            'FP_NO':       parse_json_list(row.get('FP-NO', '')),
        })
    return records


def make_qr_image(text: str, output_path: str):
    """Generate a labelled QR code PNG at output_path."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white').convert('RGB')

    # Add label strip below the QR code
    w, h = img.size
    labeled = Image.new('RGB', (w, h + 54), 'white')
    labeled.paste(img, (0, 0))
    draw = ImageDraw.Draw(labeled)
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
    except OSError:
        font = ImageFont.load_default()
    label = f'BB: {text}'
    bbox  = draw.textbbox((0, 0), label, font=font)
    tw    = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, h + 12), label, fill='black', font=font)
    labeled.save(output_path)


def make_html_sheet(records, qr_dir, out_path):
    """Build a self-contained printable HTML page embedding all QR images."""
    cards = ''
    for rec in records:
        bb   = rec['BB_Nb']
        path = os.path.join(qr_dir, f'{bb}.png')
        if not os.path.exists(path):
            continue
        with open(path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode()
        cards += f"""
    <div class="card">
      <img src="data:image/png;base64,{b64}" alt="QR {bb}">
      <div class="label">BB: {bb}</div>
      <div class="sub">SOM: {rec['SOM']}</div>
    </div>"""

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Baubrett QR Codes</title>
<style>
body {{ font-family: Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 20px; }}
h1 {{ color: #0A5FBF; text-align: center; margin-bottom: 24px; font-size: 22px; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 16px; }}
.card {{
  background: white; border: 1px solid #CBD5E1; border-radius: 12px;
  padding: 16px; text-align: center;
  box-shadow: 0 2px 8px rgba(10,95,191,0.10);
  page-break-inside: avoid;
}}
.card img {{ width: 160px; height: 160px; }}
.label {{ font-size: 14px; font-weight: 700; color: #0F172A; margin-top: 8px; }}
.sub   {{ font-size: 11px; color: #94A3B8; margin-top: 2px; }}
@media print {{
  body {{ background: white; }}
  .card {{ border: 1px solid #ccc; }}
}}
</style>
</head>
<body>
<h1>📦 Baubrett QR Codes — {len(records)} Baubretts</h1>
<div class="grid">{cards}
</div>
</body>
</html>"""
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(DB_JSON) or '.', exist_ok=True)

    print(f'Reading {EXCEL_PATH}…')
    records = load_database(EXCEL_PATH)
    print(f'  Found {len(records)} Baubretts')

    # Save clean JSON (used by the mobile app)
    with open(DB_JSON, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f'  JSON database → {DB_JSON}')

    # Generate individual QR PNGs
    for rec in records:
        bb   = rec['BB_Nb']
        path = os.path.join(OUTPUT_DIR, f'{bb}.png')
        make_qr_image(bb, path)
        print(f'  QR → {path}')

    # Build printable HTML sheet
    make_html_sheet(records, OUTPUT_DIR, HTML_OUT)
    print(f'\nPrintable sheet → {HTML_OUT}')
    print('\nDone ✅')


if __name__ == '__main__':
    main()
