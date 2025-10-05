# convert_excel.py
# Usage: python convert_excel.py input.xlsx data/assignments.json
# Converts Excel sheet with Arabic headers to hashed JSON for secure lookup

import sys, json, hashlib, pandas as pd

# Must match the SALT constant in script.js
SALT = "EPSP-Berriane-2025"

def hash_nin(nin: str) -> str:
    """Return SHA-256 hash of SALT + NIN"""
    return hashlib.sha256((SALT + nin.strip()).encode('utf-8')).hexdigest()

def main():
    if len(sys.argv) < 3:
        print("Usage: python convert_excel.py input.xlsx output.json")
        sys.exit(1)
    infile, outfile = sys.argv[1], sys.argv[2]

    # Load Excel with Arabic headers
    df = pd.read_excel(infile, dtype=str).fillna("")

    # Rename columns (Arabic → internal keys)
    df = df.rename(columns={
        "رقم بطاقة التعريف البيومترية": "nin",
        "اللقب": "lastname",
        "الاسم": "firstname",
        "اسم الاب": "fathername",
        "تاريخ الميلاد": "birthdate",
        "القسم": "assigned_class",
        "الجناح": "wing",
        "مركز الامتحان": "exam_center"
    })

    out = {}

    for _, row in df.iterrows():
        nin = str(row.get('nin', '')).strip()
        if not nin:
            continue
        hashed = hash_nin(nin)
        out[hashed] = {
            "exam_center": row.get("exam_center", ""),
            "lastname": row.get("lastname", ""),
            "firstname": row.get("firstname", ""),
            "fathername": row.get("fathername", ""),
            "birthdate": row.get("birthdate", ""),
            "assigned_class": row.get("assigned_class", ""),
            "wing": row.get("wing", "")
        }

    with open(outfile, 'w', encoding='utf8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"✅ Wrote {len(out)} hashed records to {outfile}")

if __name__ == "__main__":
    main()
