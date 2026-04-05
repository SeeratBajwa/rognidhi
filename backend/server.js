const express = require("express");
const mysql = require("mysql2");
const { Pool } = require("pg");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ensure uploads folder exists
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// ✅ multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// 🔗 Database Connection (supports both MySQL and PostgreSQL)
let db;
let isPostgreSQL = false;

if (process.env.DATABASE_URL) {
  // Railway PostgreSQL
  isPostgreSQL = true;
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Local MySQL
  db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12344321", // 🔴 replace this
    database: "rognidhi"
  });
}

const connectDB = async () => {
  try {
    if (isPostgreSQL) {
      await db.connect();
      console.log("✅ Connected to PostgreSQL");

      const createSharedRecordsTable = `
        CREATE TABLE IF NOT EXISTS shared_records (
          id SERIAL PRIMARY KEY,
          patient_email VARCHAR(255) NOT NULL,
          doctor_email VARCHAR(255) NOT NULL,
          file_id INTEGER NOT NULL,
          shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (patient_email, doctor_email, file_id)
        );
      `;

      await db.query(createSharedRecordsTable);
      console.log("✅ shared_records table is ready");
    } else {
      db.connect((err) => {
        if (err) {
          console.log("❌ DB Connection Failed:", err);
        } else {
          console.log("✅ Connected to MySQL");

          const createSharedRecordsTable = `
            CREATE TABLE IF NOT EXISTS shared_records (
              id INT AUTO_INCREMENT PRIMARY KEY,
              patient_email VARCHAR(255) NOT NULL,
              doctor_email VARCHAR(255) NOT NULL,
              file_id INT NOT NULL,
              shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY unique_share (patient_email, doctor_email, file_id)
            ) ENGINE=InnoDB;
          `;

          db.query(createSharedRecordsTable, (tableErr) => {
            if (tableErr) {
              console.log("❌ Could not create shared_records table:", tableErr);
            } else {
              console.log("✅ shared_records table is ready");
            }
          });
        }
      });
    }
  } catch (err) {
    console.log("❌ DB Connection Failed:", err);
  }
};

connectDB();

// 🔧 Database Query Wrapper (supports both MySQL and PostgreSQL)
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgreSQL) {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result.rows || result);
      });
    } else {
      db.query(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }
  });
};

// 🌐 Serve built frontend (for production) - must be after API routes
const frontendPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log("✅ Frontend will be served from built files");
} else {
  console.log("⚠️  Built frontend not found, serving API only");
}

// ✅ serve uploaded files
app.use("/uploads", express.static(uploadPath));

// 🧪 Test Route
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// 🧪 Health check
app.get("/health", (req, res) => {
  res.send("backend is healthy");
});

// 📂 Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("UPLOAD HIT ✅");

  if (!req.file) {
    return res.status(400).send("No file");
  }

  const filePath = req.file.filename; // only filename
  const email = req.body.email;

  const sql = "INSERT INTO documents (email, file_path) VALUES (?, ?)";

  try {
    await query(sql, [email, filePath]);
    res.send("File uploaded & saved ✅");
  } catch (err) {
    console.log(err);
    res.send("DB error");
  }
});

// 🧾 USER INFO
app.get("/user-info/:email", async (req, res) => {
  const email = req.params.email;
  const sql = "SELECT name, email, role FROM users WHERE email = ?";

  try {
    const result = await query(sql, [email]);
    if (result.length === 0) return res.status(404).send("User not found");
    res.json(result[0]);
  } catch (err) {
    res.status(500).send("Error");
  }
});

