import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import api from "../../services/api";

import logo from "../../assets/images/logo.jpg";
import emoji1 from "../../assets/images/emoji-1.jpg";
import emoji2 from "../../assets/images/emoji-2.jpg";
import emoji3 from "../../assets/images/emoji-3.jpg";
import emoji4 from "../../assets/images/emoji-4.jpg";
import emoji5 from "../../assets/images/emoji-5.jpg";
import emoji6 from "../../assets/images/emoji-6.jpg";
import dashboardImage from "../../assets/images/dashboard.png";
import profileImage from "../../assets/images/profile.png";
import logoutImage from "../../assets/images/logout.png";
import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";


function PatientQueue() {

    const navigate = useNavigate();

    const [queue, setQueue] = useState(null);
    const [_loading, setLoading] = useState(true);
    const [_error, setError] = useState("");
    const [notifications, setNotifications] = useState([]);

    const loadNotifications = async () => {
        try {
            const response = await api.get("/Notification/my");
            setNotifications(Array.isArray(response.data) ? response.data : []);
        } catch {
            setNotifications([]);
        }
    };

    useEffect(() => {
        let mounted = true;
        let connection = null;

        const load = async () => {
            try {
                setLoading(true);

                const response = await api.get("/Queue/my");

                if (mounted) setQueue(response.data || null);
            } catch (err) {
                console.error(err);

                if (mounted)
                    setError(err.response?.data?.message || "Unable to load queue status.");
            } finally {
                if (mounted) setLoading(false);
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
                        load();
                    }
                });

                connection.on("NotificationUpdated", () => {
                    if (mounted) {
                        loadNotifications();
                    }
                });

                await connection.start();
            } catch (err) {
                console.error("SignalR queue connection failed:", err);
            }
        };

        load();
        loadNotifications();
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

    if (_loading) {
        return (
            <div className="patient-dashboard">
                <main className="patient-main">
                    <div style={{ padding: 40 }}>Loading queue status...</div>
                </main>
            </div>
        );
    }

    if (_error) {
        return (
            <div className="patient-dashboard">
                <main className="patient-main">
                    <div style={{ padding: 40, color: "#b91c1c" }}>{_error}</div>
                </main>
            </div>
        );
    }

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
                    maxWidth: 340,
                }}>
                    {latestNotifications.map((notification) => (
                        <div key={notification.id} style={{
                            background: "rgba(15, 23, 42, 0.9)",
                            color: "#f8fafc",
                            borderRadius: 12,
                            padding: "12px 14px",
                            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.28)",
                        }}>
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

                        <h2>
                            Smartcare Queue
                        </h2>

                        <p>
                            Smarter healthcare for Better care.
                        </p>

                    </div>

                </div>


                <nav className="patient-navigation">

                    <button
                        className="patient-nav-item"
                        onClick={() =>
                            navigate("/patientDashboard")
                        }
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
                        onClick={() =>
                            navigate("/patientAppointments")
                        }
                    >
                        <img
                            src={appointmentImage}
                            alt=""
                            className="patient-nav-icon"
                        />
                        Appointments
                    </button>


                    <button
                        className="patient-nav-item active"
                        onClick={() =>
                            navigate("/patientQueue")
                        }
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
                        onClick={() =>
                            navigate("/patientProfile")
                        }
                    >
                        <img
                            src={profileImage}
                            alt=""
                            className="patient-nav-icon"
                        />
                        My Profile
                    </button>

                </nav>


                <div className="patient-sidebar-bottom">

                    <button
                        className="patient-logout-button"
                        onClick={() =>
                            navigate("/login")
                        }
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
                MAIN
            ========================= */}

            <main className="patient-main">

                <header className="patient-topbar">

                    <div>

                        <p className="patient-page-label">
                            QUEUE STATUS
                        </p>

                        <h1>
                            Your Queue Status
                        </h1>

                        <p className="patient-subtitle">
                            Monitor your position and estimated
                            waiting time.
                        </p>

                    </div>


                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/patientDashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                </header>


                {/* =========================
                    QUEUE TICKET
                ========================= */}

                <section className="patient-queue-section">

                    <div className="patient-glass-card queue-ticket">

                        <div className="queue-ticket-header">

                            <div>
                                <span>DIGITAL QUEUE TICKET</span>
                                <h2>{queue?.queueNumber ?? "--"}</h2>
                            </div>

                            <div className="queue-status">
                                {queue?.status ?? "--"}
                            </div>

                        </div>


                        <div className="queue-position">

                            <span>CURRENT POSITION</span>

                            <strong>
                                #{queue?.currentPosition ?? "--"}
                            </strong>

                            <p>patients ahead of you</p>

                        </div>


                        <div className="queue-wait">

                            <span>ESTIMATED WAITING TIME</span>

                            <strong>
                                {queue?.estimatedWaitTime != null
                                    ? `${queue.estimatedWaitTime} min`
                                    : "--"}
                            </strong>

                        </div>


                        <div className="queue-details">

                            <div>
                                <span>DEPARTMENT</span>
                                <strong>{queue?.department ?? "--"}</strong>
                            </div>

                            <div>
                                <span>DATE</span>
                                <strong>
                                    {queue?.appointmentDate
                                        ? String(queue.appointmentDate).slice(0, 10)
                                        : "--"}
                                </strong>
                            </div>

                            <div>
                                <span>TIME</span>
                                <strong>
                                    {queue?.appointmentTime
                                        ? String(queue.appointmentTime).slice(0, 5)
                                        : "--"}
                                </strong>
                            </div>

                            <div>
                                <span>REASON</span>
                                <strong>{queue?.reason ?? "--"}</strong>
                            </div>

                        </div>

                    </div>


                    {/* AI PREDICTION CARD */}

                    <div className="patient-glass-card queue-ai-card">

                        <div className="queue-ai-icon">
                            <img
                                src={emoji6}
                                alt="AI"
                                className="patient-content-icon"
                            />
                        </div>

                        <div style={{ flex: 1 }}>

                            <span>AI WAITING-TIME PREDICTION</span>

                            <h2 style={{ margin: "8px 0 6px" }}>
                                Estimated wait:{" "}
                                {queue?.estimatedWaitTime != null
                                    ? `${queue.estimatedWaitTime} minutes`
                                    : "--"}
                            </h2>

                            {/* Full AI explanation from Ollama */}
                            {queue?.status === "Serving" && queue?.statusMessage ? (
                                <div style={{
                                    marginTop: 10,
                                    padding: "12px 14px",
                                    background: "rgba(15, 118, 110, 0.08)",
                                    borderLeft: "3px solid #0f766e",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    lineHeight: 1.65,
                                    color: "#134e4a",
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {queue.statusMessage}
                                </div>
                            ) : queue?.aiPrediction ? (
                                <div style={{
                                    marginTop: 10,
                                    padding: "12px 14px",
                                    background: "rgba(11,135,146,0.06)",
                                    borderLeft: "3px solid #0b8792",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    lineHeight: 1.65,
                                    color: "#1e3a4a",
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {queue.aiPrediction}
                                </div>
                            ) : (
                                <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6b7280" }}>
                                    Your estimated waiting time is calculated based on
                                    current queue activity. The AI prediction will appear
                                    once you are called.
                                </p>
                            )}

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default PatientQueue;