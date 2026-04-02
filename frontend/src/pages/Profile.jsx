import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile({ userEmail, isLoggedIn, setIsLoggedIn, setUserEmail }) {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <div className="profile-container">
        <div className="not-logged-in">
          <p>Please login to view your profile</p>
          <button onClick={() => navigate("/auth")}>Go to Login</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUserInfo();
  }, [userEmail]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/user-info/${userEmail}`);
      const data = await res.json();
      console.log("Profile data fetched:", data);
      if (data && data.name) {
        setUserInfo(data);
        setEditForm(data);
      } else if (data && data.error) {
        console.error("Error from server:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion feature coming soon");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>⚕️ My Profile</h2>
        <p className="profile-subtitle">Manage your account and medical preferences</p>
      </div>

      {userInfo ? (
        <div className="profile-card">
          <div className="profile-section">
            <div className="profile-avatar" style={{background: userInfo.role === 'doctor' ? '#03a9f4' : '#10b981'}}>
              {userInfo.role === 'doctor' ? '👨‍⚕️' : '👤'}
            </div>
            <div className="profile-info">
              <h3>{userInfo.name}</h3>
              <p className="profile-email">{userInfo.email}</p>
              <div className="profile-role-badge">
                <span className={`role-badge ${userInfo.role}`}>
                  {userInfo.role === 'doctor' ? '👨‍⚕️ Doctor' : '👥 Patient'}
                </span>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="edit-form">
              <h4>Edit Profile</h4>
              <input
                type="text"
                placeholder="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="edit-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="edit-input"
              />
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="edit-input"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
              
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={() => {
                    alert("Profile update feature coming soon");
                    setIsEditing(false);
                  }}
                >
                  Save Changes
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-actions">
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
              <button 
                className="change-password-btn"
                onClick={() => alert("Password change feature coming soon")}
              >
                🔐 Change Password
              </button>
            </div>
          )}

          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <button 
              className="delete-account-btn"
              onClick={handleDeleteAccount}
            >
              🗑️ Delete Account
            </button>
          </div>

          <div className="profile-footer">
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-card">
          <p className="not-logged-in">Loading profile...</p>
        </div>
      )}
    </div>
  );
}
