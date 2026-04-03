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

  return (
    <nav className="app-navbar">
      <div className="nav-brand-container">
        <img src="/rognidhi-logo.svg?v=2" alt="RogNidhi Logo" className="nav-logo-img" />
        <a href="/" className="nav-brand">RogNidhi</a>
      </div>
      <ul className="nav-menu">
        <li><button className={`nav-link ${isActive('/dashboard')}`} onClick={() => navigate("/dashboard")}>Dashboard</button></li>
        {userRole === 'doctor' ? (
          <>
            <li><button className={`nav-link ${isActive('/doctor-patients')}`} onClick={() => navigate("/doctor-patients")}>My Patients</button></li>
            <li><button className={`nav-link ${isActive('/profile')}`} onClick={() => navigate("/profile")}>Profile</button></li>
          </>
        ) : (
          <>
            <li><button className={`nav-link ${isActive('/upload')}`} onClick={() => navigate("/upload")}>Upload</button></li>
            <li><button className={`nav-link ${isActive('/my-files')}`} onClick={() => navigate("/my-files")}>My Records</button></li>
            <li><button className={`nav-link ${isActive('/share')}`} onClick={() => navigate("/share")}>Share</button></li>
            <li><button className={`nav-link ${isActive('/profile')}`} onClick={() => navigate("/profile")}>Profile</button></li>
          </>
        )}
        <li>
          <button
            className="nav-link"
            onClick={() => {
              setIsLoggedIn(false);
              setUserEmail("");
              navigate("/");
            }}
          >
            Logout
          </button>
        </li>
      </ul>
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