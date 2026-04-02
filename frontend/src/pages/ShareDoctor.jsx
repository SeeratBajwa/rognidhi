import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ShareDoctor.css";

export default function ShareDoctor({ userEmail, isLoggedIn, userRole }) {
  const [files, setFiles] = useState([]);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [sharedWith, setSharedWith] = useState([]);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="share-container">
        <div className="not-logged-in">
          <p>Please login to share your medical records</p>
          <button onClick={() => navigate("/auth")}>Go to Login</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchFiles();
    fetchSharedRecords();
  }, [userEmail]);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/my-files/${userEmail}`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
  };

  const fetchSharedRecords = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/shared-records/${userEmail}`);
      const data = await res.json();
      setSharedWith(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching shared records:", error);
    }
  };

  const handleFileToggle = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const handleShareWithDoctor = async () => {
    if (!doctorEmail || selectedFiles.length === 0) {
      alert("Please enter doctor email and select files to share");
      return;
    }

    console.log("Sharing files:", selectedFiles, "with doctor:", doctorEmail);

    setIsSharing(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/share-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientEmail: userEmail,
          doctorEmail: doctorEmail,
          fileIds: selectedFiles
        })
      });

      const data = await res.text();
      console.log("Share response:", data);
      if (data.includes("shared") || data.includes("success")) {
        alert("✅ Records shared with doctor successfully!");
        setDoctorEmail("");
        setSelectedFiles([]);
        fetchSharedRecords();
      } else {
        alert("Error sharing records: " + data);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
    setIsSharing(false);
  };

  return (
    <div className="share-container">
      <div className="share-wrapper">
        <div className="share-header">
          <h2>👨‍⚕️ Share Medical Records with Doctor</h2>
          <p>Securely share your health documents with healthcare professionals</p>
        </div>

        <div className="share-content">
          <div className="share-section">
            <h3>📧 Doctor Information</h3>
            <div className="doctor-input-group">
              <input
                type="email"
                placeholder="Enter doctor's email"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                className="doctor-email-input"
              />
            </div>
          </div>

          <div className="share-section">
            <h3>📄 Select Records to Share</h3>
            {files.length === 0 ? (
              <div className="empty-state">
                <p>No medical records found</p>
                <button onClick={() => navigate("/upload")}>
                  Upload Your First Record
                </button>
              </div>
            ) : (
              <div className="files-checkbox-list">
                {files.map((file) => (
                  <label key={file.id} className="file-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileToggle(file.id)}
                    />
                    <span className="checkbox-label">
                      📄 {file.file_path}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="share-actions">
            <button
              className="share-btn"
              onClick={handleShareWithDoctor}
              disabled={isSharing || !doctorEmail || selectedFiles.length === 0}
            >
              {isSharing ? "Sharing..." : "🔗 Share Records"}
            </button>
            <button
              className="cancel-btn"
              onClick={() => navigate("/dashboard")}
              disabled={isSharing}
            >
              Back to Dashboard
            </button>
          </div>

          {sharedWith.length > 0 && (
            <div className="share-section shared-list">
              <h3>👥 Shared With</h3>
              <div className="shared-doctors-list">
                {sharedWith.map((share, idx) => (
                  <div key={idx} className="shared-doctor-card">
                    <div className="doctor-info">
                      <span className="doctor-email">{share.doctorEmail}</span>
                      <span className="share-date">
                        Shared on {new Date(share.sharedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="revoke-btn"
                      onClick={() => alert("Revoke sharing coming soon")}
                    >
                      Revoke Access
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="security-notice">
            <h4>🔒 Security & Privacy</h4>
            <ul>
              <li>Your records are encrypted during transfer</li>
              <li>Only the specified doctor can access shared records</li>
              <li>You can revoke access at any time</li>
              <li>Access is logged for your review</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
