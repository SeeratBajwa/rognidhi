import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='12344321', database='rognidhi')
cursor = conn.cursor(dictionary=True)

# Get all documents for jasnoor
cursor.execute('''
SELECT id, file_path, document_type, created_at
FROM documents
WHERE email = 'jasnoor@test.com'
''')
print("Documents for jasnoor:")
for row in cursor.fetchall():
    print(f"  ID: {row['id']}, File: {row['file_path']}, Type: {row['document_type']}")

# Get shared records for jasnoor
cursor.execute('''
SELECT sr.doctor_email, d.file_path, d.document_type
FROM shared_records sr
JOIN documents d ON sr.file_id = d.id
WHERE d.email = 'jasnoor@test.com'
''')
print("\nShared records for jasnoor:")
for row in cursor.fetchall():
    print(f"  Doctor: {row['doctor_email']}, File: {row['file_path']}, Type: {row['document_type']}")

conn.close()
