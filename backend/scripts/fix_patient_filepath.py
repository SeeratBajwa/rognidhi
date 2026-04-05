import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='12344321', database='rognidhi')
cursor = conn.cursor()

# Update jasnoor's "full body test.pdf" to the actual filename
sql = "UPDATE documents SET file_path = %s WHERE email = %s AND file_path = %s"
cursor.execute(sql, ('1775140655350-UEC310_MST_E_MAR25.pdf', 'jasnoor@test.com', 'full body test.pdf'))

if cursor.rowcount > 0:
    conn.commit()
    print(f"✅ Updated {cursor.rowcount} record(s)")
    
    # Verify the update
    cursor.execute("SELECT id, file_path, document_type FROM documents WHERE email = 'jasnoor@test.com'")
    print("\nUpdated documents for jasnoor:")
    for row in cursor.fetchall():
        print(f"  ID: {row[0]}, File: {row[1]}, Type: {row[2]}")
else:
    print("❌ No records updated - file not found")

conn.close()
