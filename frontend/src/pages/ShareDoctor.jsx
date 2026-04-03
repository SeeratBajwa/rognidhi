import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ShareDoctor.css";

export default function ShareDoctor({ userEmail, isLoggedIn }) {
  const [files, setFiles] = useState([]);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [sharedWith, setSharedWith] = useState([]);
  const navigate = useNavigate();

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/my-files/${userEmail}`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
  }, [userEmail]);

  const fetchSharedRecords = useCallback(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/shared-records/${userEmail}`);
      const data = await res.json();
      setSharedWith(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching shared records:", error);
    }
  }, [userEmail]);

  useEffect(() => {
    if (isLoggedIn && userEmail) {
      const fetchData = async () => {
        await fetchFiles();
        await fetchSharedRecords();
      };
      fetchData();
    }
  }, [isLoggedIn, userEmail, fetchFiles, fetchSharedRecords]);

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

  const handleFileToggle = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const handleRevokeAccess = async (shareId) => {
    if (!confirm("Are you sure you want to revoke access to this file? The doctor will no longer be able to view it.")) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/revoke-share/${shareId}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.success) {
        alert("Access revoked successfully.");
        fetchSharedRecords(); // Refresh the list
      } else {
        alert("Error revoking access: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error: " + error.message);
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
        alert("Records shared with doctor successfully.");
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
          <h2>Share Medical Records</h2>
          <p>Securely share your health documents with healthcare professionals</p>
        </div>

        <div className="share-content">
          <div className="share-section">
            <h3>Doctor Information</h3>
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
            <h3>Select Records to Share</h3>
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
                      {file.file_path}
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
              {isSharing ? "Sharing..." : "Share Records"}
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
              <h3>Currently Shared Records</h3>
              <div className="shared-doctors-list">
                {sharedWith.map((share, idx) => (
                  <div key={idx} className="shared-doctor-card">
                    <div className="doctor-info">
                      <div className="doctor-header">
                        <span className="doctor-email">{share.doctorEmail}</span>
                        <span className="share-date">
                          Shared on {new Date(share.sharedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="shared-files">
                        <h4>Shared Files:</h4>
                        <ul className="files-list">
                          {share.files.map((file, fileIdx) => (
                            <li key={fileIdx} className="shared-file-item">
                              <span className="file-name">{file.filePath}</span>
                              <span className="file-type">({file.documentType})</span>
                              <button
                                className="revoke-file-btn"
                                onClick={() => handleRevokeAccess(file.id)}
                                title="Revoke access to this file"
                              >
                                Revoke
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="security-notice">
            <h4>Security & Privacy</h4>
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
