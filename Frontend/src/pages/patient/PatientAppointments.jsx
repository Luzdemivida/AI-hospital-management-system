import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import logo from "../../assets/images/logo.jpg";

import emoji1 from "../../assets/images/emoji-1.jpg";
import emoji2 from "../../assets/images/emoji-2.jpg";
import emoji3 from "../../assets/images/emoji-3.jpg";
import emoji4 from "../../assets/images/emoji-4.jpg";
import emoji5 from "../../assets/images/emoji-5.jpg" 
import dashboardImage from "../../assets/images/dashboard.png";
import profileImage from "../../assets/images/profile.png";
import logoutImage from "../../assets/images/logout.png";
import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";


function PatientAppointments() {

    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [_loading, setLoading] = useState(true);
    const [_error, setError] = useState("");
    const [doctors, setDoctors] = useState([]);

    const [newAppointment, setNewAppointment] = useState({
        doctorId: "",
        appointmentDate: "",
        reason: "",
    });
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setLoading(true);
                // load appointments
                const response = await api.get("/Appointment/my");

                const data = response.data;

                if (mounted) {
                    if (Array.isArray(data)) setAppointments(data);
                    else if (Array.isArray(data?.data)) setAppointments(data.data);
                    else setAppointments(data?.appointments || []);
                }
            } catch (err) {
                console.error(err);

                if (mounted) {
                    setError(err.response?.data?.message || "Unable to load appointments.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        const loadDoctors = async () => {
            try {
                const resp = await api.get("/Doctor/list");
                const data = resp.data || [];
                if (mounted) setDoctors(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
            } catch (err) {
                console.error("Failed to load doctors:", err);
            }
        };

        loadDoctors();

        load();

        return () => (mounted = false);
    }, []);

    const cancelAppointment = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/Appointment/${id}`);

            alert("Appointment cancelled successfully.");

            setAppointments((prev) => prev.filter((a) =>
                (a.appointmentId || a.AppointmentId || a.id) !== id
            ));
        } catch (err) {
            console.error(err);

            alert(err.response?.data?.message || "Unable to cancel appointment.");
        }
    };

    const handleNewChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment((p) => ({ ...p, [name]: value }));

        if (name === "doctorId") {
            setSelectedDoctor(value ? doctors.find((d) => String(d.doctorId) === String(value)) || null : null);
        }
    };

    const createAppointment = async (e) => {
        e.preventDefault();

        if (!newAppointment.doctorId || !newAppointment.appointmentDate || !newAppointment.reason) {
            alert("Please complete the appointment form.");
            return;
        }

        try {
            setCreating(true);

            const selectedDate = new Date(newAppointment.appointmentDate);
            if (Number.isNaN(selectedDate.getTime())) {
                alert("Please choose a valid appointment date and time.");
                return;
            }

            const payload = {
                doctorId: Number.parseInt(newAppointment.doctorId, 10),
                appointmentDate: selectedDate.toISOString(),
                reason: newAppointment.reason.trim(),
            };

            const resp = await api.post("/Appointment", payload);
            const created = resp.data;

            alert("Appointment booked successfully.");

            // add to list
            setAppointments((prev) => [created, ...prev]);

            // offer to join queue
            const join = window.confirm("Would you like to join the queue now?");
            if (join) {
                try {
                    // AppointmentResponseDto returns AppointmentId (not id)
                    const apptId = created.appointmentId || created.AppointmentId || created.id;
                    await api.post(`/Queue/${apptId}`);
                    alert("You have been added to the queue.");
                } catch (err) {
                    console.error("Failed to generate queue entry:", err);
                    alert(err.response?.data?.message || "Unable to join queue.");
                }
            }

            setNewAppointment({ doctorId: "", appointmentDate: "", reason: "" });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Unable to create appointment.");
        } finally {
            setCreating(false);
        }
    };

    return (

        <div className="patient-dashboard">

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
                        className="patient-nav-item active"
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
                        className="patient-nav-item"
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
                            APPOINTMENTS
                        </p>

                        <h1>
                            My Appointments
                        </h1>

                        <p className="patient-subtitle">
                            View your scheduled consultations and
                            manage your appointments.
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
                    APPOINTMENT LIST
                ========================= */}
                {/* New appointment form */}
                <section className="patient-page-section">
                    <form className="patient-glass-card patient-profile-card" onSubmit={createAppointment}>
                        <div className="profile-section-heading">
                            <span>BOOK APPOINTMENT</span>
                            <h2>New Appointment</h2>
                        </div>

                        <div className="profile-form-grid">
                            <div className="profile-form-group">
                                <label>Doctor</label>
                                <select name="doctorId" value={newAppointment.doctorId} onChange={handleNewChange} required>
                                    <option value="">Select doctor</option>
                                    {doctors.map((d) => (
                                        <option key={d.doctorId} value={d.doctorId}>
                                            {d.fullName}
                                        </option>
                                    ))}
                                </select>

                                {selectedDoctor && (
                                    <div style={{
                                        marginTop: 12,
                                        padding: 12,
                                        borderRadius: 10,
                                        background: "rgba(15, 23, 42, 0.03)",
                                        border: "1px solid rgba(15, 23, 42, 0.08)",
                                        color: "#1f2937"
                                    }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0b8792", marginBottom: 6 }}>
                                            Doctor profile
                                        </div>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{selectedDoctor.fullName}</div>
                                        <div style={{ marginBottom: 4 }}><strong>Department:</strong> {selectedDoctor.department || "Not specified"}</div>
                                        <div style={{ marginBottom: 4 }}><strong>Specialty:</strong> {selectedDoctor.specialization || "Not specified"}</div>
                                        <div><strong>Biography:</strong> {selectedDoctor.biography || "No biography added yet."}</div>
                                    </div>
                                )}
                            </div>

                            <div className="profile-form-group">
                                <label>Date</label>
                                <input type="date" name="appointmentDate" value={newAppointment.appointmentDate} onChange={handleNewChange} required />
                            </div>

                            <div className="profile-form-group">
                                <label>Reason</label>
                                <input type="text" name="reason" value={newAppointment.reason} onChange={handleNewChange} required placeholder="Short reason" />
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button type="submit" className="primary-button" disabled={creating}>{creating ? 'Booking...' : 'Book Appointment'}</button>
                        </div>
                    </form>
                </section>

                <section className="patient-page-section">

                    {appointments.length === 0 ? (

                        <div className="patient-empty-state">

                            <div className="patient-empty-icon">
                                <img
                                    src={queueImage}
                                    alt="Appointments"
                                    className="patient-content-icon"
                                />
                            </div>

                            <h2>
                                No appointments yet
                            </h2>

                            <p>
                                Your scheduled appointments will
                                appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="patient-appointments-list">

                            {appointments.map(
                                (appointment) => {
                                    // AppointmentResponseDto: appointmentId, doctorName, department, appointmentDate (DateTime), status
                                    const apptId = appointment.appointmentId || appointment.AppointmentId || appointment.id;
                                    const dateObj = appointment.appointmentDate
                                        ? new Date(appointment.appointmentDate)
                                        : null;
                                    const dateStr = dateObj
                                        ? dateObj.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
                                        : "—";
                                    const timeStr = dateObj
                                        ? dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
                                        : "—";

                                    return (
                                    <article
                                        className="patient-glass-card appointment-card"
                                        key={apptId}
                                    >

                                        <div className="appointment-card-header">

                                            <div>

                                                <span className="appointment-label">
                                                    DOCTOR
                                                </span>

                                                <h2>
                                                    {appointment.doctorName || appointment.DoctorName || "—"}
                                                </h2>

                                                <p>
                                                    {appointment.department || appointment.Department || "—"}
                                                </p>

                                            </div>


                                            <span className="appointment-status">
                                                {appointment.status || appointment.Status}
                                            </span>

                                        </div>


                                        <div className="appointment-information">

                                            <div>

                                                <span>
                                                    DATE
                                                </span>

                                                <strong>
                                                    {dateStr}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    TIME
                                                </span>

                                                <strong>
                                                    {timeStr}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    REASON
                                                </span>

                                                <strong>
                                                    {appointment.reason || appointment.Reason || "—"}
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="appointment-card-actions">

                                            <button
                                                className="danger-button"
                                                onClick={() =>
                                                    cancelAppointment(apptId)
                                                }
                                            >
                                                Cancel Appointment
                                            </button>

                                        </div>

                                    </article>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default PatientAppointments;