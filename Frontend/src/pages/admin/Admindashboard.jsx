import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import logo from "../../assets/images/logo.jpg";

import dashboardImage from "../../assets/images/dashboard.png";
import patientImage from "../../assets/images/patients.png";
import doctorImage from "../../assets/images/doctor.jpeg";
import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";
import usersImage from "../../assets/images/users.png";
import profileImage from "../../assets/images/profile.png";
import logoutImage from "../../assets/images/logout.png";

import "./AdminDashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();

    const adminName = "Administrator";

    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        waitingPatients: 0,
        servingPatients: 0,
        completedPatients: 0,
        averageWaitTime: 0,
    });

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const response = await api.get("/Admin/dashboard");

                const data = response.data || {};

                if (mounted) {
                    setStats({
                        totalPatients: data.totalPatients || data.totalPatients || 0,
                        totalDoctors: data.totalDoctors || 0,
                        todayAppointments: data.todayAppointments || data.todayAppointments || 0,
                        waitingPatients: data.waitingPatients || data.waitingPatients || 0,
                    });
                }
            } catch (err) {
                console.error("Failed to load admin dashboard:", err);
            }
        };

        const loadStats = async () => {
            try {
                const resp = await api.get("/Admin/statistics");
                const s = resp.data || {};

                if (mounted) {
                    setStats((prev) => ({
                        ...prev,
                        servingPatients: s.servingPatients || s.servingPatients || prev.servingPatients || 0,
                        completedPatients: s.completedPatients || prev.completedPatients || 0,
                        averageWaitTime: s.averageWaitTime || prev.averageWaitTime || 0,
                    }));
                }
            } catch (err) {
                console.error("Failed to load admin statistics:", err);
            }
        };

        load();
        loadStats();

        return () => (mounted = false);
    }, []);

    return (
        <div className="admin-dashboard">

            {/* ==================================================
                SIDEBAR
            ================================================== */}

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


                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <nav className="admin-navigation">

                    {/* DASHBOARD */}

                    <button
                        className="admin-nav-item active"
                        onClick={() =>
                            navigate("/admin-dashboard")
                        }
                    >
                        <img
                            src={dashboardImage}
                            alt="Dashboard"
                            className="admin-nav-image"
                        />

                        Dashboard
                    </button>


                    {/* PATIENTS */}

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin-patients")
                        }
                    >
                        <img
                            src={patientImage}
                            alt="Patients"
                            className="admin-nav-image"
                        />

                        Patients
                    </button>


                    {/* DOCTORS */}

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin-doctors")
                        }
                    >
                        <img
                            src={doctorImage}
                            alt="Doctors"
                            className="admin-nav-image"
                        />

                        Doctors
                    </button>


                    {/* APPOINTMENTS */}

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin-appointments")
                        }
                    >
                        <img
                            src={appointmentImage}
                            alt="Appointments"
                            className="admin-nav-image"
                        />

                        Appointments
                    </button>


                    {/* QUEUE */}

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin-queue")
                        }
                    >
                        <img
                            src={queueImage}
                            alt="Queue"
                            className="admin-nav-image"
                        />

                        Queue
                    </button>


                    {/* USERS */}

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin-users")
                        }
                    >
                        <img
                            src={usersImage}
                            alt="Users"
                            className="admin-nav-image"
                        />

                        Users
                    </button>


                    {/* PROFILE */}

                    <button
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin-profile")
                        }
                    >
                        <img
                            src={profileImage}
                            alt="My Profile"
                            className="admin-nav-image"
                        />

                        My Profile
                    </button>

                </nav>


                {/* ==================================================
                    SIDEBAR BOTTOM
                ================================================== */}

                <div className="admin-sidebar-bottom">

                    <button
                        className="admin-logout-button"
                        onClick={() =>
                            navigate("/login")
                        }
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


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="admin-main">

                {/* ==================================================
                    TOP BAR
                ================================================== */}

                <header className="admin-topbar">

                    <div>

                        <p className="admin-page-label">
                            ADMINISTRATOR DASHBOARD
                        </p>

                        <h1>
                            Welcome back, {adminName}
                        </h1>

                        <p className="admin-subtitle">
                            Monitor and manage the Smartcare Queue
                            healthcare system from one place.
                        </p>

                    </div>


                    <button
                        className="admin-profile-button"
                        onClick={() =>
                            navigate("/admin-profile")
                        }
                    >

                        <span className="admin-avatar">
                            AD
                        </span>

                        <span>
                            Administrator
                        </span>

                    </button>

                </header>


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <section className="admin-statistics">

                    {/* TOTAL PATIENTS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">

                            <img
                                src={patientImage}
                                alt="Patients"
                                className="admin-stat-image"
                            />

                        </div>

                        <div>

                            <span>
                                Total Patients
                            </span>

                            <strong>
                                {stats.totalPatients}
                            </strong>

                        </div>

                    </div>


                    {/* TOTAL DOCTORS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">

                            <img
                                src={doctorImage}
                                alt="Doctors"
                                className="admin-stat-image"
                            />

                        </div>

                        <div>

                            <span>
                                Total Doctors
                            </span>

                            <strong>
                                {stats.totalDoctors}
                            </strong>

                        </div>

                    </div>


                    {/* TODAY'S APPOINTMENTS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">

                            <img
                                src={appointmentImage}
                                alt="Appointments"
                                className="admin-stat-image"
                            />

                        </div>

                        <div>

                            <span>
                                Today's Appointments
                            </span>

                            <strong>
                                {stats.todayAppointments}
                            </strong>

                        </div>

                    </div>


                    {/* WAITING PATIENTS */}

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">

                            <img
                                src={queueImage}
                                alt="Queue"
                                className="admin-stat-image"
                            />

                        </div>


                            <div>

                            <span>
                                Waiting Patients
                            </span>

                            <strong>
                                {stats.waitingPatients}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">

                            <img
                                src={usersImage}
                                alt="Serving"
                                className="admin-stat-image"
                            />

                        </div>

                        <div>

                            <span>
                                Currently Serving
                            </span>

                            <strong>
                                {stats.servingPatients}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">

                            <img
                                src={usersImage}
                                alt="Completed"
                                className="admin-stat-image"
                            />

                        </div>

                        <div>

                            <span>
                                Completed Today
                            </span>

                            <strong>
                                {stats.completedPatients}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    MANAGEMENT CARDS
                ================================================== */}

                <section className="admin-management-section">

                    <div className="admin-section-heading">

                        <p>
                            SYSTEM MANAGEMENT
                        </p>

                        <h2>
                            Manage healthcare operations
                        </h2>

                    </div>


                    <div className="admin-management-grid">


                        {/* PATIENTS */}

                        <div
                            className="admin-glass-card admin-management-card"
                            onClick={() =>
                                navigate("/admin-patients")
                            }
                        >

                            <div className="admin-management-icon">

                                <img
                                    src={patientImage}
                                    alt="Patients"
                                    className="admin-management-image"
                                />

                            </div>

                            <h3>
                                Patient Management
                            </h3>

                            <p>
                                View and manage registered patient
                                information and healthcare records.
                            </p>

                            <button className="admin-card-button">
                                Manage Patients →
                            </button>

                        </div>


                        {/* DOCTORS */}

                        <div
                            className="admin-glass-card admin-management-card"
                            onClick={() =>
                                navigate("/admin-doctors")
                            }
                        >

                            <div className="admin-management-icon">

                                <img
                                    src={doctorImage}
                                    alt="Doctors"
                                    className="admin-management-image"
                                />

                            </div>

                            <h3>
                                Doctor Management
                            </h3>

                            <p>
                                Manage doctors and their healthcare
                                service information.
                            </p>

                            <button className="admin-card-button">
                                Manage Doctors →
                            </button>

                        </div>


                        {/* APPOINTMENTS */}

                        <div
                            className="admin-glass-card admin-management-card"
                            onClick={() =>
                                navigate("/admin-appointments")
                            }
                        >

                            <div className="admin-management-icon">

                                <img
                                    src={appointmentImage}
                                    alt="Appointments"
                                    className="admin-management-image"
                                />

                            </div>

                            <h3>
                                Appointment Management
                            </h3>

                            <p>
                                Monitor scheduled appointments and
                                manage appointment activities.
                            </p>

                            <button className="admin-card-button">
                                Manage Appointments →
                            </button>

                        </div>


                        {/* QUEUE */}

                        <div
                            className="admin-glass-card admin-management-card"
                            onClick={() =>
                                navigate("/admin-queue")
                            }
                        >

                            <div className="admin-management-icon">

                                <img
                                    src={queueImage}
                                    alt="Queue"
                                    className="admin-management-image"
                                />

                            </div>

                            <h3>
                                Queue Management
                            </h3>

                            <p>
                                Monitor patient queues and current
                                waiting activity.
                            </p>

                            <button className="admin-card-button">
                                View Queue →
                            </button>

                        </div>


                        {/* USERS */}

                        <div
                            className="admin-glass-card admin-management-card"
                            onClick={() =>
                                navigate("/admin-users")
                            }
                        >

                            <div className="admin-management-icon">

                                <img
                                    src={usersImage}
                                    alt="Users"
                                    className="admin-management-image"
                                />

                            </div>

                            <h3>
                                User Management
                            </h3>

                            <p>
                                Manage system users and their
                                administrative access.
                            </p>

                            <button className="admin-card-button">
                                Manage Users →
                            </button>

                        </div>


                        {/* PROFILE */}

                        <div
                            className="admin-glass-card admin-management-card"
                            onClick={() =>
                                navigate("/admin-profile")
                            }
                        >

                            <div className="admin-management-icon">

                                <img
                                    src={profileImage}
                                    alt="Administrator Profile"
                                    className="admin-management-image"
                                />

                            </div>

                            <h3>
                                Administrator Profile
                            </h3>

                            <p>
                                View and manage your administrator
                                account information.
                            </p>

                            <button className="admin-card-button">
                                View Profile →
                            </button>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    QUICK OVERVIEW
                ================================================== */}

                <section className="admin-overview-section">

                    <div className="admin-section-heading">

                        <p>
                            QUICK OVERVIEW
                        </p>

                        <h2>
                            System activity at a glance
                        </h2>

                    </div>


                    <div className="admin-overview-grid">

                        <div className="admin-overview-card">

                            <span>
                                Active Queue
                            </span>

                            <strong>
                                0
                            </strong>

                        </div>


                        <div className="admin-overview-card">

                            <span>
                                Completed Consultations
                            </span>

                            <strong>
                                0
                            </strong>

                        </div>


                        <div className="admin-overview-card">

                            <span>
                                Cancelled Appointments
                            </span>

                            <strong>
                                0
                            </strong>

                        </div>


                        <div className="admin-overview-card">

                            <span>
                                System Users
                            </span>

                            <strong>
                                0
                            </strong>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;