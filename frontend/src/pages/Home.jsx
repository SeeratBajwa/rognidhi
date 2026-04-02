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
            <img src="/rognidhi-logo.svg" alt="RogNidhi Logo" className="logo-img" />
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
          <h2>Your Medical Documents, Secure & Organized</h2>
          <p>
            Upload, organize, and share your medical records with doctors. Secure, private, and always accessible.
          </p>
          <button className="cta-btn" onClick={handleGetStarted}>
            {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
          </button>
        </div>
        <div className="hero-image">
          <div className="file-icon">📁</div>
        </div>
      </div>

      <div className="features-section">
        <h3>Why Choose RogNidhi?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h4>HIPAA Compliant</h4>
            <p>Your medical data is encrypted and secure</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍⚕️👥</div>
            <h4>Share with Doctors</h4>
            <p>Give doctors instant access to your records</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h4>Organize Records</h4>
            <p>Medical reports, prescriptions, test results</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h4>Access Anywhere</h4>
            <p>Your health records always in your pocket</p>
          </div>
        </div>
      </div>
    </div>
  );
}
