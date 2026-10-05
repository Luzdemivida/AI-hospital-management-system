import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import api from "../../services/api";
import dashboardImage from "../../assets/images/dashboard.png";
import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";
import profileImage from "../../assets/images/profile.png";
import logoutImage from "../../assets/images/logout.png";
import patientImage from "../../assets/images/patients.png";
import "./AdminUsers.css";

function AdminPatients() {
    const navigate = useNavigate();

    const [users, setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState("");

    const loadPatients = async () => {
        try {
            setLoading(true);
            setError("");
            // Admin/users endpoint returns all roles — filter to Patient only
            const resp = await api.get("/Admin/users");
            const all  = Array.isArray(resp.data)
                ? resp.data
                : Array.isArray(resp.data?.data) ? resp.data.data : [];
            setUsers(all.filter(u => (u.role || u.Role || "").toLowerCase() === "patient"));
        } catch (err) {
            console.error("Failed to load patients:", err);
            setError(err.response?.data?.message || "Unable to load patients.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPatients(); }, []);

    const getName = (u) =>
        u.firstName || u.lastName
            ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
            : u.name || "Unknown";

    return (
        <div className="admin-dashboard">

            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <img src={logo} alt="Smartcare Queue" className="admin-logo" />
                    <div className="admin-brand-text">
                        <h2>Smartcare Queue</h2>
                        <p>Smarter healthcare for Better care.</p>
                    </div>
                </div>

                <nav className="admin-navigation">
                    <button className="admin-nav-item" onClick={() => navigate("/admin-dashboard")}>
                        <img src={dashboardImage} alt="Dashboard" className="admin-nav-image" />
                        Dashboard
                    </button>
                    <button className="admin-nav-item active" onClick={() => navigate("/admin-patients")}>
                        <img src={patientImage} alt="Patients" className="admin-nav-image" />
                        Patients
                    </button>
                    <button className="admin-nav-item" onClick={() => navigate("/admin-doctors")}>
                        🩺 Doctors
                    </button>
                    <button className="admin-nav-item" onClick={() => navigate("/admin-appointments")}>
                        <img src={appointmentImage} alt="Appointments" className="admin-nav-image" />
                        Appointments
                    </button>
                    <button className="admin-nav-item" onClick={() => navigate("/admin-queue")}>
                        <img src={queueImage} alt="Queue" className="admin-nav-image" />
                        Queue
                    </button>
                    <button className="admin-nav-item" onClick={() => navigate("/admin-users")}>
                        🔐 Users
                    </button>
                    <button className="admin-nav-item" onClick={() => navigate("/admin-profile")}>
                        <img src={profileImage} alt="My Profile" className="admin-nav-image" />
                        My Profile
                    </button>
                </nav>

                <div className="admin-sidebar-bottom">
                    <button className="admin-logout-button" onClick={() => navigate("/login")}>
                        <img src={logoutImage} alt="Logout" className="admin-nav-image" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <p className="admin-page-label">PATIENT MANAGEMENT</p>
                        <h1>Registered Patients</h1>
                        <p className="admin-subtitle">
                            View all registered patients in the Smartcare Queue system.
                        </p>
                    </div>
                    <button className="admin-secondary-button" onClick={loadPatients}>
                        ↻ Refresh
                    </button>
                </header>

                <section className="admin-content-card">
                    <div className="admin-section-heading">
                        <div>
                            <p>PATIENTS</p>
                            <h2>Patient Directory</h2>
                        </div>
                        <strong>{users.length} Patients</strong>
                    </div>

                    {loading && <div className="admin-loading">Loading patients…</div>}

                    {!loading && error && <div className="admin-error">{error}</div>}

                    {!loading && !error && users.length === 0 && (
                        <div className="admin-empty-state">
                            <div>👥</div>
                            <h3>No patients found</h3>
                            <p>No registered patients were returned.</p>
                        </div>
                    )}

                    {!loading && !error && users.length > 0 && (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, idx) => (
                                        <tr key={u.id || u.userId || idx}>
                                            <td>{idx + 1}</td>
                                            <td><strong>{getName(u)}</strong></td>
                                            <td>{u.email || "—"}</td>
                                            <td>{u.phone || "—"}</td>
                                            <td>
                                                <span className={
                                                    String(u.status || "active").toLowerCase() === "active"
                                                        ? "admin-status active"
                                                        : "admin-status inactive"
                                                }>
                                                    {u.status || "Active"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminPatients;
