import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";

import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";
import profileImage from "../../assets/images/profile.png";
import dashboardImage from "../../assets/images/dashboard.png";
import logoutImage from "../../assets/images/logout.png";

import api from "../../services/api";
import "./AdminDoctors.css";

function AdminDoctors() {
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDoctors = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/Doctor/list");

            console.log("Doctors API response:", response.data);

            const data = response.data;

            if (Array.isArray(data)) {
                setDoctors(data);
            } else if (Array.isArray(data?.data)) {
                setDoctors(data.data);
            } else if (Array.isArray(data?.doctors)) {
                setDoctors(data.doctors);
            } else {
                setDoctors([]);
            }
        } catch (err) {
            console.error("Failed to load doctors:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load doctors from the server."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    const getDoctorName = (doctor) => {
        if (doctor.firstName || doctor.lastName) {
            return `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();
        }

        return (
            doctor.name ||
            doctor.fullName ||
            doctor.doctorName ||
            "Unknown Doctor"
        );
    };

    const getDepartment = (doctor) => {
        if (typeof doctor.department === "object") {
            return doctor.department?.name || "Not specified";
        }

        return (
            doctor.department ||
            doctor.departmentName ||
            "Not specified"
        );
    };

    const getSpecialization = (doctor) => {
        return (
            doctor.specialization ||
            doctor.speciality ||
            "Not specified"
        );
    };

    const getStatus = (doctor) => {
        return doctor.status || "Active";
    };

    return (
        <div className="admin-dashboard">

            {/* SIDEBAR */}

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
                        className="admin-nav-item active"
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
                        className="admin-nav-item"
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

            {/* MAIN CONTENT */}

            <main className="admin-main">

                <header className="admin-topbar">

                    <div>

                        <p className="admin-page-label">
                            DOCTOR MANAGEMENT
                        </p>

                        <h1>
                            Registered Doctors
                        </h1>

                        <p className="admin-subtitle">
                            View doctors registered in the
                            Smartcare Queue system.
                        </p>

                    </div>

                    <button
                        className="admin-secondary-button"
                        onClick={loadDoctors}
                    >
                        ↻ Refresh
                    </button>

                </header>

                <section className="admin-content-card">

                    <div className="admin-section-heading">

                        <div>
                            <p>DOCTORS</p>

                            <h2>
                                Doctor Directory
                            </h2>
                        </div>

                        <strong>
                            {doctors.length} Doctors
                        </strong>

                    </div>

                    {loading && (
                        <div className="admin-loading">
                            Loading doctors...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="admin-error">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        doctors.length === 0 && (
                            <div className="admin-empty-state">
                                <div>🩺</div>

                                <h3>
                                    No doctors found
                                </h3>

                                <p>
                                    The backend did not return
                                    any registered doctors.
                                </p>
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        doctors.length > 0 && (

                            <div className="admin-table-wrapper">

                                <table className="admin-table">

                                    <thead>

                                        <tr>
                                            <th>#</th>
                                            <th>Doctor</th>
                                            <th>Specialization</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {doctors.map(
                                            (doctor, index) => (

                                                <tr
                                                    key={
                                                        doctor.id ||
                                                        doctor.userId ||
                                                        index
                                                    }
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            Dr.{" "}
                                                            {getDoctorName(
                                                                doctor
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            getSpecialization(
                                                                doctor
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            getDepartment(
                                                                doctor
                                                            )
                                                        }
                                                    </td>

                                                    <td>

                                                        <span className="admin-status active">
                                                            {
                                                                getStatus(
                                                                    doctor
                                                                )
                                                            }
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

            </main>

        </div>
    );
}

export default AdminDoctors;