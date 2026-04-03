import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home({ isLoggedIn, userEmail, setIsLoggedIn, setUserEmail }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/upload");
    } else {
      navigate("/auth");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/");
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo-container">
            <img src="/rognidhi-logo.svg?v=2" alt="RogNidhi Logo" className="logo-img" />
            <h1 className="logo">RogNidhi</h1>
          </div>
        </div>
        <div className="nav-right">
          {isLoggedIn ? (
            <>
              <span className="user-email">{userEmail}</span>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-btn" onClick={() => navigate("/auth")}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <h2>Industry-grade medical record management</h2>
          <p>
            Secure, compliant storage and sharing for health documents in one centralized dashboard.
          </p>
          <button className="cta-btn" onClick={handleGetStarted}>
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </button>
        </div>
        <div className="hero-image">
          <div className="file-icon"> </div>
        </div>
      </div>

      <div className="features-section">
        <h3>Why RogNidhi</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🔒 Security & Compliance</h4>
            <p>Encrypted storage and strict access controls.</p>
          </div>
          <div className="feature-card">
            <h4>🤝 Provider Collaboration</h4>
            <p>Share records with care teams in seconds.</p>
          </div>
          <div className="feature-card">
            <h4>📂 Centralized Records</h4>
            <p>All test results, prescriptions and reports in one place.</p>
          </div>
          <div className="feature-card">
            <h4>🌐 Always Accessible</h4>
            <p>Web access from desktop or tablet with audit trail.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
