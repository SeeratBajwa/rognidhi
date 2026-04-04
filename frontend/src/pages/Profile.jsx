import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile({ userEmail, isLoggedIn, setIsLoggedIn, setUserEmail }) {
  const [userInfo, setUserInfo] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userEmail) return;

    const loadUserInfo = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user-info/${userEmail}`);
        const data = await res.json();
        if (data && data.name) {
          setUserInfo(data);
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return alert("Please fill all password fields.");
    }

    if (newPassword !== confirmPassword) {
      return alert("New passwords do not match.");
    }

    if (newPassword.length < 6) {
      return alert("New password must be at least 6 characters.");
    }

    try {
      const response = await fetch("${import.meta.env.VITE_API_URL}/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInfo.email,
          oldPassword: currentPassword,
          newPassword: newPassword
        })
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Unable to update password");
      }

      alert(text || "Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsChangingPassword(false);
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

          {isChangingPassword ? (
            <div className="password-change-form">
              <h4>Change Password</h4>
              <form onSubmit={handlePasswordChange}>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="password-input"
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="password-input"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="password-input"
                  required
                />

                <div className="password-actions">
                  <button type="submit" className="save-password-btn">
                    Change Password
                  </button>
                  <button
                    type="button"
                    className="cancel-password-btn"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="profile-actions">
              <button
                className="change-password-btn"
                onClick={() => setIsChangingPassword(true)}
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
