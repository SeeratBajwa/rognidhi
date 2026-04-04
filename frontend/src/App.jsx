import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Upload from "./pages/Upload";
import MyFiles from "./pages/MyFiles";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ShareDoctor from "./pages/ShareDoctor";
import DoctorPatients from "./pages/DoctorPatients";
import "./styles/global.css";
import "./styles/Navbar.css";
import "./styles/ShareDoctor.css";
import "./styles/DoctorPatients.css";

function Navbar({ isLoggedIn, userEmail, setIsLoggedIn, setUserEmail }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userEmail) return;

    const loadUserRole = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/user-info/${userEmail}`);
        const data = await res.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    loadUserRole();
  }, [isLoggedIn, userEmail]);

  if (!isLoggedIn) return null;

  const isActive = (path) => location.pathname === path ? "active" : "";

  const navigationItems = userRole === 'doctor' ? [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/doctor-patients', label: 'My Patients', icon: '👥' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ] : [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/upload', label: 'Upload', icon: '📤' },
    { path: '/my-files', label: 'My Records', icon: '📁' },
    { path: '/share', label: 'Share', icon: '🔗' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="app-navbar">
      <div className="nav-container">
        <div className="nav-brand-container">
          <img src="/rognidhi-logo.svg?v=2" alt="RogNidhi Logo" className="nav-logo-img" />
          <a href="/" className="nav-brand">RogNidhi</a>
        </div>

        <div className={`nav-menu-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-menu">
            {navigationItems.map((item, index) => (
              <li key={item.path}>
                <button
                  className={`nav-link ${isActive(item.path)}`}
                  onClick={() => handleNavigation(item.path)}
                  style={{ '--index': index }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-indicator"></span>
                </button>
              </li>
            ))}
            <li className="nav-divider"></li>
            <li>
              <div className="user-info">
                <span className="user-avatar">👤</span>
                <span className="user-email">{userEmail}</span>
              </div>
            </li>
            <li>
              <button
                className="nav-link logout-btn"
                onClick={handleLogout}
              >
                <span className="nav-icon">🚪</span>
                <span className="nav-label">Logout</span>
              </button>
            </li>
          </ul>
        </div>

        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </nav>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("userEmail") || "";
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
    if (userEmail) localStorage.setItem("userEmail", userEmail);
  }, [isLoggedIn, userEmail]);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} userEmail={userEmail} setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} />
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} userEmail={userEmail} setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} />} />
        <Route path="/auth" element={<Auth setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} />} />
        <Route path="/upload" element={<Upload userEmail={userEmail} isLoggedIn={isLoggedIn} />} />
        <Route path="/my-files" element={<MyFiles userEmail={userEmail} isLoggedIn={isLoggedIn} />} />
        <Route path="/dashboard" element={<Dashboard userEmail={userEmail} isLoggedIn={isLoggedIn} />} />
        <Route path="/profile" element={<Profile userEmail={userEmail} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} />} />
        <Route path="/share" element={<ShareDoctor userEmail={userEmail} isLoggedIn={isLoggedIn} />} />
        <Route path="/doctor-patients" element={<DoctorPatients userEmail={userEmail} isLoggedIn={isLoggedIn} />} />
      </Routes>
    </Router>
  );
}

export default App;