// 📊 USER STATS
app.get("/user-stats/:email", async (req, res) => {
  const email = req.params.email;
  const sqlUser = "SELECT role FROM users WHERE email = ?";
  const sqlFiles = "SELECT COUNT(*) as totalFiles FROM documents WHERE email = ?";
  const sqlStorage = "SELECT SUM(LENGTH(file_path)) as storageEstimate FROM documents WHERE email = ?";

  try {
    const userResult = await query(sqlUser, [email]);
    if (userResult.length === 0) return res.status(404).send("User not found");

    const role = userResult[0].role;

    const [fileResult, storageResult] = await Promise.all([
      query(sqlFiles, [email]),
      query(sqlStorage, [email])
    ]);

    const totalFiles = fileResult[0].totalFiles || 0;
    const storageUsed = storageResult[0].storageEstimate || 0;
    const baseStats = {
      totalFiles,
      storageUsed: `${Math.max(0, (storageUsed * 0.1).toFixed(1))} MB`,
      recentFiles: []
    };

    const sqlRecent = "SELECT id, file_path, document_type, created_at FROM documents WHERE email = ? ORDER BY created_at DESC LIMIT 5";

    if (role === 'patient') {
      const sqlShareStats = "SELECT COUNT(DISTINCT doctor_email) AS sharedWith, COUNT(DISTINCT file_id) AS totalSharedReports FROM shared_records WHERE patient_email = ?";

      const [shareResult, recentFilesResult] = await Promise.all([
        query(sqlShareStats, [email]),
        query(sqlRecent, [email])
      ]);

      res.json({
        ...baseStats,
        sharedWith: shareResult[0].sharedWith || 0,
        totalSharedReports: shareResult[0].totalSharedReports || 0,
        totalPatients: 0,
        recentFiles: recentFilesResult || []
      });
    } else if (role === 'doctor') {
      const sqlDoctorStats = "SELECT COUNT(DISTINCT patient_email) AS totalPatients, COUNT(DISTINCT file_id) AS totalSharedReports FROM shared_records WHERE doctor_email = ?";

      const doctorResult = await query(sqlDoctorStats, [email]);

      res.json({
        ...baseStats,
        sharedWith: 0,
        totalSharedReports: doctorResult[0].totalSharedReports || 0,
        totalPatients: doctorResult[0].totalPatients || 0,
        recentFiles: []
      });
    } else {
      res.json({
        ...baseStats,
        sharedWith: 0,
        totalSharedReports: 0,
        totalPatients: 0,
        recentFiles: []
      });
    }
  } catch (err) {
    res.status(500).send("Error");
  }
});

// 📂 GET USER FILES
app.get("/my-files/:email", async (req, res) => {
  const email = req.params.email;

  const sql = "SELECT * FROM documents WHERE email=?";

  try {
    const result = await query(sql, [email]);
    res.json(result);
  } catch (err) {
    res.send("Error");
  }
});

// 🔗 Share records with a doctor
app.post("/share-records", async (req, res) => {
  const { patientEmail, doctorEmail, fileIds } = req.body;

  if (!patientEmail || !doctorEmail || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).send("Missing required fields");
  }

  const placeholders = fileIds.map(() => "(?, ?, ?)").join(",");
  const values = [];

  fileIds.forEach((fileId) => {
    values.push(patientEmail, doctorEmail, fileId);
  });

  const sql = isPostgreSQL
    ? `INSERT INTO shared_records (patient_email, doctor_email, file_id) VALUES ${placeholders} ON CONFLICT (patient_email, doctor_email, file_id) DO NOTHING`
    : `INSERT IGNORE INTO shared_records (patient_email, doctor_email, file_id) VALUES ${placeholders}`;

  try {
    await query(sql, values);
    res.send("Records shared successfully");
  } catch (err) {
    console.log("Share records error:", err);
    res.status(500).send("Error sharing records");
  }
});

// 📄 Get records a patient has shared
app.get("/shared-records/:patientEmail", async (req, res) => {
  const patientEmail = req.params.patientEmail;

  const sql = `
    SELECT
      sr.doctor_email,
      MAX(sr.shared_at) AS shared_at,
      d.id AS file_id,
      d.file_path,
      d.document_type
    FROM shared_records sr
    JOIN documents d ON sr.file_id = d.id
    WHERE sr.patient_email = ?
    GROUP BY sr.doctor_email, d.id, d.file_path, d.document_type
    ORDER BY sr.doctor_email, shared_at DESC
  `;

  try {
    const result = await query(sql, [patientEmail]);

    const grouped = [];
    const byDoctor = {};

    result.forEach((row) => {
      const key = row.doctor_email;
      if (!byDoctor[key]) {
        byDoctor[key] = {
          doctorEmail: row.doctor_email,
          sharedAt: row.shared_at,
          files: []
        };
        grouped.push(byDoctor[key]);
      }
      byDoctor[key].files.push({
        id: row.file_id,
        filePath: row.file_path,
        documentType: row.document_type || "document"
      });
    });

    res.json(grouped);
  } catch (err) {
    console.log("Shared records fetch error:", err);
    res.status(500).send([]);
  }
});

