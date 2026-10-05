import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import logo from "../../assets/images/logo.jpg";

import emoji1 from "../../assets/images/emoji-1.jpg";
import emoji2 from "../../assets/images/emoji-2.jpg";
import emoji3 from "../../assets/images/emoji-3.jpg";
import emoji4 from "../../assets/images/emoji-4.jpg";
import emoji5 from "../../assets/images/emoji-5.jpg";
import dashboardImage from "../../assets/images/dashboard.png";
import profileImage from "../../assets/images/profile.png";
import logoutImage from "../../assets/images/logout.png";
import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";

function PatientDashboard() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const patientName = user?.name || "Patient";

    // derive initials for avatar
    const initials = (() => {
        const n = patientName || "";
        const parts = n.trim().split(/\s+/);
        if (parts.length === 0) return "P";
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    })();

    // ── Live queue + appointment data ─────────────────────────────────────────
    const [queueData, setQueueData]           = useState(null);
    const [appointmentCount, setAppointmentCount] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const loadNotifications = async () => {
        try {
            const response = await api.get("/Notification/my");
            const list = Array.isArray(response.data) ? response.data : [];
            setNotifications(list);
        } catch {
            setNotifications([]);
        }
    };

    const checkReminderNotifications = async () => {
        try {
            await api.post("/Notification/check-reminders");
            await loadNotifications();
        } catch {
            // Ignore reminder check failures; they are non-blocking.
        }
    };

    useEffect(() => {
        let mounted = true;
        let connection = null;

        const loadOverview = async () => {
            try {
                const qResp = await api.get("/Queue/my");
                if (mounted) setQueueData(qResp.data || null);
            } catch {
                // No active queue entry today — that's fine
            }

            try {
                const aResp = await api.get("/Appointment/my");
                const list = Array.isArray(aResp.data) ? aResp.data
                    : Array.isArray(aResp.data?.data) ? aResp.data.data : [];
                if (mounted) setAppointmentCount(list.length);
            } catch {
                // Silently ignore
            }
        };

        const startQueueHub = async () => {
            try {
                connection = new HubConnectionBuilder()
                    .withUrl("http://localhost:5171/queueHub", {
                        accessTokenFactory: () => localStorage.getItem("token") || "",
                    })
                    .withAutomaticReconnect()
                    .configureLogging(LogLevel.Warning)
                    .build();

                connection.on("QueueUpdated", () => {
                    if (mounted) {
                        loadOverview();
                    }
                });

                connection.on("NotificationUpdated", () => {
                    if (mounted) {
                        loadNotifications();
                    }
                });

                await connection.start();
            } catch (err) {
                console.error("SignalR connection failed:", err);
            }
        };

        loadOverview();
        loadNotifications();
        checkReminderNotifications();
        startQueueHub();

        return () => {
            mounted = false;
            if (connection) {
                connection.off("QueueUpdated");
                connection.off("NotificationUpdated");
                connection.stop();
            }
        };
    }, []);

    const latestNotifications = notifications.slice(0, 3);

    return (
        <div className="patient-dashboard">

            {latestNotifications.length > 0 && (
                <div style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    maxWidth: 360,
                }}>
                    {latestNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            style={{
                                background: "rgba(15, 23, 42, 0.9)",
                                color: "#f8fafc",
                                borderRadius: 12,
                                padding: "12px 14px",
                                boxShadow: "0 16px 40px rgba(15, 23, 42, 0.28)",
                                border: "1px solid rgba(148, 163, 184, 0.2)",
                            }}
                        >
                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.8 }}>
                                {notification.title || "Notification"}
                            </div>
                            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5 }}>
                                {notification.message}
                            </div>
                            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
                                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Just now"}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="patient-sidebar">

                <div className="patient-brand">

                    <img
                        src={logo}
                        alt="Smartcare Queue"
                        className="patient-logo"
                    />

                    <div className="patient-brand-text">
                        <h2>Smartcare Queue</h2>
                        <p>Smarter healthcare for Better care.</p>
                    </div>

                </div>


                {/* Navigation */}

                <nav className="patient-navigation">

                    <button
                        className="patient-nav-item active"
                        onClick={() => navigate("/patientDashboard")}
                    >
                        <img
                            src={dashboardImage}
                            alt=""
                            className="patient-nav-icon"
                        />
                        Dashboard
                    </button>


                    <button
                        className="patient-nav-item"
                        onClick={() => navigate("/patientAppointments")}
                    >
                        <img
                            src={appointmentImage}
                            alt=""
                            className="patient-nav-icon"
                        />
                        Appointments
                    </button>


                    <button
                        className="patient-nav-item"
                        onClick={() => navigate("/patientQueue")}
                    >
                        <img
                            src={queueImage}
                            alt=""
                            className="patient-nav-icon"
                        />
                        Queue Status
                    </button>


                    <button
                        className="patient-nav-item"
                        onClick={() => navigate("/patientProfile")}
                    >
                        <img
                            src={profileImage}
                            alt=""
                            className="patient-nav-icon"
                        />
                        My Profile
                    </button>

                </nav>


                {/* Logout */}

                <div className="patient-sidebar-bottom">

                    <button
                        className="patient-logout-button"
                        onClick={handleLogout}
                    >
                        <img
                            src={logoutImage}
                            alt=""
                            className="patient-nav-icon"
                        />
                        Logout
                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="patient-main">

                <div className="patient-hero">

                    <div className="patient-hero-inner">

                        <div className="patient-hero-text">
                            <p className="patient-page-label">PATIENT DASHBOARD</p>
                            <h1>Welcome back, {patientName}</h1>
                            <p className="patient-subtitle">Manage your appointments, queue status and personal information from one place.</p>
                        </div>

                        <div className="patient-hero-action">
                            <button
                                className="patient-profile-button"
                                onClick={() => navigate("/patientProfile")}
                            >
                                <span className="patient-avatar">{initials}</span>
                                <span className="patient-profile-label">My Profile</span>
                            </button>
                        </div>

                    </div>

                    <div className="patient-cards-row">

                        <div className="patient-glass-card patient-dashboard-card" onClick={() => navigate("/patientAppointments")}>
                                <div className="patient-card-media">
                                    <img src={emoji3} alt="Appointments" className="patient-media-image" />
                                </div>
                                <div className="patient-card-body">
                                    <div>
                                        <h2>Appointments</h2>
                                        <p>View your upcoming and previous appointments.</p>
                                    </div>

                                    <div className="patient-card-footer">
                                        <button className="patient-card-button">View Appointments →</button>
                                    </div>
                                </div>
                        </div>

                        <div className="patient-glass-card patient-dashboard-card" onClick={() => navigate("/patientQueue")}>
                            <div className="patient-card-media">
                                <img src={emoji4} alt="Queue" className="patient-media-image" />
                            </div>
                            <div className="patient-card-body">
                                <div>
                                    <h2>Queue Status</h2>
                                    <p>Check your current queue position and estimated waiting time.</p>
                                </div>

                                <div className="patient-card-footer">
                                    <button className="patient-card-button">View Queue →</button>
                                </div>
                            </div>
                        </div>

                        <div className="patient-glass-card patient-dashboard-card" onClick={() => navigate("/patientProfile")}>
                            <div className="patient-card-media">
                                <img src={emoji2} alt="Profile" className="patient-media-image" />
                            </div>
                            <div className="patient-card-body">
                                <div>
                                    <h2>My Profile</h2>
                                    <p>View and update your personal and healthcare information.</p>
                                </div>

                                <div className="patient-card-footer">
                                    <button className="patient-card-button">View Profile →</button>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>


                {/* =========================
                    QUICK INFORMATION
                ========================= */}

                <section className="patient-overview-section">

                    <div className="patient-section-title">
                        <p>QUICK OVERVIEW</p>
                        <h2>Your healthcare at a glance</h2>
                    </div>

                    <div className="patient-overview-grid">

                        <div className="patient-overview-card">
                            <span>Upcoming Appointments</span>
                            <strong>
                                {appointmentCount !== null ? appointmentCount : "--"}
                            </strong>
                        </div>

                        <div className="patient-overview-card">
                            <span>Queue Position</span>
                            <strong>
                                {queueData
                                    ? `#${queueData.currentPosition}`
                                    : "--"}
                            </strong>
                        </div>

                        <div className="patient-overview-card">
                            <span>Estimated Waiting Time</span>
                            <strong>
                                {queueData?.estimatedWaitTime != null
                                    ? `${queueData.estimatedWaitTime} min`
                                    : "--"}
                            </strong>
                        </div>

                    </div>

                    {/* AI prediction banner — only shown when patient is in today's queue */}
                    {(queueData?.status === "Serving" || queueData?.statusMessage) && (
                        <div style={{
                            marginTop: 20,
                            padding: "16px 20px",
                            background: queueData?.status === "Serving"
                                ? "rgba(15, 118, 110, 0.09)"
                                : "rgba(11,135,146,0.07)",
                            border: "1px solid rgba(11,135,146,0.18)",
                            borderRadius: 14,
                            display: "flex",
                            gap: 14,
                            alignItems: "flex-start"
                        }}>
                            <span style={{ fontSize: 22, flexShrink: 0 }}>{queueData?.status === "Serving" ? "📍" : "🤖"}</span>
                            <div>
                                <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 800,
                                    letterSpacing: "1px", color: "#0b8792", textTransform: "uppercase" }}>
                                    {queueData?.status === "Serving" ? "Consultation Update" : "AI Wait-Time Prediction"}
                                </p>
                                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65,
                                    color: "#1e3a4a" }}>
                                    {queueData?.statusMessage || queueData?.aiPrediction}
                                </p>
                            </div>
                        </div>
                    )}

                    {queueData?.aiPrediction && queueData.status !== "Serving" && (
                        <div style={{
                            marginTop: 12,
                            padding: "12px 16px",
                            background: "rgba(11,135,146,0.05)",
                            borderLeft: "3px solid #0b8792",
                            borderRadius: 8,
                            fontSize: 13,
                            lineHeight: 1.65,
                            color: "#1e3a4a"
                        }}>
                            {queueData.aiPrediction}
                        </div>
                    )}

                </section>

            </main>

        </div>
    );
}

export default PatientDashboard;