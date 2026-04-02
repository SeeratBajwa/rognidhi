import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyFiles.css";

export default function MyFiles({ userEmail, isLoggedIn }) {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="myfiles-container">
        <div className="not-logged-in">
          <p>Please login to view your files</p>
          <button onClick={() => navigate("/auth")}>Go to Login</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchFiles();
  }, [userEmail]);

  useEffect(() => {
    filterAndSortFiles();
  }, [files, searchTerm, sortBy]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/my-files/${userEmail}`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
    setIsLoading(false);
  };

  const filterAndSortFiles = () => {
    let filtered = files.filter(file =>
      file.file_path.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "oldest") {
      filtered = filtered.reverse();
    } else if (sortBy === "name") {
      filtered = filtered.sort((a, b) =>
        a.file_path.localeCompare(b.file_path)
      );
    }

    setFilteredFiles(filtered);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/delete-file/${fileId}`,
        { method: "DELETE" }
      );
      const data = await res.text();

      if (data.includes("successfully")) {
        alert("✅ File deleted");
        fetchFiles();
      } else {
        alert("❌ Error: " + data);
      }
    } catch (error) {
      alert("Error deleting file: " + error.message);
    }
  };

  const handleRename = async (fileId, oldName) => {
    const newName = prompt("Enter new file name:", oldName);
    if (!newName || newName === oldName) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/rename-file/${fileId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newName })
        }
      );
      const data = await res.text();

      if (data.includes("successfully")) {
        alert("✅ File renamed");
        fetchFiles();
      } else {
        alert("❌ Error: " + data);
      }
    } catch (error) {
      alert("Error renaming file: " + error.message);
    }
  };

  const handleDownload = (filename) => {
    const link = document.createElement("a");
    link.href = `http://127.0.0.1:5000/uploads/${filename}`;
    link.download = filename;
    link.click();
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    const icons = {
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      xls: "📗",
      xlsx: "📗",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      txt: "📄",
      zip: "📦",
      rar: "📦"
    };
    return icons[ext] || "📄";
  };

  return (
    <div className="myfiles-container">
      <div className="myfiles-header">
        <h2>🏥 My Medical Records</h2>
        <p>View, manage, and organize all your medical documents in one secure location</p>
        <button className="upload-btn-header" onClick={() => navigate("/upload")}>
          ➕ Upload New Record
        </button>
      </div>

      <div className="search-sort-section">
        <input
          type="text"
          placeholder="🔍 Search your records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="newest">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      {isLoading ? (
        <div className="loading">Loading your files...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="no-files">
          <div className="empty-icon">📁</div>
          <p>
            {files.length === 0
              ? "No files uploaded yet"
              : "No files match your search"}
          </p>
          <button onClick={() => navigate("/upload")}>Upload Your First File</button>
        </div>
      ) : (
        <div className="files-grid">
          {filteredFiles.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-header">
                <span className="file-icon">{getFileIcon(file.file_path)}</span>
              </div>

              <div className="file-content">
                <h4 className="file-name">{file.file_path}</h4>
                {file.document_type && (
                  <p className="file-type">
                    📋 {file.document_type.charAt(0).toUpperCase() + file.document_type.slice(1)}
                  </p>
                )}
                <p className="file-date">
                  📅 {new Date(file.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>

              <div className="file-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() =>
                    window.open(
                      `http://127.0.0.1:5000/uploads/${file.file_path}`,
                      "_blank"
                    )
                  }
                  title="View file"
                >
                  👁️
                </button>
                <button
                  className="action-btn download-btn"
                  onClick={() => handleDownload(file.file_path)}
                  title="Download file"
                >
                  ⬇️
                </button>
                <button
                  className="action-btn rename-btn"
                  onClick={() => handleRename(file.id, file.file_path)}
                  title="Rename file"
                >
                  ✏️
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(file.id)}
                  title="Delete file"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="file-stats">
        <p>📊 Total Files: {files.length}</p>
        <p>🔍 Showing: {filteredFiles.length} file(s)</p>
      </div>
    </div>
  );
}
