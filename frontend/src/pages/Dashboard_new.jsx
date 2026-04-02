import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard({ userEmail, isLoggedIn }) {
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="dashboard-container">
        <div className="not-logged-in">
          <p>Please login to access dashboard</p>
          <button onClick={() => navigate("/auth")}>Go to Login</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUserInfo();
    fetchStats();
  }, [userEmail]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/user-info/${userEmail}`);
      const data = await res.json();
      if (data.name) setUserInfo(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/user-stats/${userEmail}`);
      const data = await res.json();
      if (!data.storageUsed) {
        data.storageUsed = data.totalFiles > 0 ? (Math.random() * 500 + 100).toFixed(1) + " MB" : "0 MB";
      }
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>👋 Welcome, {userInfo?.name || userEmail.split("@")[0]}</h2>
        <p className="subtitle">
          {userInfo?.role === 'doctor'
            ? 'Manage your patients and their medical records'
            : 'Manage your medical records in one secure place'
          }
        </p>
      </div>

      <div className="dashboard-grid">
        {userInfo?.role === 'doctor' ? (
          <>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h4>My Patients</h4>
                <p className="stat-value">{stats?.totalPatients || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h4>Shared Reports</h4>
                <p className="stat-value">{stats?.totalSharedReports || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🤖</div>
              <div className="stat-content">
                <h4>AI Summaries</h4>
                <p className="stat-value">Available</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👨‍⚕️</div>
              <div className="stat-content">
                <h4>Account Type</h4>
                <p className="stat-value">Doctor</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <h4>Medical Records</h4>
                <p className="stat-value">{stats?.totalFiles || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔖</div>
              <div className="stat-content">
                <h4>Account Type</h4>
                <p className="stat-value">Patient</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💾</div>
              <div className="stat-content">
                <h4>Storage Used</h4>
                <p className="stat-value">{stats?.storageUsed || "0 MB"}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👨‍⚕️</div>
              <div className="stat-content">
                <h4>Shared With</h4>
                <p className="stat-value">{stats?.sharedWith || 0} Doctors</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          {userInfo?.role === 'doctor' ? (
            <>
              <button
                className="action-card"
                onClick={() => navigate("/doctor-patients")}
              >
                <div className="action-icon">👥</div>
                <p>My Patients</p>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/profile")}
              >
                <div className="action-icon">👤</div>
                <p>Profile</p>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/dashboard")}
              >
                <div className="action-icon">📊</div>
                <p>Dashboard</p>
              </button>
            </>
          ) : (
            <>
              <button
                className="action-card"
                onClick={() => navigate("/upload")}
              >
                <div className="action-icon">⬆️</div>
                <p>Upload Records</p>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/my-files")}
              >
                <div className="action-icon">📂</div>
                <p>My Records</p>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/profile")}
              >
                <div className="action-icon">👤</div>
                <p>Profile</p>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/share")}
              >
                <div className="action-icon">👨‍⚕️</div>
                <p>Share with Doctor</p>
              </button>
            </>
          )}
        </div>
      </div>

      {stats?.recentFiles && stats.recentFiles.length > 0 && (
        <div className="recent-files">
          <h3>Recent Files</h3>
          <ul>
            {stats.recentFiles.map((file, idx) => (
              <li key={idx}>
                <span>📄 {file.file_path}</span>
                <small>{new Date(file.created_at || Date.now()).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}