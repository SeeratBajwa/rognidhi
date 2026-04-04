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
          <h2>Your Medical History, Always Within Reach.</h2>
          <p>
            A unified, compliant platform for storing and sharing health documents safely.
          </p>
          <button className="cta-btn" onClick={handleGetStarted}>
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </button>
        </div>
        <div className="hero-image">
          <div className="file-icon">
            <img src="/rognidhi-logo.svg?v=2" alt="RogNidhi Logo" className="hero-logo" />
          </div>
        </div>
      </div>

      <div className="features-section">
        <h3>Why RogNidhi?</h3>
        <div className="features-grid">
          
          <div className="feature-card" style={{ '--card-index': 1 }}>
            <h4>🤝 Effortless Sharing with Doctors</h4>
            <p>Share your medical records with your doctor instantly and securely.</p>
          </div>
          <div className="feature-card" style={{ '--card-index': 2 }}>
            <h4>📂 Everything in One Place        

            </h4>
            <p>All your lab reports, prescriptions, scans and notes — organized automatically.</p>
          </div>
          <div className="feature-card" style={{ '--card-index': 3 }}>
            <h4>🌐 Accessible Anytime, Anywhere</h4>
            <p>Instant access from phone, tablet or desktop — no apps required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
