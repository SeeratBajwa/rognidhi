import os
from pathlib import Path

base = Path(__file__).resolve().parent
renames = {
    'add_sample_record.js': 'add_sample_record.js',
    'check_jasnoor.py': 'check_patient_documents.py',
    'check_shared.py': 'check_shared_records.py',
    'fix_jasnoor_filepath.py': 'fix_patient_filepath.py',
    'fix_upload_paths.py': 'normalize_upload_paths.py',
    'inspect_cc_section.py': 'inspect_chief_complaint_section.py',
    'list_users.py': 'list_db_users.py',
    'test_jasnoor_summary.py': 'test_jasnoor_summary.py',
    'test_medical_ai.py': 'test_ai_summary.py',
    'test_pdf_extraction.py': 'test_pdf_extraction.py',
    'test_summary_simple.py': 'test_simple_summary.py',
    'verify_shared_records.py': 'verify_shared_records.py',
    'view_document_content.py': 'view_report_content.py'
}

for old_name, new_name in renames.items():
    old_path = base / old_name
    new_path = base / new_name
    if old_path.exists() and old_path != new_path:
        old_path.rename(new_path)
        print(f"Renamed {old_name} -> {new_name}")
