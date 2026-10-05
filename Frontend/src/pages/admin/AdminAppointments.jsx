import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import api from "../../services/api";
import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";
import profileImage from "../../assets/images/profile.png";
import dashboardImage from "../../assets/images/dashboard.png";
import logoutImage from "../../assets/images/logout.png";
import "./AdminQueue.css";

function AdminAppointments() {
    const navigate = useNavigate();

    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadToday = async () => {
        try {
            setLoading(true);
            const resp = await api.get("/Queue/today");
            const data = resp.data || [];
            setQueue(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Unable to load today's appointments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadToday(); }, []);

    const cancelAppointment = async (appointmentId) => {
        if (!appointmentId) return;
        const confirmed = window.confirm("Cancel this appointment?");
        if (!confirmed) return;

        try {
            await api.delete(`/Appointment/${appointmentId}`);
            alert("Appointment cancelled.");
            await loadToday();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Unable to cancel appointment.");
        }
    };

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <img src={logo} alt="Smartcare Queue" className="admin-logo" />
                    <div className="admin-brand-text"><h2>Smartcare Queue</h2><p>Smarter healthcare for Better care.</p></div>
                </div>
                <nav className="admin-navigation">
                    <button className="admin-nav-item" onClick={() => navigate('/admin-dashboard')}><img src={dashboardImage} alt="Dashboard" className="admin-nav-image"/>Dashboard</button>
                    <button className="admin-nav-item" onClick={() => navigate('/admin-patients')}>Patients</button>
                    <button className="admin-nav-item" onClick={() => navigate('/admin-doctors')}>Doctors</button>
                    <button className="admin-nav-item active" onClick={() => navigate('/admin-appointments')}><img src={appointmentImage} alt="Appointments" className="admin-nav-image"/>Appointments</button>
                    <button className="admin-nav-item" onClick={() => navigate('/admin-queue')}><img src={queueImage} alt="Queue" className="admin-nav-image"/>Queue</button>
                    <button className="admin-nav-item" onClick={() => navigate('/admin-users')}>Users</button>
                    <button className="admin-nav-item" onClick={() => navigate('/admin-profile')}><img src={profileImage} alt="My Profile" className="admin-nav-image"/>My Profile</button>
                </nav>
                <div className="admin-sidebar-bottom"><button className="admin-logout-button" onClick={() => navigate('/login')}><img src={logoutImage} alt="Logout" className="admin-nav-image"/>Logout</button></div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <p className="admin-page-label">APPOINTMENTS</p>
                        <h1>Today's Appointments</h1>
                        <p className="admin-subtitle">View and manage today's appointments.</p>
                    </div>
                    <button className="admin-secondary-button" onClick={loadToday}>↻ Refresh</button>
                </header>

                <section className="admin-content-card">
                    {loading && <div className="admin-loading">Loading...</div>}
                    {!loading && error && <div className="admin-error">{error}</div>}
                    {!loading && !error && queue.length === 0 && (<div className="admin-empty-state"><h3>No appointments</h3><p>No appointments found for today.</p></div>)}
                    {!loading && !error && queue.length > 0 && (
                        <div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>#</th><th>Queue</th><th>Patient</th><th>Doctor</th><th>Appointment</th><th>Actions</th></tr></thead><tbody>
                        {queue.map((q, idx) => (
                            <tr key={q.queueId || q.id || idx}>
                                <td>{idx+1}</td>
                                <td><strong>{q.queueNumber || q.queue_number}</strong></td>
                                <td>{q.patientName || (q.patient?.firstName ? `${q.patient.firstName} ${q.patient.lastName}` : 'Unknown')}</td>
                                <td>{q.doctorName || (q.doctor?.firstName ? `${q.doctor.firstName} ${q.doctor.lastName}` : '—')}</td>
                                <td>{q.appointmentDate || q.appointment?.date || '—'}</td>
                                <td><div style={{display:'flex',gap:8}}>
                                    <button onClick={() => cancelAppointment(q.appointmentId || q.appointment?.id)}>Cancel Appointment</button>
                                </div></td>
                            </tr>
                        ))}
                        </tbody></table></div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminAppointments;
