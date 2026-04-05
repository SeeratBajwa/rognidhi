import os
os.chdir(r'c:\Users\jasno\rognidhi\backend')

from ai_server import extract_text_from_file

file_path = r'uploads\1775326328067-Microsoft Word - Sample Written History and Physical Examination.doc - UMNwriteup.pdf'
content = extract_text_from_file(file_path)

# Find the Chief Complaint section
if 'Chief Complaint' in content:
    idx = content.find('Chief Complaint')
    section = content[idx:idx+1000]
    print("=== CHIEF COMPLAINT SECTION ===")
    print(section)
    print("\n\n")
