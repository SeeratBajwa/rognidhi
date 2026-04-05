import sys
import os

# Change to backend directory first
os.chdir(r'c:\Users\jasno\rognidhi\backend')

# Add backend to path
sys.path.insert(0, r'c:\Users\jasno\rognidhi\backend')

from ai_server import get_patient_reports, generate_medical_summary

# Test with jasnoor and dr@test.com
reports = get_patient_reports('jasnoor@test.com', 'dr@test.com')

print(f"✅ Found {len(reports)} shared report(s)\n")

for i, report in enumerate(reports, 1):
    print(f"📄 Report {i}: {report['file_path']} (Type: {report['type']})")
    print(f"   Content length: {len(report['content'])} characters")
    if report['content']:
        print(f"   Preview: {report['content'][:200]}...")
    else:
        print(f"   [No content extracted]")
    print()

# Generate summary - note: pass patient and doctor emails, NOT the reports list
summary = generate_medical_summary('jasnoor@test.com', 'dr@test.com')
print("=" * 60)
print("CLINICAL SUMMARY:")
print("=" * 60)
print(summary)
