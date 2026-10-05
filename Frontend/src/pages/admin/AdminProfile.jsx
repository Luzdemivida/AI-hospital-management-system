import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api";

import logo from "../../assets/images/logo.jpg";
import dashboardImage from "../../assets/images/dashboard.png";
import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";
import patientImage from "../../assets/images/patients.png";
import profileImage from "../../assets/images/profile.png";
import logoutImage from "../../assets/images/logout.png";

function AdminProfile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "Admin",
        status: "Active",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            try {
                const currentUser = user || JSON.parse(localStorage.getItem("user") || "null");
                const currentUserId = currentUser?.id ?? currentUser?.userId ?? null;

                if (mounted) {
                    setProfile({
                        firstName: currentUser?.firstName || currentUser?.first_name || "",
                        lastName: currentUser?.lastName || currentUser?.last_name || "",
                        email: currentUser?.email || "",
                        phone: currentUser?.phone || "",
                        role: currentUser?.role || "Admin",
                        status: currentUser?.status || "Active",
                    });
                }

                if (!currentUserId) {
                    return;
                }

                const response = await api.get("/Admin/users");
                const users = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.data)
                        ? response.data.data
                        : [];

                const matched = users.find((item) => {
                    const id = item.id ?? item.userId;
                    return Number(id) === Number(currentUserId);
                });

                if (matched && mounted) {
                    setProfile({
                        firstName: matched.firstName || matched.first_name || "",
                        lastName: matched.lastName || matched.last_name || "",
                        email: matched.email || "",
                        phone: matched.phone || "",
                        role: matched.role || "Admin",
                        status: matched.status || "Active",
                    });
                }
            } catch (err) {
                console.error("Failed to load admin profile:", err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [user]);

    return (
        <div className="admin-dashboard">
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
                    <button className="admin-nav-item" onClick={() => navigate("/admin-patients")}>
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
                    <button className="admin-nav-item active" onClick={() => navigate("/admin-profile")}>
                        <img src={profileImage} alt="My Profile" className="admin-nav-image" />
                        My Profile
                    </button>
                </nav>

                <div className="admin-sidebar-bottom">
                    <button className="admin-logout-button" onClick={handleLogout}>
                        <img src={logoutImage} alt="Logout" className="admin-nav-image" />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <p className="admin-page-label">ADMIN PROFILE</p>
                        <h1>My Profile</h1>
                        <p className="admin-subtitle">View your administrator account information.</p>
                    </div>
                </header>

                <section className="admin-content-card">
                    {loading ? (
                        <div className="admin-loading">Loading profile…</div>
                    ) : (
                        <div className="admin-profile-grid">
                            <div className="admin-profile-card">
                                <h3>Account Overview</h3>
                                <p><strong>Name:</strong> {`${profile.firstName} ${profile.lastName}`.trim() || "Not available"}</p>
                                <p><strong>Email:</strong> {profile.email || "Not available"}</p>
                                <p><strong>Phone:</strong> {profile.phone || "Not available"}</p>
                                <p><strong>Role:</strong> {profile.role}</p>
                                <p><strong>Status:</strong> {profile.status}</p>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminProfile;
