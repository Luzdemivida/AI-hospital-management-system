import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";

import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";
import profileImage from "../../assets/images/profile.png";
import dashboardImage from "../../assets/images/dashboard.png";
import logoutImage from "../../assets/images/logout.png";

import api from "../../services/api";
import "./AdminQueue.css";

function AdminQueue() {
    const navigate = useNavigate();

    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const loadQueue = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/Queue/today");

            console.log("Queue API response:", response.data);

            const data = response.data;

            if (Array.isArray(data)) {
                setQueue(data);
            } else if (Array.isArray(data?.data)) {
                setQueue(data.data);
            } else if (Array.isArray(data?.queue)) {
                setQueue(data.queue);
            } else {
                setQueue([]);
            }

        } catch (err) {
            console.error("Failed to load queue:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load today's queue."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQueue();
    }, []);

    const callNextPatient = async () => {
        try {
            setActionLoading(true);

            await api.put("/Queue/call-next");

            alert("Next patient has been called.");

            await loadQueue();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to call the next patient."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const completePatient = async (queueId) => {
        try {
            setActionLoading(true);

            await api.put(`/Queue/${queueId}/complete`);

            alert("Queue entry completed successfully.");

            await loadQueue();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to complete this queue entry."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const getQueueId = (item) => {
        return item.id || item.queueId;
    };

    const getQueueNumber = (item) => {
        return (
            item.queueNumber ||
            item.queue_number ||
            item.number ||
            "—"
        );
    };

    const getPatientName = (item) => {
        if (item.patientName) {
            return item.patientName;
        }

        if (item.patient?.firstName || item.patient?.lastName) {
            return `${item.patient?.firstName || ""} ${
                item.patient?.lastName || ""
            }`.trim();
        }

        return "Unknown Patient";
    };

    const getDoctorName = (item) => {
        if (item.doctorName) {
            return item.doctorName;
        }

        if (item.doctor?.firstName || item.doctor?.lastName) {
            return `${item.doctor?.firstName || ""} ${
                item.doctor?.lastName || ""
            }`.trim();
        }

        return "—";
    };

    const getStatus = (item) => {
        return item.status || item.queueStatus || "Waiting";
    };

    const waitingCount = queue.filter(
        (item) =>
            String(getStatus(item)).toLowerCase() === "waiting"
    ).length;

    const currentPatient = queue.find(
        (item) =>
            String(getStatus(item)).toLowerCase() === "called" ||
            String(getStatus(item)).toLowerCase() === "in progress"
    );

    return (
        <div className="admin-dashboard">

            <aside className="admin-sidebar">

                <div className="admin-brand">

                    <img
                        src={logo}
                        alt="Smartcare Queue"
                        className="admin-logo"
                    />

                    <div className="admin-brand-text">
                        <h2>Smartcare Queue</h2>
                        <p>
                            Smarter healthcare for Better care.
                        </p>
                    </div>

                </div>

                <nav className="admin-navigation">

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin-dashboard")}
                    >
                        <img
                            src={dashboardImage}
                            alt="Dashboard"
                            className="admin-nav-image"
                        />
                        Dashboard
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin-patients")}
                    >
                        <span>👥</span>
                        Patients
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin-doctors")}
                    >
                        <span>🩺</span>
                        Doctors
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin-appointments")}
                    >
                        <img
                            src={appointmentImage}
                            alt="Appointments"
                            className="admin-nav-image"
                        />
                        Appointments
                    </button>

                    <button
                        className="admin-nav-item active"
                        onClick={() => navigate("/admin-queue")}
                    >
                        <img
                            src={queueImage}
                            alt="Queue"
                            className="admin-nav-image"
                        />
                        Queue
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin-users")}
                    >
                        <span>🔐</span>
                        Users
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate("/admin-profile")}
                    >
                        <img
                            src={profileImage}
                            alt="My Profile"
                            className="admin-nav-image"
                        />
                        My Profile
                    </button>

                </nav>

                <div className="admin-sidebar-bottom">

                    <button
                        className="admin-logout-button"
                        onClick={() => navigate("/login")}
                    >
                        <img
                            src={logoutImage}
                            alt="Logout"
                            className="admin-nav-image"
                        />
                        Logout
                    </button>

                </div>

            </aside>

            <main className="admin-main">

                <header className="admin-topbar">

                    <div>

                        <p className="admin-page-label">
                            QUEUE MANAGEMENT
                        </p>

                        <h1>
                            Today's Patient Queue
                        </h1>

                        <p className="admin-subtitle">
                            Monitor and manage today's patient
                            consultation queue.
                        </p>

                    </div>

                    <button
                        className="admin-secondary-button"
                        onClick={loadQueue}
                    >
                        ↻ Refresh
                    </button>

                </header>

                <section className="admin-queue-statistics">

                    <div className="admin-queue-stat-card">
                        <span>Total Queue</span>
                        <strong>{queue.length}</strong>
                    </div>

                    <div className="admin-queue-stat-card">
                        <span>Waiting</span>
                        <strong>{waitingCount}</strong>
                    </div>

                    <div className="admin-queue-stat-card">
                        <span>Current Patient</span>
                        <strong>
                            {currentPatient
                                ? getQueueNumber(currentPatient)
                                : "—"}
                        </strong>
                    </div>

                </section>

                <section className="admin-content-card">

                    <div className="admin-section-heading">

                        <div>
                            <p>TODAY'S QUEUE</p>

                            <h2>
                                Queue Activity
                            </h2>
                        </div>

                        <button
                            className="admin-primary-button"
                            onClick={callNextPatient}
                            disabled={
                                actionLoading ||
                                queue.length === 0
                            }
                        >
                            📢 Call Next Patient
                        </button>

                    </div>

                    {loading && (
                        <div className="admin-loading">
                            Loading queue...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="admin-error">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        queue.length === 0 && (
                            <div className="admin-empty-state">

                                <div>✓</div>

                                <h3>
                                    Queue is empty
                                </h3>

                                <p>
                                    There are currently no
                                    patients in today's queue.
                                </p>

                            </div>
                        )}

                    {!loading &&
                        !error &&
                        queue.length > 0 && (

                            <div className="admin-table-wrapper">

                                <table className="admin-table">

                                    <thead>

                                        <tr>
                                            <th>#</th>
                                            <th>Queue</th>
                                            <th>Patient</th>
                                            <th>Doctor</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {queue.map(
                                            (item, index) => {

                                                const queueId =
                                                    getQueueId(item);

                                                const status =
                                                    getStatus(item);

                                                return (
                                                    <tr
                                                        key={
                                                            queueId ||
                                                            index
                                                        }
                                                    >

                                                        <td>
                                                            {index + 1}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    getQueueNumber(
                                                                        item
                                                                    )
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                getPatientName(
                                                                    item
                                                                )
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                getDoctorName(
                                                                    item
                                                                )
                                                            }
                                                        </td>

                                                        <td>
                                                            <span className="admin-status">
                                                                {
                                                                    status
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>

                                                            {queueId && (
                                                                <button
                                                                    className="admin-complete-button"
                                                                    disabled={
                                                                        actionLoading ||
                                                                        String(
                                                                            status
                                                                        ).toLowerCase() ===
                                                                            "completed"
                                                                    }
                                                                    onClick={() =>
                                                                        completePatient(
                                                                            queueId
                                                                        )
                                                                    }
                                                                >
                                                                    Complete
                                                                </button>
                                                            )}

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                </section>

            </main>

        </div>
    );
}

export default AdminQueue;