import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./DoctorDashboard.css";

import logo from "../../assets/images/logo.jpg";

import appointmentImage from "../../assets/images/emoji-1.jpg";
import queueImage from "../../assets/images/emoji-2.jpg";
import profileImage from "../../assets/images/emoji-3.jpg";
import medicalImage from "../../assets/images/emoji-4.jpg";
import waitingImage from "../../assets/images/emoji-5.jpg";
import aiImage from "../../assets/images/emoji-6.jpg";
import api from "../../services/api";

function DoctorDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentPatient, setCurrentPatient] = useState(null);

    const [waitingPatients, setWaitingPatients] = useState([]);

    const [completedCount, setCompletedCount] = useState(0);
    const [servingCount, setServingCount] = useState(0);
    const [doctorName, setDoctorName] = useState(() => {
        const fallback = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Doctor";
        return fallback;
    });

    useEffect(() => {
        const loadDoctorIdentity = async () => {
            const tokenUser = user || JSON.parse(localStorage.getItem("user") || "null");
            const directName = tokenUser?.name || [tokenUser?.firstName, tokenUser?.lastName].filter(Boolean).join(" ") || "Doctor";

            if (directName && directName !== "Doctor") {
                setDoctorName(directName);
            }

            try {
                const resp = await api.get("/Doctor/profile");
                const profile = resp.data || {};
                const profileName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || directName;
                setDoctorName(profileName || "Doctor");
            } catch (err) {
                console.error("Failed to load doctor profile for greeting:", err);
            }
        };

        loadDoctorIdentity();
    }, [user]);

    const doctorInitials = (() => {
        const parts = doctorName.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "DR";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    })();

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                // Today's patients
                const respToday = await api.get("/Doctor/today");
                const today = respToday.data || [];

                // Current patient
                const respCurrent = await api.get("/Doctor/current");
                const current = respCurrent.data || null;

                // Completed patients
                const respCompleted = await api.get("/Doctor/completed");
                const completed = respCompleted.data || [];

                if (mounted) {
                    setWaitingPatients(Array.isArray(today) ? today : []);
                    setCurrentPatient(current);
                    setCompletedCount(
                        Array.isArray(completed) ? completed.length : 0
                    );
                    setServingCount(current ? 1 : 0);
                }
            } catch (err) {
                console.error("Failed to load doctor data:", err);
            }
        };

        load();

        return () => (mounted = false);
    }, []);

    const [patientSummary, setPatientSummary] = useState(null);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [aiRefreshing, setAiRefreshing] = useState(false);

    // ── AI Queue Summary (GET /Doctor/ai-summary) ─────────────────────────────
    const [aiQueueSummary, setAiQueueSummary] = useState(null);
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
    const [showAiSummaryModal, setShowAiSummaryModal] = useState(false);

    const loadAiQueueSummary = async () => {
        try {
            setAiSummaryLoading(true);
            const resp = await api.get("/Doctor/ai-summary");
            setAiQueueSummary(resp.data);
            setShowAiSummaryModal(true);
        } catch (err) {
            console.error("Failed to load AI queue summary:", err);
            alert(err.response?.data?.message || "Unable to load AI queue summary.");
        } finally {
            setAiSummaryLoading(false);
        }
    };

    const refreshAiPrediction = async () => {
        if (!currentPatient) {
            alert("No current patient to refresh AI for.");
            return;
        }

        const queueId = currentPatient.queueId || currentPatient.QueueId || currentPatient.id;

        try {
            setAiRefreshing(true);
            await api.post(`/Queue/${queueId}/refresh-ai`);
            alert("AI prediction refreshed.");
        } catch (err) {
            console.error("Failed to refresh AI:", err);
            alert(err.response?.data?.message || "Unable to refresh AI prediction.");
        } finally {
            setAiRefreshing(false);
        }
    };

    const loadPatientSummary = async () => {
        if (!currentPatient) {
            alert("No current patient to show summary for.");
            return;
        }

        const queueId = currentPatient.queueId || currentPatient.QueueId || currentPatient.id;

        try {
            const resp = await api.get(`/Queue/${queueId}/summary`);
            setPatientSummary(resp.data);
            setShowSummaryModal(true);
        } catch (err) {
            console.error("Failed to load patient summary:", err);
            alert(err.response?.data?.message || "Unable to load patient summary.");
        }
    };

    /* =====================================================
       CALL NEXT PATIENT
    ===================================================== */

    const callNextPatient = () => {
        (async () => {
            try {
                const resp = await api.put("/Queue/call-next");
                const next = resp.data;

                if (!next) {
                    alert("No patients are waiting in the queue.");
                    return;
                }

                // Update UI from returned queue object
                setCurrentPatient(next);

                // remove from waiting list if present
                setWaitingPatients((prev) => prev.filter((p) => p.queueId !== next.queueId));

                setServingCount(1);

                alert(`${next.patientName} (${next.queueNumber}) has been called.`);
            } catch (err) {
                console.error("Failed to call next patient:", err);
                alert(err.response?.data?.message || "Unable to call next patient.");
            }
        })();
    };

    /* =====================================================
       COMPLETE CONSULTATION
    ===================================================== */

    const completeConsultation = () => {
        (async () => {
            if (!currentPatient) {
                alert("There is no patient currently being served.");
                return;
            }

            const confirmed = window.confirm(`Mark ${currentPatient.patientName}'s consultation as completed?`);
            if (!confirmed) return;

            try {
                const queueId = currentPatient.queueId || currentPatient.QueueId || currentPatient.queueId;
                await api.put(`/Queue/${queueId}/complete`);

                setCompletedCount((c) => c + 1);
                setServingCount(0);

                alert(`${currentPatient.patientName}'s consultation has been completed.`);

                setCurrentPatient(null);
            } catch (err) {
                console.error("Failed to complete consultation:", err);
                alert(err.response?.data?.message || "Unable to complete consultation.");
            }
        })();
    };

    return (
        <div className="doctor-dashboard">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="doctor-sidebar">

                {/* BRAND */}

                <div className="doctor-brand">

                    <img
                        src={logo}
                        alt="Smartcare Queue"
                        className="doctor-logo"
                    />

                    <div className="doctor-brand-text">

                        <h2>
                            Smartcare Queue
                        </h2>

                        <p>
                            Smarter healthcare for Better care.
                        </p>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="doctor-navigation">

                    <button
                        className="doctor-nav-item active"
                        onClick={() =>
                            navigate("/doctor-dashboard")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={medicalImage}
                                alt="Dashboard"
                            />
                        </span>

                        Dashboard
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-queue")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={queueImage}
                                alt="Patient Queue"
                            />
                        </span>

                        Patient Queue
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-appointments")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={appointmentImage}
                                alt="Appointments"
                            />
                        </span>

                        Appointments
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-schedule")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={waitingImage}
                                alt="My Schedule"
                            />
                        </span>

                        My Schedule
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-profile")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={profileImage}
                                alt="My Profile"
                            />
                        </span>

                        My Profile
                    </button>

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="doctor-sidebar-bottom">

                    <button
                        className="doctor-logout-button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={medicalImage}
                                alt="Logout"
                            />
                        </span>

                        Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="doctor-main">

                {/* =================================================
                    TOP BAR
                ================================================= */}

                <header className="doctor-topbar">

                    <div>

                        <p className="doctor-page-label">
                            DOCTOR DASHBOARD
                        </p>

                        <h1>
                            Welcome back, Dr. {doctorName}
                        </h1>

                        <p className="doctor-subtitle">
                            Manage today's patients, consultations
                            and queue activities from one place.
                        </p>

                    </div>


                    <button
                        className="doctor-profile-button"
                        onClick={() =>
                            navigate("/doctor-profile")
                        }
                    >

                        <span className="doctor-avatar">
                            {doctorInitials}
                        </span>

                        <span>
                            My Profile
                        </span>

                    </button>

                </header>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="doctor-statistics">

                    <div className="doctor-stat-card">

                        <div className="doctor-stat-icon">
                            <img
                                src={queueImage}
                                alt="Today's Queue"
                            />
                        </div>

                        <div>

                            <span>
                                Today's Queue
                            </span>

                            <strong>
                                {waitingPatients.length + servingCount}
                            </strong>

                        </div>

                    </div>


                    <div className="doctor-stat-card">

                        <div className="doctor-stat-icon">
                            <img
                                src={waitingImage}
                                alt="Waiting Patients"
                            />
                        </div>

                        <div>

                            <span>
                                Waiting Patients
                            </span>

                            <strong>
                                {waitingPatients.length}
                            </strong>

                        </div>

                    </div>


                    <div className="doctor-stat-card">

                        <div className="doctor-stat-icon">
                            <img
                                src={medicalImage}
                                alt="Currently Serving"
                            />
                        </div>

                        <div>

                            <span>
                                Currently Serving
                            </span>

                            <strong>
                                {servingCount}
                            </strong>

                        </div>

                    </div>


                    <div className="doctor-stat-card">

                        <div className="doctor-stat-icon">
                            <img
                                src={medicalImage}
                                alt="Completed Today"
                            />
                        </div>

                        <div>

                            <span>
                                Completed Today
                            </span>

                            <strong>
                                {completedCount}
                            </strong>

                        </div>

                    </div>

                </section>

                {/* PATIENT SUMMARY MODAL */}
                {showSummaryModal && patientSummary && (
                    <div className="doctor-modal-overlay">
                        <div className="doctor-modal">
                            <div className="doctor-modal-header">
                                <div>
                                    <p>PATIENT SUMMARY</p>
                                    <h2>{patientSummary.patientName || 'Patient'}</h2>
                                </div>
                                <button onClick={() => setShowSummaryModal(false)}>×</button>
                            </div>

                            <div className="doctor-modal-content">
                                <p><strong>Queue Number:</strong> {patientSummary.queueNumber || patientSummary.QueueNumber}</p>
                                <p><strong>Department:</strong> {patientSummary.department}</p>
                                <p><strong>Appointment:</strong> {patientSummary.appointmentDate} {patientSummary.appointmentTime}</p>
                                <p><strong>Reason:</strong> {patientSummary.reason}</p>
                                <p><strong>AI Prediction:</strong> {patientSummary.aiPrediction || patientSummary.AiPrediction || '—'}</p>
                                <div style={{ marginTop: 12 }}>
                                    <button className="primary-button" onClick={() => setShowSummaryModal(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI QUEUE SUMMARY MODAL */}
                {showAiSummaryModal && (
                    <div className="doctor-modal-overlay">
                        <div className="doctor-modal" style={{ maxWidth: 620 }}>
                            <div className="doctor-modal-header">
                                <div>
                                    <p>AI QUEUE INSIGHT</p>
                                    <h2>Today's Queue Summary</h2>
                                </div>
                                <button onClick={() => setShowAiSummaryModal(false)}>×</button>
                            </div>
                            <div className="doctor-modal-content">
                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#374151' }}>
                                    {aiQueueSummary || 'No summary available.'}
                                </p>
                                <div style={{ marginTop: 16 }}>
                                    <button className="primary-button" onClick={() => setShowAiSummaryModal(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* =================================================
                    CURRENT PATIENT + AI INSIGHT
                ================================================= */}

                <section className="doctor-main-grid">

                    {/* CURRENT PATIENT */}

                    <div className="doctor-glass-card doctor-current-patient">

                        <div className="doctor-card-heading">

                            <div>

                                <span>
                                    CURRENT PATIENT
                                </span>

                                <h2>
                                    Patient Being Served
                                </h2>

                            </div>

                            {currentPatient && (
                                <span className="doctor-serving-badge">
                                    Serving
                                </span>
                            )}

                        </div>


                        {currentPatient ? (

                            <div className="doctor-current-content">

                                <div className="doctor-patient-avatar">
                                    {currentPatient.patientName
                                        .split(" ")
                                        .map(name => name[0])
                                        .join("")
                                        .slice(0, 2)
                                    }
                                </div>


                                <div className="doctor-patient-details">

                                    <h3>
                                        {currentPatient.patientName}
                                    </h3>

                                    <p>
                                        Queue Number:
                                        <strong>
                                            {" "}
                                            {currentPatient.queueNumber}
                                        </strong>
                                    </p>

                                    <p>
                                        {currentPatient.department}
                                    </p>

                                    <p>
                                        Appointment:
                                        {" "}
                                        {currentPatient.appointmentTime}
                                    </p>

                                    <p>
                                        Reason:
                                        {" "}
                                        {currentPatient.reason}
                                    </p>

                                    {/* AI prediction for current patient */}
                                    {(currentPatient.aiPrediction || currentPatient.AiPrediction) && (
                                        <div style={{
                                            marginTop: 10,
                                            padding: "10px 12px",
                                            background: "rgba(11,135,146,0.07)",
                                            borderLeft: "3px solid #0b8792",
                                            borderRadius: 8,
                                            fontSize: 12,
                                            lineHeight: 1.6,
                                            color: "#1e3a4a"
                                        }}>
                                            <span style={{ display: "block", fontSize: 10,
                                                fontWeight: 800, letterSpacing: "1px",
                                                color: "#0b8792", marginBottom: 4 }}>
                                                AI PREDICTION
                                            </span>
                                            {currentPatient.aiPrediction || currentPatient.AiPrediction}
                                        </div>
                                    )}

                                </div>

                            </div>

                        ) : (

                            <div className="doctor-no-patient">

                                <div>
                                    <img
                                        src={medicalImage}
                                        alt="No patient"
                                    />
                                </div>

                                <h3>
                                    No patient currently being served
                                </h3>

                                <p>
                                    Call the next patient when you are ready.
                                </p>

                            </div>

                        )}


                        <div className="doctor-consultation-actions">

                            <button
                                className="doctor-complete-button"
                                onClick={completeConsultation}
                                disabled={!currentPatient}
                            >
                                <img
                                    src={medicalImage}
                                    alt=""
                                />
                                Complete Consultation
                            </button>

                        </div>

                    </div>


                    {/* AI INSIGHT */}

                    <div className="doctor-glass-card doctor-ai-card">

                        <div className="doctor-ai-icon">
                            <img
                                src={aiImage}
                                alt="AI Queue Insight"
                            />
                        </div>

                        <span>
                            AI QUEUE INSIGHT
                        </span>

                        <h2>
                            AI Queue Summary
                        </h2>

                        <p>
                            Get an AI-generated analysis of today's
                            queue — workload, wait times, and patients
                            that may need urgent attention.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                            <button
                                className="doctor-secondary-button"
                                onClick={loadAiQueueSummary}
                                disabled={aiSummaryLoading}
                            >
                                {aiSummaryLoading ? 'Generating AI Summary…' : '✦ Generate AI Queue Summary'}
                            </button>

                            <button
                                className="doctor-secondary-button"
                                onClick={() => navigate("/doctor-queue")}
                            >
                                View Full Queue →
                            </button>

                            <button
                                className="doctor-secondary-button"
                                onClick={refreshAiPrediction}
                                disabled={aiRefreshing || !currentPatient}
                            >
                                {aiRefreshing ? 'Refreshing…' : 'Refresh Patient AI Prediction'}
                            </button>

                            <button
                                className="doctor-secondary-button"
                                onClick={loadPatientSummary}
                                disabled={!currentPatient}
                            >
                                View Patient Summary
                            </button>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    WAITING PATIENTS
                ================================================= */}

                <section className="doctor-queue-section">

                    <div className="doctor-section-heading">

                        <div>

                            <span>
                                TODAY'S QUEUE
                            </span>

                            <h2>
                                Waiting Patients
                            </h2>

                            <p>
                                Patients currently waiting for consultation.
                            </p>

                        </div>


                        <button
                            className="doctor-call-next-button"
                            onClick={callNextPatient}
                            disabled={waitingPatients.length === 0}
                        >
                            <img
                                src={aiImage}
                                alt=""
                            />
                            Call Next Patient
                        </button>

                    </div>


                    {waitingPatients.length === 0 ? (

                        <div className="doctor-empty-state">

                            <div>
                                <img
                                    src={medicalImage}
                                    alt="Queue complete"
                                />
                            </div>

                            <h3>
                                No patients waiting
                            </h3>

                            <p>
                                All patients in today's queue have been served.
                            </p>

                        </div>

                    ) : (

                        <div className="doctor-table-container">

                            <table className="doctor-queue-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Position
                                        </th>

                                        <th>
                                            Queue
                                        </th>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Appointment
                                        </th>

                                        <th>
                                            Reason
                                        </th>

                                        <th>
                                            AI Prediction
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {waitingPatients.map(
                                        (patient) => (

                                            <tr
                                                key={patient.queueNumber}
                                            >

                                                <td>
                                                    <span className="doctor-position">
                                                        #{patient.position || patient.currentPosition}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {patient.queueNumber}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {patient.patientName}
                                                </td>

                                                <td>
                                                    {patient.appointmentTime
                                                        ? String(patient.appointmentTime).slice(0, 5)
                                                        : "—"}
                                                </td>

                                                <td>
                                                    {patient.reason}
                                                </td>

                                                <td style={{
                                                    maxWidth: 220,
                                                    fontSize: 12,
                                                    color: "#5a7a8a",
                                                    lineHeight: 1.5
                                                }}>
                                                    {patient.aiPrediction || patient.AiPrediction || (
                                                        <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>

                                                <td>

                                                    <span className="doctor-waiting-status">
                                                        {patient.status}
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section className="doctor-quick-actions">

                    <div className="doctor-section-heading">

                        <div>

                            <span>
                                QUICK ACTIONS
                            </span>

                            <h2>
                                Manage your work
                            </h2>

                        </div>

                    </div>


                    <div className="doctor-action-grid">

                        <button
                            className="doctor-action-card"
                            onClick={() =>
                                navigate("/doctor-queue")
                            }
                        >

                            <span>
                                <img
                                    src={queueImage}
                                    alt="Patient Queue"
                                />
                            </span>

                            <strong>
                                Patient Queue
                            </strong>

                            <small>
                                View and manage the complete queue
                            </small>

                        </button>


                        <button
                            className="doctor-action-card"
                            onClick={() =>
                                navigate("/doctor-appointments")
                            }
                        >

                            <span>
                                <img
                                    src={appointmentImage}
                                    alt="Appointments"
                                />
                            </span>

                            <strong>
                                Appointments
                            </strong>

                            <small>
                                View today's scheduled appointments
                            </small>

                        </button>


                        <button
                            className="doctor-action-card"
                            onClick={() =>
                                navigate("/doctor-profile")
                            }
                        >

                            <span>
                                <img
                                    src={profileImage}
                                    alt="My Profile"
                                />
                            </span>

                            <strong>
                                My Profile
                            </strong>

                            <small>
                                View your professional information
                            </small>

                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default DoctorDashboard;