// 🗑️ Revoke a file share
app.delete("/revoke-share/:fileId", async (req, res) => {
  const fileId = req.params.fileId;
  const doctorEmail = req.query.doctorEmail;
  const patientEmail = req.query.patientEmail;

  if (!fileId || !patientEmail || !doctorEmail) {
    return res.status(400).send({ error: "Missing required revoke parameters" });
  }

  const sql = "DELETE FROM shared_records WHERE file_id = ? AND doctor_email = ? AND patient_email = ?";

  try {
    const result = await query(sql, [fileId, doctorEmail, patientEmail]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: "Share record not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.log("Revoke share error:", err);
    res.status(500).send({ error: "Error revoking share" });
  }
});

// 🩺 DOCTOR PATIENT LIST
app.get("/doctor-patients/:doctorEmail", async (req, res) => {
  const doctorEmail = req.params.doctorEmail;

  const sql = `
    SELECT
      u.name,
      u.email,
      COUNT(sr.file_id) AS sharedCount
    FROM users u
    JOIN shared_records sr ON u.email = sr.patient_email
    WHERE u.role = 'patient' AND sr.doctor_email = ?
    GROUP BY u.email, u.name
    ORDER BY sharedCount DESC, u.name ASC
  `;

  try {
    const result = await query(sql, [doctorEmail]);
    res.json({ patients: result });
  } catch (err) {
    console.log("Doctor patients fetch error:", err);
    res.status(500).send({ patients: [] });
  }
});

// 📄 PATIENT REPORTS
app.get("/patient-reports/:patientEmail", async (req, res) => {
  const patientEmail = req.params.patientEmail;
  const doctorEmail = req.query.doctorEmail;

  let sql;
  let params;

  if (doctorEmail) {
    sql = `
      SELECT
        d.id,
        d.file_path,
        d.document_type,
        d.created_at,
        MAX(sr.shared_at) AS shared_at
      FROM documents d
      JOIN shared_records sr ON d.id = sr.file_id
      WHERE d.email = ? AND sr.doctor_email = ?
      GROUP BY d.id, d.file_path, d.document_type, d.created_at
      ORDER BY shared_at DESC
    `;
    params = [patientEmail, doctorEmail];
  } else {
    sql = "SELECT * FROM documents WHERE email = ?";
    params = [patientEmail];
  }

  try {
    const result = await query(sql, params);

    const reports = (result || []).map((item) => ({
      file_path: item.file_path,
      document_type: item.document_type || (item.file_path.toLowerCase().includes('.pdf') ? 'lab_report' : 'document'),
      shared_at: item.shared_at || item.created_at || new Date().toISOString()
    }));

    res.json({ reports });
  } catch (err) {
    res.status(500).send({ reports: [] });
  }
});

// 🧠 AI SUMMARY
app.post("/ai-summary/:patientEmail", async (req, res) => {
  const patientEmail = req.params.patientEmail;
  const doctorEmail = req.body.doctorEmail;

  if (!patientEmail || !doctorEmail) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  // Check if doctor has access to patient's records
  const accessQuery = `
    SELECT COUNT(*) as access_count
    FROM shared_records sr
    JOIN documents d ON sr.file_id = d.id
    WHERE sr.doctor_email = ? AND d.email = ?
  `;

  try {
    const accessResult = await query(accessQuery, [doctorEmail, patientEmail]);
    if (accessResult[0].access_count === 0) {
      return res.status(403).send({ error: "Doctor does not have access to this patient's records" });
    }

    // Call Python AI script
    const { spawn } = require('child_process');
    const pythonExecutable = process.platform === 'win32'
      ? 'c:/Users/jasno/rognidhi/.venv/Scripts/python.exe'
      : 'c:/Users/jasno/rognidhi/.venv/bin/python';
    const pythonProcess = spawn(pythonExecutable, ['ai_server.py', patientEmail, doctorEmail], {
      cwd: __dirname
    });

    let summary = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      summary += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        return res.status(500).send({ error: errorOutput || "Failed to generate summary" });
      }

      res.json({ summary: summary.trim() });
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      res.status(500).send({ error: "Failed to start AI summary process" });
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send({ error: "Database error" });
  }
});

