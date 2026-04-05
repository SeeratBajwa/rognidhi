import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='12344321', database='rognidhi')
cursor = conn.cursor()
cursor.execute('SELECT email, name FROM users WHERE role="patient"')
print("Patients:")
for row in cursor.fetchall():
    print(f"  {row[1]} ({row[0]})")
    
cursor.execute('SELECT email, name FROM users WHERE role="doctor"')
print("\nDoctors:")
for row in cursor.fetchall():
    print(f"  {row[1]} ({row[0]})")
    
conn.close()
