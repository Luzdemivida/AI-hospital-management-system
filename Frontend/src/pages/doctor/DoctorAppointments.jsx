import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./DoctorAppointments.css";
import logo from "../../assets/images/logo.jpg";

import appointmentImage from "../../assets/images/emoji-1.jpg";
import queueImage from "../../assets/images/emoji-2.jpg";
import profileImage from "../../assets/images/emoji-3.jpg";
import dashboardImage from "../../assets/images/emoji-4.jpg";
import logoutImage from "../../assets/images/emoji-5.jpg";
import aiImage from "../../assets/images/emoji-6.jpg";

function DoctorAppointments() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ── AI patient summary (GET /Queue/patient-summary/{appointmentId}) ───────
    const [aiSummary, setAiSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    // ── Patient medical profile (GET /Patients/{userId}) ─────────────────────
    const [patientProfile, setPatientProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────

    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError("");
            // Today's queue gives us the appointment data the doctor needs
            const resp = await api.get("/Queue/today");
            const data = resp.data || [];
            setAppointments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load appointments:", err);
            setError(err.response?.data?.message || "Unable to load today's appointments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    // ── Load AI patient summary ───────────────────────────────────────────────
    const loadAiSummary = async (appointmentId) => {
        if (!appointmentId) {
            alert("Appointment ID is not available.");
            return;
        }
        try {
            setSummaryLoading(true);
            const resp = await api.get(`/Queue/patient-summary/${appointmentId}`);
            setAiSummary(resp.data);
            setShowSummaryModal(true);
        } catch (err) {
            console.error("Failed to load AI summary:", err);
            alert(err.response?.data?.message || "Unable to load patient AI summary.");
        } finally {
            setSummaryLoading(false);
        }
    };

    // ── Load patient medical profile ─────────────────────────────────────────
    const loadPatientProfile = async (patientUserId) => {
        if (!patientUserId) {
            alert("Patient user ID is not available.");
            return;
        }
        try {
            setProfileLoading(true);
            const resp = await api.get(`/Patients/${patientUserId}`);
            setPatientProfile(resp.data);
            setShowProfileModal(true);
        } catch (err) {
            console.error("Failed to load patient profile:", err);
            alert(err.response?.data?.message || "Unable to load patient profile.");
        } finally {
            setProfileLoading(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getStatus = (item) => item.status || "Scheduled";

    const statusClass = (status) => {
        const s = String(status).toLowerCase();
        if (s === "completed")  return "appt-status completed";
        if (s === "serving")    return "appt-status serving";
        if (s === "waiting")    return "appt-status waiting";
        return "appt-status scheduled";
    };

    return (
        <div className="doctor-dashboard">

            {/* ── SIDEBAR ─────────────────────────────────────────── */}
            <aside className="doctor-sidebar">
                <div className="doctor-brand">
                    <img src={logo} alt="Smartcare Queue" className="doctor-logo" />
                    <div className="doctor-brand-text">
                        <h2>Smartcare Queue</h2>
                        <p>Smarter healthcare for Better care.</p>
                    </div>
                </div>

                <nav className="doctor-navigation">
                    <button className="doctor-nav-item"
                        onClick={() => navigate("/doctor-dashboard")}>
                        <img src={dashboardImage} alt="Dashboard" className="doctor-nav-icon" />
                        Dashboard
                    </button>
                    <button className="doctor-nav-item"
                        onClick={() => navigate("/doctor-queue")}>
                        <img src={queueImage} alt="Patient Queue" className="doctor-nav-icon" />
                        Patient Queue
                    </button>
                    <button className="doctor-nav-item active"
                        onClick={() => navigate("/doctor-appointments")}>
                        <img src={appointmentImage} alt="Appointments" className="doctor-nav-icon" />
                        Appointments
                    </button>
                    <button className="doctor-nav-item"
                        onClick={() => navigate("/doctor-profile")}>
                        <img src={profileImage} alt="My Profile" className="doctor-nav-icon" />
                        My Profile
                    </button>
                </nav>

                <div className="doctor-sidebar-bottom">
                    <button className="doctor-logout-button"
                        onClick={() => navigate("/login")}>
                        <img src={logoutImage} alt="Logout" className="doctor-logout-icon" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── MAIN ────────────────────────────────────────────── */}
            <main className="doctor-main">
                <header className="doctor-topbar">
                    <div>
                        <p className="doctor-page-label">APPOINTMENTS</p>
                        <h1>Today's Appointments</h1>
                        <p className="doctor-subtitle">
                            View today's scheduled appointments and access AI patient summaries.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="doctor-secondary-button"
                            onClick={loadAppointments} disabled={loading}>
                            ↻ Refresh
                        </button>
                        <button className="doctor-secondary-button"
                            onClick={() => navigate("/doctor-dashboard")}>
                            ← Dashboard
                        </button>
                    </div>
                </header>

                {/* Loading / error */}
                {loading && (
                    <div className="doctor-glass-card doctor-empty-state">
                        <p>Loading appointments…</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="doctor-glass-card doctor-empty-state" style={{ color: "#b91c1c" }}>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && appointments.length === 0 && (
                    <div className="doctor-glass-card doctor-empty-state">
                        <div>
                            <img src={appointmentImage} alt="" className="doctor-empty-icon" />
                        </div>
                        <h3>No appointments today</h3>
                        <p>There are no scheduled appointments for today.</p>
                    </div>
                )}

                {!loading && !error && appointments.length > 0 && (
                    <section className="doctor-appointments-section">
                        <div className="doctor-appointments-list">
                            {appointments.map((appt, idx) => {
                                const apptId       = appt.appointmentId || appt.AppointmentId;
                                const patientUid   = appt.patientUserId  || appt.PatientUserId;
                                const status       = getStatus(appt);

                                return (
                                    <article
                                        className="doctor-glass-card doctor-appointment-card"
                                        key={appt.queueId || appt.id || idx}
                                    >
                                        <div className="doctor-appointment-header">
                                            <div>
                                                <span>PATIENT</span>
                                                <h2>{appt.patientName || "Unknown Patient"}</h2>
                                                <p>
                                                    Queue:{" "}
                                                    <strong>
                                                        {appt.queueNumber || appt.QueueNumber || "—"}
                                                    </strong>
                                                </p>
                                            </div>
                                            <span className={statusClass(status)}>
                                                {status}
                                            </span>
                                        </div>

                                        <div className="doctor-appointment-details">
                                            <div>
                                                <span>DATE</span>
                                                <strong>
                                                    {appt.appointmentDate
                                                        ? String(appt.appointmentDate).slice(0, 10)
                                                        : "—"}
                                                </strong>
                                            </div>
                                            <div>
                                                <span>TIME</span>
                                                <strong>{appt.appointmentTime || "—"}</strong>
                                            </div>
                                            <div>
                                                <span>DEPARTMENT</span>
                                                <strong>{appt.department || "—"}</strong>
                                            </div>
                                            <div>
                                                <span>REASON</span>
                                                <strong>{appt.reason || "—"}</strong>
                                            </div>
                                            <div>
                                                <span>AI PREDICTION</span>
                                                <strong style={{ fontSize: 12, color: "#5a7a8a" }}>
                                                    {appt.aiPrediction || appt.AiPrediction || "—"}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="doctor-appt-actions">
                                            {/* GET /Queue/patient-summary/{appointmentId} */}
                                            <button
                                                className="appt-action-btn ai"
                                                onClick={() => loadAiSummary(apptId)}
                                                disabled={summaryLoading || !apptId}
                                            >
                                                <img src={aiImage} alt="" style={{ width: 16, height: 16, borderRadius: 4, objectFit: "cover" }} />
                                                {summaryLoading ? "Loading…" : "AI Patient Summary"}
                                            </button>

                                            {/* GET /Patients/{userId} */}
                                            <button
                                                className="appt-action-btn profile"
                                                onClick={() => loadPatientProfile(patientUid)}
                                                disabled={profileLoading || !patientUid}
                                            >
                                                👤 Medical Profile
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* ── AI PATIENT SUMMARY MODAL ────────────────────────── */}
            {showSummaryModal && aiSummary && (
                <div className="doctor-modal-overlay">
                    <div className="doctor-modal" style={{ maxWidth: 600 }}>
                        <div className="doctor-modal-header">
                            <div>
                                <p>AI PATIENT SUMMARY</p>
                                <h2>{aiSummary.patientName || "Patient"}</h2>
                            </div>
                            <button onClick={() => setShowSummaryModal(false)}>×</button>
                        </div>
                        <div className="doctor-modal-content">
                            <div className="doctor-profile-grid" style={{ marginBottom: 16 }}>
                                <div className="doctor-profile-field">
                                    <span>Queue Number</span>
                                    <strong>{aiSummary.queueNumber || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Department</span>
                                    <strong>{aiSummary.department || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Date</span>
                                    <strong>
                                        {aiSummary.appointmentDate
                                            ? String(aiSummary.appointmentDate).slice(0, 10)
                                            : "—"}
                                    </strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Time</span>
                                    <strong>{aiSummary.appointmentTime || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field" style={{ gridColumn: "1 / -1" }}>
                                    <span>Reason</span>
                                    <strong>{aiSummary.reason || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field" style={{ gridColumn: "1 / -1" }}>
                                    <span>Status</span>
                                    <strong>{aiSummary.status || "—"}</strong>
                                </div>
                            </div>

                            {aiSummary.aiSummary && (
                                <div style={{
                                    background: "#f0f9ff",
                                    border: "1px solid #bae6fd",
                                    borderRadius: 12,
                                    padding: "14px 16px",
                                    marginBottom: 16,
                                }}>
                                    <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, letterSpacing: "1px", color: "#0b8792", textTransform: "uppercase" }}>
                                        AI Summary
                                    </p>
                                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#1e3a4a", whiteSpace: "pre-wrap" }}>
                                        {aiSummary.aiSummary}
                                    </p>
                                </div>
                            )}

                            <button className="primary-button" onClick={() => setShowSummaryModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PATIENT MEDICAL PROFILE MODAL ───────────────────── */}
            {showProfileModal && patientProfile && (
                <div className="doctor-modal-overlay">
                    <div className="doctor-modal" style={{ maxWidth: 560 }}>
                        <div className="doctor-modal-header">
                            <div>
                                <p>PATIENT MEDICAL PROFILE</p>
                                <h2>
                                    {patientProfile.name ||
                                        `${patientProfile.firstName || ""} ${patientProfile.lastName || ""}`.trim() ||
                                        "Patient"}
                                </h2>
                            </div>
                            <button onClick={() => setShowProfileModal(false)}>×</button>
                        </div>
                        <div className="doctor-modal-content">
                            <div className="doctor-profile-grid">
                                <div className="doctor-profile-field">
                                    <span>Email</span>
                                    <strong>{patientProfile.email || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Phone</span>
                                    <strong>{patientProfile.phone || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Date of Birth</span>
                                    <strong>
                                        {patientProfile.dateOfBirth
                                            ? String(patientProfile.dateOfBirth).slice(0, 10)
                                            : "—"}
                                    </strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Gender</span>
                                    <strong>{patientProfile.gender || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Blood Group</span>
                                    <strong>{patientProfile.bloodGroup || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Address</span>
                                    <strong>{patientProfile.address || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field" style={{ gridColumn: "1 / -1" }}>
                                    <span>Allergies</span>
                                    <strong>{patientProfile.allergies || "None"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Emergency Contact</span>
                                    <strong>{patientProfile.emergencyContactName || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Emergency Phone</span>
                                    <strong>{patientProfile.emergencyContactPhone || "—"}</strong>
                                </div>
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <button className="primary-button" onClick={() => setShowProfileModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorAppointments;