// 🗑️ DELETE FILE
app.delete("/delete-file/:id", async (req, res) => {
  console.log("DELETE endpoint hit!");
  const fileId = req.params.id;

  // First, get the file_path to delete the physical file
  const sqlSelect = "SELECT file_path FROM documents WHERE id=?";

  try {
    const result = await query(sqlSelect, [fileId]);
    if (result.length === 0) return res.send("File not found");

    const filePath = result[0].file_path;

    // Delete from database
    const sqlDelete = "DELETE FROM documents WHERE id=?";
    await query(sqlDelete, [fileId]);

    // Delete physical file
    const fullPath = path.join(uploadPath, filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.log("File delete error:", err);
      res.send("File deleted ✅");
    });
  } catch (err) {
    res.send("DB error");
  }
});

// ✏️ RENAME FILE
app.put("/rename-file/:id", async (req, res) => {
  const fileId = req.params.id;
  const newName = req.body.newName;

  if (!newName) return res.send("Name required");

  const sql = "UPDATE documents SET file_path=? WHERE id=?";

  try {
    await query(sql, [newName, fileId]);
    res.send("File renamed ✅");
  } catch (err) {
    res.send("DB error");
  }
});


// 🔐 SIGNUP API
app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  try {
    await query(sql, [name, email, password, role]);
    res.send("User registered successfully");
  } catch (err) {
    console.log(err);
    res.send("Error");
  }
});


// 🔑 LOGIN API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  try {
    const result = await query(sql, [email, password]);
    if (result.length > 0) {
      res.send("Login successful");
    } else {
      res.send("Invalid credentials");
    }
  } catch (err) {
    res.send("Error");
  }
});


// ✏️ Update profile
app.put("/update-profile", async (req, res) => {
  const { originalEmail, name, email, role } = req.body;
  if (!originalEmail || !name || !email || !role) {
    return res.status(400).send("Missing required fields");
  }

  const trimmedOriginal = originalEmail.trim().toLowerCase();
  const trimmedNew = email.trim().toLowerCase();

  try {
    // If email is changing, check if new email already exists
    if (trimmedOriginal !== trimmedNew) {
      const checkSql = "SELECT id FROM users WHERE LOWER(email) = ?";
      const result = await query(checkSql, [trimmedNew]);
      if (result.length > 0) {
        return res.status(409).send("Email already in use");
      }
    }

    // Proceed with update
    const sql = "UPDATE users SET name=?, email=?, role=? WHERE LOWER(email)=?";
    const updateResult = await query(sql, [name.trim(), trimmedNew, role, trimmedOriginal]);
    if (updateResult.affectedRows === 0) {
      return res.status(404).send("User not found");
    }
    res.send("Profile updated successfully");
  } catch (err) {
    console.log("Update profile error", err);
    res.status(500).send("Could not update profile");
  }
});


// 🔐 Change password
app.put("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const findSql = "SELECT * FROM users WHERE email = ? AND password = ?";
    const result = await query(findSql, [email, oldPassword]);
    if (result.length === 0) {
      return res.status(401).send("Old password is incorrect");
    }

    const updateSql = "UPDATE users SET password = ? WHERE email = ?";
    await query(updateSql, [newPassword, email]);
    res.send("Password changed successfully");
  } catch (err) {
    console.log("Change password error", err);
    res.status(500).send("Could not change password");
  }
});

// 🚀 Start Server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});

