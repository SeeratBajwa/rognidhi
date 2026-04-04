import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Upload.css";

export default function Upload({ userEmail, isLoggedIn }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordType, setRecordType] = useState("prescription");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="upload-container">
        <div className="not-logged-in card fade-in">
          <div className="auth-icon">🔒</div>
          <h3>Authentication Required</h3>
          <p>Please login to upload your medical files securely</p>
          <button className="btn" onClick={() => navigate("/auth")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadStatus('error');
      alert('Please select a valid file type: PDF, DOC, DOCX, JPG, PNG, or XLS');
      return;
    }

    if (selectedFile.size > maxSize) {
      setUploadStatus('error');
      alert('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    setUploadStatus(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", userEmail);
    formData.append("recordType", recordType);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
      });

      clearInterval(progressInterval);
      const data = await res.text();

      setUploadProgress(100);

      if (data.includes("uploaded")) {
        setUploadStatus('success');
        setTimeout(() => {
          setFile(null);
          setUploadProgress(0);
          setUploadStatus(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          navigate("/my-files");
        }, 1500);
      } else {
        setUploadStatus('error');
        alert("Upload failed: " + data);
      }
    } catch (error) {
      setUploadStatus('error');
      alert("Error uploading file: " + error.message);
    }

    setIsUploading(false);
  };

  const recordTypes = [
    { id: 'prescription', label: 'Prescription', icon: '💊' },
    { id: 'lab', label: 'Lab Report', icon: '🧪' },
    { id: 'xray', label: 'X-Ray/Scan', icon: '🩻' },
    { id: 'certificate', label: 'Medical Certificate', icon: '📋' },
    { id: 'other', label: 'Other Document', icon: '📄' }
  ];

  return (
    <div className="upload-container">
      <div className="upload-wrapper">
        <div className="upload-header slide-up">
          <div className="header-icon">📤</div>
          <h1>Upload Medical Records</h1>
          <p>Securely upload and organize your health documents with advanced encryption and HIPAA compliance.</p>
        </div>

        <div className="record-type-selector card slide-up" style={{ '--delay': 1 }}>
          <h3>📋 Select Record Type</h3>
          <div className="type-options">
            {recordTypes.map((type, index) => (
              <button
                key={type.id}
                className={`type-btn ${recordType === type.id ? 'active' : ''}`}
                onClick={() => setRecordType(type.id)}
                style={{ '--index': index }}
              >
                <span className="type-icon">{type.icon}</span>
                <span className="type-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="upload-section card slide-up" style={{ '--delay': 2 }}>
          <div
            className={`upload-box ${file ? 'has-file' : ''} ${isDragOver ? 'drag-over' : ''} ${uploadStatus ? uploadStatus : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {file ? (
              <div className="file-selected bounce-in">
                <div className="file-icon-large">📄</div>
                <div className="file-info">
                  <h4 className="file-name">{file.name}</h4>
                  <p className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                  </p>
                </div>
                <button
                  className="change-btn btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setUploadStatus(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isUploading}
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="upload-prompt">
                <div className="upload-icon">
                  <div className="cloud-icon">☁️</div>
                  <h3>Drop your medical file here</h3>
                  <p>or click to browse your files</p>
                  <div className="supported-formats">
                    <span>PDF</span>
                    <span>DOC</span>
                    <span>DOCX</span>
                    <span>JPG</span>
                    <span>PNG</span>
                    <span>XLS</span>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="file-input"
              disabled={isUploading}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
            />
          </div>

          {isUploading && (
            <div className="progress-section slide-up">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="progress-text">
                {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing file...'}
              </p>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="status-message success slide-up">
              <span className="status-icon">✅</span>
              <span>File uploaded successfully! Redirecting...</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="status-message error slide-up">
              <span className="status-icon">❌</span>
              <span>Upload failed. Please try again.</span>
            </div>
          )}

          <div className="upload-actions slide-up" style={{ '--delay': 3 }}>
            <button
              className="btn upload-btn"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <span className="loading-spinner"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Upload File
                </>
              )}
            </button>
            <button
              className="btn btn-secondary cancel-btn"
              onClick={() => navigate("/my-files")}
              disabled={isUploading}
            >
              <span>📁</span>
              View My Files
            </button>
          </div>
        </div>

        <div className="upload-info card slide-up" style={{ '--delay': 4 }}>
          <h4>🛡️ Guidelines</h4>
          <div className="info-grid">
            
            <div className="info-item">
              <span className="info-icon">📏</span>
              <div>
                <strong>File Limits</strong>
                <p>Maximum 50MB per document</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📋</span>
              <div>
                <strong>Supported Formats</strong>
                <p>PDF, DOC, DOCX, JPG, PNG, XLS files accepted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
