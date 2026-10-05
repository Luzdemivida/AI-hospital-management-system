import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import logo from "../../assets/images/logo.jpg";
import appointmentImage from "../../assets/images/emoji-1.jpg";
import queueImage from "../../assets/images/emoji-2.jpg";
import profileImage from "../../assets/images/emoji-3.jpg";
import dashboardImage from "../../assets/images/emoji-4.jpg";
import logoutImage from "../../assets/images/emoji-5.jpg";
import callNextImage from "../../assets/images/emoji-6.jpg";
import "./DoctorQueue.css";

function DoctorQueue() {
    const navigate = useNavigate();

    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // ── Patient profile viewer (GET /Patients/{userId}) ──────────────────────
    const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────

    const loadQueue = async () => {
        try {
            setLoading(true);
            setError("");
            const resp = await api.get("/Queue/today");
            const data = resp.data || [];
            setQueue(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load queue:", err);
            setError(err.response?.data?.message || "Unable to load today's queue.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQueue();
    }, []);

    // ── Call next patient ─────────────────────────────────────────────────────
    const callNextPatient = async () => {
        try {
            setActionLoading(true);
            await api.put("/Queue/call-next");
            await loadQueue();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Unable to call the next patient.");
        } finally {
            setActionLoading(false);
        }
    };

    // ── Complete consultation ─────────────────────────────────────────────────
    const completePatient = async (queueId) => {
        if (!window.confirm("Mark this consultation as completed?")) return;
        try {
            setActionLoading(true);
            await api.put(`/Queue/${queueId}/complete`);
            await loadQueue();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Unable to complete this queue entry.");
        } finally {
            setActionLoading(false);
        }
    };

    // ── View patient profile (GET /Patients/{userId}) ─────────────────────────
    const viewPatientProfile = async (patientUserId) => {
        if (!patientUserId) {
            alert("Patient user ID is not available.");
            return;
        }
        try {
            setProfileLoading(true);
            const resp = await api.get(`/Patients/${patientUserId}`);
            setSelectedPatientProfile(resp.data);
            setShowProfileModal(true);
        } catch (err) {
            console.error("Failed to load patient profile:", err);
            alert(err.response?.data?.message || "Unable to load patient profile.");
        } finally {
            setProfileLoading(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getQueueId    = (item) => item.queueId  || item.id;
    const getQueueNum   = (item) => item.queueNumber || item.queue_number || "—";
    const getPatientName = (item) => item.patientName || "Unknown Patient";
    const getStatus     = (item) => item.status || item.queueStatus || "Waiting";

    const waitingCount  = queue.filter(i => String(getStatus(i)).toLowerCase() === "waiting").length;
    const servingItem   = queue.find(i => ["called","in progress","serving"].includes(String(getStatus(i)).toLowerCase()));

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
                    <button type="button" className="doctor-nav-item"
                        onClick={() => navigate("/doctor-dashboard")}>
                        <img src={dashboardImage} alt="Dashboard" className="doctor-nav-image" />
                        Dashboard
                    </button>
                    <button type="button" className="doctor-nav-item active"
                        onClick={() => navigate("/doctor-queue")}>
                        <img src={queueImage} alt="Patient Queue" className="doctor-nav-image" />
                        Patient Queue
                    </button>
                    <button type="button" className="doctor-nav-item"
                        onClick={() => navigate("/doctor-appointments")}>
                        <img src={appointmentImage} alt="Appointments" className="doctor-nav-image" />
                        Appointments
                    </button>
                    <button type="button" className="doctor-nav-item"
                        onClick={() => navigate("/doctor-profile")}>
                        <img src={profileImage} alt="My Profile" className="doctor-nav-image" />
                        My Profile
                    </button>
                </nav>

                <div className="doctor-sidebar-bottom">
                    <button type="button" className="doctor-logout-button"
                        onClick={() => navigate("/login")}>
                        <img src={logoutImage} alt="Logout" className="doctor-nav-image" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── MAIN ────────────────────────────────────────────── */}
            <main className="doctor-main">
                <header className="doctor-topbar">
                    <div>
                        <p className="doctor-page-label">PATIENT QUEUE</p>
                        <h1>Today's Patient Queue</h1>
                        <p className="doctor-subtitle">
                            View and manage patients currently waiting for consultation.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button type="button" className="doctor-secondary-button"
                            onClick={loadQueue} disabled={loading}>
                            ↻ Refresh
                        </button>
                        <button type="button" className="doctor-secondary-button"
                            onClick={() => navigate("/doctor-dashboard")}>
                            ← Dashboard
                        </button>
                    </div>
                </header>

                {/* Stats bar */}
                <section className="doctor-queue-summary">
                    <div className="doctor-queue-summary-card">
                        <span>TOTAL IN QUEUE</span>
                        <strong>{queue.length}</strong>
                    </div>
                    <div className="doctor-queue-summary-card">
                        <span>WAITING</span>
                        <strong>{waitingCount}</strong>
                    </div>
                    <div className="doctor-queue-summary-card">
                        <span>NOW SERVING</span>
                        <strong>{servingItem ? getQueueNum(servingItem) : "—"}</strong>
                    </div>
                </section>

                {/* Queue table */}
                <section className="doctor-glass-card doctor-full-queue-card">
                    <div className="doctor-section-heading">
                        <div>
                            <span>TODAY'S QUEUE</span>
                            <h2>Waiting Patients</h2>
                        </div>
                        <button type="button" className="doctor-call-next-button"
                            onClick={callNextPatient}
                            disabled={actionLoading || waitingCount === 0}>
                            <img src={callNextImage} alt="" className="doctor-action-image" />
                            Call Next Patient
                        </button>
                    </div>

                    {loading && <div className="doctor-empty-state"><p>Loading queue…</p></div>}

                    {!loading && error && (
                        <div className="doctor-empty-state" style={{ color: "#b91c1c" }}>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && queue.length === 0 && (
                        <div className="doctor-empty-state">
                            <h3>No patients in today's queue</h3>
                            <p>All patients have been served or no appointments are scheduled.</p>
                        </div>
                    )}

                    {!loading && !error && queue.length > 0 && (
                        <div className="doctor-table-container">
                            <table className="doctor-queue-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Queue No.</th>
                                        <th>Patient</th>
                                        <th>Appointment</th>
                                        <th>Reason</th>
                                        <th>AI Prediction</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queue.map((item, idx) => {
                                        const queueId = getQueueId(item);
                                        const status  = getStatus(item);
                                        const isCompleted = String(status).toLowerCase() === "completed";

                                        return (
                                            <tr key={queueId || idx}>
                                                <td>{idx + 1}</td>
                                                <td><strong>{getQueueNum(item)}</strong></td>
                                                <td>{getPatientName(item)}</td>
                                                <td>
                                                    {item.appointmentDate
                                                        ? String(item.appointmentDate)
                                                        : "—"}{" "}
                                                    {item.appointmentTime || ""}
                                                </td>
                                                <td>{item.reason || "—"}</td>
                                                <td style={{ maxWidth: 200, fontSize: 12, color: "#5a7a8a" }}>
                                                    {item.aiPrediction || item.AiPrediction
                                                        ? (
                                                            <details style={{ cursor: "pointer" }}>
                                                                <summary style={{
                                                                    listStyle: "none",
                                                                    color: "#0b8792",
                                                                    fontWeight: 700,
                                                                    fontSize: 11,
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    maxWidth: 180
                                                                }}>
                                                                    ✦ View AI Prediction
                                                                </summary>
                                                                <div style={{
                                                                    marginTop: 6,
                                                                    padding: "8px 10px",
                                                                    background: "rgba(11,135,146,0.06)",
                                                                    borderLeft: "3px solid #0b8792",
                                                                    borderRadius: 6,
                                                                    lineHeight: 1.6,
                                                                    color: "#1e3a4a",
                                                                    whiteSpace: "pre-wrap",
                                                                    fontSize: 12
                                                                }}>
                                                                    {item.aiPrediction || item.AiPrediction}
                                                                </div>
                                                            </details>
                                                        )
                                                        : (
                                                            <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                                                                Pending
                                                            </span>
                                                        )
                                                    }
                                                </td>
                                                <td>
                                                    <span className={
                                                        isCompleted
                                                            ? "doctor-completed-status"
                                                            : String(status).toLowerCase() === "serving"
                                                                ? "doctor-serving-status"
                                                                : "doctor-waiting-status"
                                                    }>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                        {/* View patient medical profile */}
                                                        <button
                                                            className="doctor-action-btn"
                                                            onClick={() =>
                                                                viewPatientProfile(
                                                                    item.patientUserId ||
                                                                    item.PatientUserId
                                                                )
                                                            }
                                                            disabled={profileLoading}
                                                            title="View patient medical profile"
                                                        >
                                                            👤 Profile
                                                        </button>

                                                        {/* Complete button — only for serving */}
                                                        {!isCompleted && queueId && (
                                                            <button
                                                                className="doctor-complete-btn"
                                                                onClick={() => completePatient(queueId)}
                                                                disabled={actionLoading ||
                                                                    String(status).toLowerCase() !== "serving"}
                                                                title="Complete consultation"
                                                            >
                                                                ✓ Complete
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {/* ── PATIENT PROFILE MODAL ───────────────────────────── */}
            {showProfileModal && selectedPatientProfile && (
                <div className="doctor-modal-overlay">
                    <div className="doctor-modal" style={{ maxWidth: 560 }}>
                        <div className="doctor-modal-header">
                            <div>
                                <p>PATIENT MEDICAL PROFILE</p>
                                <h2>
                                    {selectedPatientProfile.name ||
                                        `${selectedPatientProfile.firstName || ""} ${selectedPatientProfile.lastName || ""}`.trim() ||
                                        "Patient"}
                                </h2>
                            </div>
                            <button onClick={() => setShowProfileModal(false)}>×</button>
                        </div>

                        <div className="doctor-modal-content">
                            <div className="doctor-profile-grid">
                                <div className="doctor-profile-field">
                                    <span>Email</span>
                                    <strong>{selectedPatientProfile.email || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Phone</span>
                                    <strong>{selectedPatientProfile.phone || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Date of Birth</span>
                                    <strong>
                                        {selectedPatientProfile.dateOfBirth
                                            ? String(selectedPatientProfile.dateOfBirth).slice(0, 10)
                                            : "—"}
                                    </strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Gender</span>
                                    <strong>{selectedPatientProfile.gender || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Blood Group</span>
                                    <strong>{selectedPatientProfile.bloodGroup || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Address</span>
                                    <strong>{selectedPatientProfile.address || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field" style={{ gridColumn: "1 / -1" }}>
                                    <span>Allergies</span>
                                    <strong>{selectedPatientProfile.allergies || "None"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Emergency Contact</span>
                                    <strong>{selectedPatientProfile.emergencyContactName || "—"}</strong>
                                </div>
                                <div className="doctor-profile-field">
                                    <span>Emergency Phone</span>
                                    <strong>{selectedPatientProfile.emergencyContactPhone || "—"}</strong>
                                </div>
                            </div>

                            <div style={{ marginTop: 20 }}>
                                <button
                                    className="primary-button"
                                    onClick={() => setShowProfileModal(false)}
                                >
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

export default DoctorQueue;
