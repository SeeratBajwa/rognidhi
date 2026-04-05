import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='12344321', database='rognidhi')
cursor = conn.cursor(dictionary=True)

# Check shared records for jasnoor with dr@test.com
cursor.execute('''
SELECT sr.id, d.id as doc_id, d.file_path, d.document_type, sr.doctor_email
FROM shared_records sr
JOIN documents d ON sr.file_id = d.id
WHERE sr.doctor_email = 'dr@test.com'
ORDER BY d.email
''')

print("All shared records with dr@test.com:")
for row in cursor.fetchall():
    print(f"  Share ID: {row['id']}, Doc ID: {row['doc_id']}, File: {row['file_path']}, Type: {row['document_type']}")

conn.close()
