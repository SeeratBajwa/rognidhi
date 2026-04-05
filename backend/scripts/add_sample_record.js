const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12344321',
  database: 'rognidhi'
});

db.connect((err) => {
  if (err) {
    console.log('DB Connection Failed:', err);
    return;
  }
  console.log('Connected to MySQL');

  // Add sample medical record
  const sql = "INSERT INTO documents (email, file_path, document_type) VALUES (?, ?, ?)";
  db.query(sql, ['patient@test.com', 'sample_medical_report.txt', 'prescription'], (err, result) => {
    if (err) {
      console.log('Error inserting record:', err);
    } else {
      console.log('Sample medical record added successfully');
    }
    db.end();
  });
});