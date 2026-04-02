import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Upload.css";

export default function Upload({ userEmail, isLoggedIn }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordType, setRecordType] = useState("prescription");
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="upload-container">
        <div className="not-logged-in">
          <p>Please login to upload files</p>
          <button onClick={() => navigate("/auth")}>Go to Login</button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", userEmail);
    formData.append("recordType", recordType);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.text();
      
      setUploadProgress(100);
      
      if (data.includes("uploaded")) {
        alert("✅ File uploaded successfully!");
        setFile(null);
        setUploadProgress(0);
        document.getElementById("fileInput").value = "";
        setTimeout(() => navigate("/my-files"), 1500);
      } else {
        alert("❌ Upload failed: " + data);
      }
    } catch (error) {
      alert("Error uploading file: " + error.message);
    }
    
    setIsUploading(false);
  };

  return (
    <div className="upload-container">
      <div className="upload-wrapper">
        <h2>📤 Upload Medical Records</h2>
        <p>Securely upload prescriptions, lab reports, medical certificates, and other health documents</p>

        <div className="record-type-selector">
          <label>Record Type:</label>
          <div className="type-options">
            <button 
              className={`type-btn ${recordType === 'prescription' ? 'active' : ''}`}
              onClick={() => setRecordType('prescription')}
            >
              💊 Prescription
            </button>
            <button 
              className={`type-btn ${recordType === 'lab' ? 'active' : ''}`}
              onClick={() => setRecordType('lab')}
            >
              🧪 Lab Report
            </button>
            <button 
              className={`type-btn ${recordType === 'xray' ? 'active' : ''}`}
              onClick={() => setRecordType('xray')}
            >
              🖼️ X-Ray/Scan
            </button>
            <button 
              className={`type-btn ${recordType === 'certificate' ? 'active' : ''}`}
              onClick={() => setRecordType('certificate')}
            >
              📜 Medical Certificate
            </button>
            <button 
              className={`type-btn ${recordType === 'other' ? 'active' : ''}`}
              onClick={() => setRecordType('other')}
            >
              📄 Other Document
            </button>
          </div>
        </div>

        <div className="upload-section">
          <div className={`upload-box ${file ? 'has-file' : ''}`}>
            {file ? (
              <div className="file-selected">
                <div className="file-icon-large">📄</div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button 
                  className="change-btn"
                  onClick={() => {
                    setFile(null);
                    document.getElementById("fileInput").value = "";
                  }}
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="upload-icon">
                <div className="icon">⬆️</div>
                <p>Drag & drop your file here</p>
                <p className="or-text">or</p>
              </div>
            )}
            
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              className="file-input"
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: uploadProgress + '%' }}
                ></div>
              </div>
              <p className="progress-text">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <div className="upload-actions">
            <button 
              className="upload-btn"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? 'Uploading...' : '📤 Upload File'}
            </button>
            <button 
              className="cancel-btn"
              onClick={() => navigate("/my-files")}
              disabled={isUploading}
            >
              View My Files
            </button>
          </div>

          <div className="upload-info">
            <h4>📋 Upload Guidelines</h4>
            <ul>
              <li>Supported formats: PDF, DOC, DOCX, JPG, PNG, XLS (Medical reports preferred as PDF)</li>
              <li>Maximum file size: 50 MB per document</li>
              <li>All files are encrypted and HIPAA compliant</li>
              <li>Share with your doctor or manage records easily</li>
              <li>Keep organized medical history in one secure place</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
