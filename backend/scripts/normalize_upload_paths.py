import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='12344321', database='rognidhi')
cursor = conn.cursor()

# Find all file paths that start with "uploads\"
cursor.execute("SELECT id, file_path FROM documents WHERE file_path LIKE 'uploads\\%'")

rows = cursor.fetchall()
print(f"Found {len(rows)} records with 'uploads\\' prefix\n")

for file_id, file_path in rows:
    # Remove the "uploads\" prefix
    new_path = file_path.replace("uploads\\", "", 1)
    sql = "UPDATE documents SET file_path = %s WHERE id = %s"
    cursor.execute(sql, (new_path, file_id))
    print(f"✅ ID {file_id}: {file_path} → {new_path}")

conn.commit()
print(f"\n✅ Updated {cursor.rowcount} record(s)")

conn.close()
