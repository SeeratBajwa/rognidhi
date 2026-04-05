import os
import sys

os.chdir(r'c:\Users\jasno\rognidhi\backend')
sys.path.insert(0, r'c:\Users\jasno\rognidhi\backend')

from ai_server import get_db_connection, extract_text_from_file

# Get the shared document 
conn = get_db_connection()
cursor = conn.cursor(dictionary=True)
cursor.execute('''
SELECT d.file_path
FROM documents d
JOIN shared_records sr ON d.id = sr.file_id
WHERE sr.doctor_email = 'dr@test.com' AND d.email = 'jasnoor@test.com'
LIMIT 1
''')

result = cursor.fetchone()
if result:
    file_path = os.path.join('uploads', result['file_path'])
    print(f"Document: {result['file_path']}\n")
    content = extract_text_from_file(file_path)
    print("FULL CONTENT:")
    print("=" * 80)
    print(content)
    print("=" * 80)
else:
    print("No document found")

conn.close()
