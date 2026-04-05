import sys
import os

os.chdir(r'c:\Users\jasno\rognidhi\backend')
sys.path.insert(0, r'c:\Users\jasno\rognidhi\backend')

from ai_server import generate_medical_summary

# Generate summary
summary = generate_medical_summary('jasnoor@test.com', 'dr@test.com')
print("=" * 80)
print("CLINICAL SUMMARY:")
print("=" * 80)
print(summary)
