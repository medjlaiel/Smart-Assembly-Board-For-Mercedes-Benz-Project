#!/usr/bin/env python3
"""
convert_mes_protocols.py
────────────────────────
Reads mes_protocols.xlsx and converts it to JSON format grouped by FP-NO.
Outputs: app/src/data/mes_protocols.json

Usage:
  pip install pandas openpyxl
  python convert_mes_protocols.py
"""
import json
import os
import pandas as pd
from collections import defaultdict

EXCEL_PATH = 'mes_protocols.xlsx'
JSON_OUT = 'app/src/data/mes_protocols.json'

def convert():
    # Read Excel file
    df = pd.read_excel(EXCEL_PATH)
    
    # Clean column names
    df.columns = df.columns.str.strip()
    
    # Group by FP-NO
    protocols = defaultdict(list)
    
    for _, row in df.iterrows():
        fp_no = str(row['FP-NO']).strip()
        if pd.isna(fp_no) or fp_no == '':
            continue
            
        # Extract relevant data, handling NaN values
        line_data = {
            'index': int(row['Index']) if not pd.isna(row['Index']) else None,
            'branche': str(row['Branche']).strip() if not pd.isna(row['Branche']) else '',
            'exigences': str(row['Exigences / Spécifications']).strip() if not pd.isna(row['Exigences / Spécifications']) else '',
            'deviation': str(row['Déviation']).strip() if not pd.isna(row['Déviation']) else '',
            'faisceau': str(row['Faisceau']).strip() if not pd.isna(row['Faisceau']) else '',
        }
        protocols[fp_no].append(line_data)
    
    # Sort each FP-NO's lines by index
    for fp_no in protocols:
        protocols[fp_no].sort(key=lambda x: x['index'] if x['index'] is not None else 0)
    
    # Create final structure
    result = {
        fp_no: {
            'lines': lines,
            'totalLines': len(lines)
        }
        for fp_no, lines in protocols.items()
    }
    
    # Save to JSON
    os.makedirs(os.path.dirname(JSON_OUT) or '.', exist_ok=True)
    with open(JSON_OUT, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f'[OK] Converted {len(protocols)} FP-NO entries to {JSON_OUT}')

if __name__ == '__main__':
    convert()