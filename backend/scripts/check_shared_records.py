import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='12344321', database='rognidhi')
cursor = conn.cursor(dictionary=True)
cursor.execute('''
SELECT d.id, d.file_path, d.document_type, sr.doctor_email
FROM documents d
JOIN shared_records sr ON d.id = sr.file_id
WHERE d.email = 'patient@test.com' AND sr.doctor_email = 'doctor2@test.com'
''')
results = cursor.fetchall()
for row in results:
    print(f"ID: {row['id']}, File: {row['file_path']}, Type: {row['document_type']}, Doctor: {row['doctor_email']}")
conn.close()
