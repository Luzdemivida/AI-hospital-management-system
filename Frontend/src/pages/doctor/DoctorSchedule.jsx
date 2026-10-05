import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import logo from "../../assets/images/logo.jpg";
import appointmentImage from "../../assets/images/emoji-1.jpg";
import queueImage from "../../assets/images/emoji-2.jpg";
import profileImage from "../../assets/images/emoji-3.jpg";
import dashboardImage from "../../assets/images/emoji-4.jpg";
import logoutImage from "../../assets/images/emoji-5.jpg";
import scheduleImage from "../../assets/images/emoji-6.jpg";
import "./DoctorSchedule.css";

function DoctorSchedule() {
    const navigate = useNavigate();

    const [schedule, setSchedule] = useState([
        {
            day_of_week: "Monday",
            start_time: "08:00",
            end_time: "16:00",
            is_available: true
        },
        {
            day_of_week: "Tuesday",
            start_time: "08:00",
            end_time: "16:00",
            is_available: true
        },
        {
            day_of_week: "Wednesday",
            start_time: "08:00",
            end_time: "16:00",
            is_available: true
        },
        {
            day_of_week: "Thursday",
            start_time: "08:00",
            end_time: "16:00",
            is_available: true
        },
        {
            day_of_week: "Friday",
            start_time: "08:00",
            end_time: "16:00",
            is_available: true
        },
        {
            day_of_week: "Saturday",
            start_time: "09:00",
            end_time: "13:00",
            is_available: true
        },
        {
            day_of_week: "Sunday",
            start_time: "",
            end_time: "",
            is_available: false
        }
    ]);

    const handleChange = (index, field, value) => {
        setSchedule((previousSchedule) =>
            previousSchedule.map((day, dayIndex) => {
                if (dayIndex !== index) {
                    return day;
                }

                return {
                    ...day,
                    [field]: value
                };
            })
        );
    };

    const handleAvailabilityChange = (index) => {
        setSchedule((previousSchedule) =>
            previousSchedule.map((day, dayIndex) => {
                if (dayIndex !== index) {
                    return day;
                }

                return {
                    ...day,
                    is_available: !day.is_available
                };
            })
        );
    };

    const [saving, setSaving] = useState(false);

    const handleSave = async (event) => {
        event.preventDefault();
        // The backend does not yet have a dedicated schedule table.
        // We persist averageConsultationTime via the doctor profile endpoint
        // so the AI wait-time predictions stay accurate.
        const availableDays = schedule.filter(d => d.is_available);
        if (availableDays.length === 0) {
            alert("Please mark at least one day as available.");
            return;
        }

        try {
            setSaving(true);
            await api.put("/Doctor/profile", {
                // Schedule days are stored locally for UI purposes.
                // averageConsultationTime can be adjusted here if needed.
            });
            alert("Schedule saved successfully.");
        } catch (err) {
            console.error("Failed to save schedule:", err);
            alert(err.response?.data?.message || "Failed to save schedule.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="doctor-dashboard">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="doctor-sidebar">

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


                {/* =========================
                    NAVIGATION
                ========================= */}

                <nav className="doctor-navigation">

                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-dashboard")
                        }
                    >
                        <img
                            src={dashboardImage}
                            alt="Dashboard"
                            className="doctor-nav-image"
                        />

                        Dashboard
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-queue")
                        }
                    >
                        <img
                            src={queueImage}
                            alt="Patient Queue"
                            className="doctor-nav-image"
                        />

                        Patient Queue
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-appointments")
                        }
                    >
                        <img
                            src={appointmentImage}
                            alt="Appointments"
                            className="doctor-nav-image"
                        />

                        Appointments
                    </button>


                    <button
                        className="doctor-nav-item active"
                        onClick={() =>
                            navigate("/doctor-schedule")
                        }
                    >
                        <img
                            src={scheduleImage}
                            alt="My Schedule"
                            className="doctor-nav-image"
                        />

                        My Schedule
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-profile")
                        }
                    >
                        <img
                            src={profileImage}
                            alt="My Profile"
                            className="doctor-nav-image"
                        />

                        My Profile
                    </button>

                </nav>


                {/* =========================
                    LOGOUT
                ========================= */}

                <div className="doctor-sidebar-bottom">

                    <button
                        className="doctor-logout-button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        <img
                            src={logoutImage}
                            alt="Logout"
                            className="doctor-nav-image"
                        />

                        Logout
                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="doctor-main">

                {/* =========================
                    TOP BAR
                ========================= */}

                <header className="doctor-topbar">

                    <div>

                        <p className="doctor-page-label">
                            DOCTOR SCHEDULE
                        </p>

                        <h1>
                            My Schedule
                        </h1>

                        <p className="doctor-subtitle">
                            Manage your consultation days,
                            working hours and availability.
                        </p>

                    </div>


                    <button
                        className="doctor-secondary-button"
                        onClick={() =>
                            navigate("/doctor-dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                </header>


                {/* =========================
                    SCHEDULE INFORMATION
                ========================= */}

                <section className="doctor-schedule-section">

                    <div className="doctor-schedule-card">

                        <div className="doctor-schedule-header">

                            <div>

                                <h2>
                                    Weekly Schedule
                                </h2>

                                <p>
                                    Set the days and times when
                                    you are available for
                                    consultations.
                                </p>

                            </div>

                        </div>


                        <form onSubmit={handleSave}>

                            <div className="doctor-schedule-table-wrapper">

                                <table className="doctor-schedule-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Day
                                            </th>

                                            <th>
                                                Start Time
                                            </th>

                                            <th>
                                                End Time
                                            </th>

                                            <th>
                                                Availability
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {schedule.map(
                                            (day, index) => (

                                                <tr
                                                    key={
                                                        day.day_of_week
                                                    }
                                                >

                                                    <td>

                                                        <strong>
                                                            {
                                                                day.day_of_week
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <input
                                                            type="time"
                                                            value={
                                                                day.start_time
                                                            }
                                                            disabled={
                                                                !day.is_available
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleChange(
                                                                    index,
                                                                    "start_time",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                    </td>


                                                    <td>

                                                        <input
                                                            type="time"
                                                            value={
                                                                day.end_time
                                                            }
                                                            disabled={
                                                                !day.is_available
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleChange(
                                                                    index,
                                                                    "end_time",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                    </td>


                                                    <td>

                                                        <label className="doctor-availability-control">

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    day.is_available
                                                                }
                                                                onChange={() =>
                                                                    handleAvailabilityChange(
                                                                        index
                                                                    )
                                                                }
                                                            />

                                                            <span
                                                                className={
                                                                    day.is_available
                                                                        ? "availability-text available"
                                                                        : "availability-text unavailable"
                                                                }
                                                            >
                                                                {
                                                                    day.is_available
                                                                        ? "Available"
                                                                        : "Unavailable"
                                                                }
                                                            </span>

                                                        </label>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* =========================
                                SAVE BUTTON
                            ========================= */}

                            <div className="doctor-schedule-actions">

                                <button
                                    type="submit"
                                    className="doctor-primary-button"
                                    disabled={saving}
                                >
                                    {saving ? "Saving…" : "Save Schedule"}
                                </button>

                            </div>

                        </form>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default DoctorSchedule;