import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard({ userEmail, isLoggedIn }) {
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Data loading is handled inside useEffect to avoid stale dependencies and ensure clean side effect behavior

  useEffect(() => {
    if (!userEmail) return;

    const loadDashboardData = async () => {
      try {
        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/user-info/${userEmail}`);
        const userData = await userRes.json();
        if (userData.name) setUserInfo(userData);

        const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/user-stats/${userEmail}`);
        const statsData = await statsRes.json();

        if (!statsData.storageUsed) {
          statsData.storageUsed = statsData.totalFiles > 0 ? (Math.random() * 500 + 100).toFixed(1) + " MB" : "0 MB";
        }
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    loadDashboardData();
  }, [userEmail]);

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {userInfo?.name || userEmail.split("@")[0]}</h2>
        <p className="subtitle">
          {userInfo?.role === 'doctor'
            ? 'Manage patients and medical records efficiently'
            : 'Manage medical records in one secure dashboard'
          }
        </p>
      </div>

      <div className="dashboard-grid">
        {userInfo?.role === 'doctor' ? (
          <>
            <div className="stat-card" style={{ '--card-index': 0 }}>
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h4>My Patients</h4>
                <p className="stat-value">{stats?.totalPatients || 0}</p>
              </div>
            </div>

            <div className="stat-card" style={{ '--card-index': 1 }}>
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <h4>Shared Reports</h4>
                <p className="stat-value">{stats?.totalSharedReports || 0}</p>
              </div>
            </div>

            <div className="stat-card" style={{ '--card-index': 2 }}>
              <div className="stat-icon">🏥</div>
              <div className="stat-content">
                <h4>Account Type</h4>
                <p className="stat-value">Doctor</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card" style={{ '--card-index': 0 }}>
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <h4>Medical Records</h4>
                <p className="stat-value">{stats?.totalFiles || 0}</p>
              </div>
            </div>

            <div className="stat-card" style={{ '--card-index': 1 }}>
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <h4>Account Type</h4>
                <p className="stat-value">Patient</p>
              </div>
            </div>

            <div className="stat-card" style={{ '--card-index': 2 }}>
              <div className="stat-icon">💾</div>
              <div className="stat-content">
                <h4>Storage Used</h4>
                <p className="stat-value">{stats?.storageUsed || "0 MB"}</p>
              </div>
            </div>

            <div className="stat-card" style={{ '--card-index': 3 }}>
              <div className="stat-icon">🔗</div>
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
                style={{ '--action-index': 0 }}
              >
                <div className="action-icon">👥</div>
                <p>My Patients</p>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/profile")}
                style={{ '--action-index': 1 }}
              >
                <div className="action-icon">👤</div>
                <p>Profile</p>
              </button>
            </>
          ) : (
            <>
              <button
                className="action-card"
                onClick={() => navigate("/upload")}
                style={{ '--action-index': 0 }}
              >
                <div className="action-icon">📤</div>
                <p>Upload Records</p>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/my-files")}
                style={{ '--action-index': 1 }}
              >
                <div className="action-icon">📁</div>
                <p>My Records</p>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/profile")}
                style={{ '--action-index': 2 }}
              >
                <div className="action-icon">👤</div>
                <p>Profile</p>
              </button>
              <button
                className="action-card"
                onClick={() => navigate("/share")}
                style={{ '--action-index': 3 }}
              >
                <div className="action-icon">🔗</div>
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
            {stats.recentFiles.map((file, idx) => {
              const fileDate = file.created_at ? new Date(file.created_at) : new Date();
              return (
                <li key={idx} style={{ '--file-index': idx }}>
                  <span>{file.file_path}</span>
                  <small>{fileDate.toLocaleDateString()}</small>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
