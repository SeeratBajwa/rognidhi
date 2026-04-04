import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DoctorPatients.css";

export default function DoctorPatients({ userEmail, isLoggedIn }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [patientReports, setPatientReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiError, setAiError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !userEmail) return;

    const loadPatients = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/doctor-patients/${userEmail}`);
        const data = await res.json();
        setPatients(data.patients || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [isLoggedIn, userEmail]);

  const fetchPatientReports = async (patientEmail, patientName) => {
    try {
      console.log("Fetching reports for patient:", patientEmail);
      setAiSummary("");
      setAiError("");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/patient-reports/${patientEmail}`);
      const data = await res.json();
      console.log("Reports data received:", data);
      setPatientReports(data.reports || []);
      setSelectedPatient(patientEmail);
      setSelectedPatientName(patientName);
    } catch (error) {
      console.error("Error fetching patient reports:", error);
      setPatientReports([]);
    }
  };

  const generateAISummary = async (patientEmail) => {
    setGeneratingSummary(true);
    setAiError("");
    try {
      console.log("Generating AI summary for patient:", patientEmail, "Doctor:", userEmail);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ai-summary/${patientEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorEmail: userEmail })
      });

      const data = await res.json();
      console.log("AI Summary response:", data);

      if (!res.ok) {
        setAiError(data.error || "Failed to generate summary");
        return;
      }

      setAiSummary(data.summary || "No summary available.");
    } catch (error) {
      console.error("Error generating AI summary:", error);
      setAiError("Error generating summary: " + error.message);
    } finally {
      setGeneratingSummary(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="doctor-patients-container">
        <div className="not-logged-in">
          <p>Please login to access doctor dashboard</p>
          <button onClick={() => navigate("/auth")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-patients-container">
      <div className="doctor-header">
        <h1>Doctor Dashboard</h1>
        <p>Manage your patients and their medical records</p>
      </div>

      <div className="doctor-content">
        <div className="patients-list">
          <h2>My Patients ({patients.length})</h2>
          {loading ? (
            <div className="loading">Loading patients...</div>
          ) : patients.length === 0 ? (
            <div className="no-patients">
              <p>No patients have shared records with you yet.</p>
              <small>Patients can share their medical records through the "Share with Doctor" feature.</small>
            </div>
          ) : (
            <div className="patients-grid">
              {patients.map((patient, idx) => (
                <div
                  key={idx}
                  className={`patient-card ${selectedPatient === patient.email ? 'selected' : ''}`}
                  onClick={() => fetchPatientReports(patient.email, patient.name)}
                >
                  <div className="patient-avatar">{patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}</div>
                  <div className="patient-info">
                    <h3>{patient.name}</h3>
                    <p>{patient.email}</p>
                    <small>Shared {patient.sharedCount || 0} records</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPatient ? (
          <div className="patient-reports">
            <div className="reports-header">
              <h2>Reports - {selectedPatientName}</h2>
              <button
                className="ai-summary-btn"
                onClick={() => generateAISummary(selectedPatient)}
                disabled={generatingSummary || patientReports.length === 0}
                title={patientReports.length === 0 ? "No reports to summarize" : "Generate summary"}
              >
                {generatingSummary ? "Generating..." : "Generate Summary"}
              </button>
            </div>

            {aiError && (
              <div className="ai-error">
                <p>{aiError}</p>
              </div>
            )}

            {aiSummary && (
              <div className="ai-summary">
                <h3>AI Medical Summary</h3>
                <div className="summary-content">
                  {aiSummary}
                </div>
              </div>
            )}

            {patientReports.length === 0 ? (
              <div className="no-reports">
                <p>No reports shared by this patient.</p>
              </div>
            ) : (
              <div className="reports-list">
                <h3>Shared Reports ({patientReports.length})</h3>
                {patientReports.map((report, idx) => (
                  <div key={idx} className="report-item">
                    <div className="report-icon">
                      {report.document_type === 'prescription' && 'Prescription'}
                      {report.document_type === 'lab_report' && 'Lab Report'}
                      {report.document_type === 'x_ray' && 'X-Ray'}
                      {report.document_type === 'certificate' && 'Certificate'}
                      {!['prescription', 'lab_report', 'x_ray', 'certificate'].includes(report.document_type) && 'Document'}
                    </div>
                    <div className="report-details">
                      <h4>{report.document_type ? report.document_type.replace(/_/g, ' ').toUpperCase() : 'Medical Document'}</h4>
                      <p>File: {report.file_path.split('/').pop()}</p>
                      <small>Shared: {new Date(report.shared_at).toLocaleDateString()}</small>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/uploads/${report.file_path.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-report-btn"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="patient-reports-empty">
            <p>Select a patient to view their reports</p>
          </div>
        )}
      </div>
    </div>
  );
}
