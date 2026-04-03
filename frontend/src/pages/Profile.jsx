import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile({ userEmail, isLoggedIn, setIsLoggedIn, setUserEmail }) {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!userEmail) return;

    const loadUserInfo = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/user-info/${userEmail}`);
        const data = await res.json();
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

    loadUserInfo();
  }, [userEmail]);

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

  // fetchUserInfo is already declared above and used in useEffect.

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/");
  };

  const handleSaveEdit = async () => {
    const updated = {
      originalEmail: userInfo.email,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role
    };

    const updatedUserInfo = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role
    };

    if (!updated.name || !updated.email || !updated.role) {
      return alert("Please fill all profile fields.");
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Unable to update profile");
      }

      alert(text || "Profile updated successfully");
      setUserInfo({ ...userInfo, ...updatedUserInfo });
      setEditForm({ ...editForm, ...updatedUserInfo });
      if (updated.email !== userInfo.email) {
        setUserEmail(updated.email);
        localStorage.setItem("userEmail", updated.email);
      }
      setIsEditing(false);
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  };

  const handleChangePassword = async () => {
    const oldPassword = prompt("Enter your current password:");
    if (!oldPassword) return;

    const newPassword = prompt("Enter your new password:");
    if (!newPassword) return;

    if (newPassword.length < 6) {
      return alert("New password must be at least 6 characters.");
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userInfo.email, oldPassword, newPassword })
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Unable to update password");
      }
      alert(text || "Password changed successfully");
    } catch (error) {
      alert("Error changing password: " + error.message);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion feature coming soon");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src="/rognidhi-logo.svg?v=2" alt="RogNidhi Logo" className="profile-logo" />
        <h2>My Profile</h2>
        <p className="profile-subtitle">Manage your account and medical preferences</p>
      </div>

      {userInfo ? (
        <div className="profile-card">
          <div className="profile-section">
            <div className="profile-avatar" style={{background: userInfo.role === 'doctor' ? '#03a9f4' : '#10b981'}}>
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-info">
              <h3>{userInfo.name}</h3>
              <p className="profile-email">{userInfo.email}</p>
              <div className="profile-role-badge">
                <span className={`role-badge ${userInfo.role}`}>
                  {userInfo.role === 'doctor' ? 'Doctor' : 'Patient'}
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
                  onClick={handleSaveEdit}
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
                Edit Profile
              </button>
              <button 
                className="change-password-btn"
                onClick={handleChangePassword}
              >
                Change Password
              </button>
            </div>
          )}

          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <button 
              className="delete-account-btn"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>

          <div className="profile-footer">
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
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
