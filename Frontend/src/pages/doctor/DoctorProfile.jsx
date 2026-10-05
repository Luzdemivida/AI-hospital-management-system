import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import logo from "../../assets/images/logo.jpg";
import appointmentImage from "../../assets/images/emoji-1.jpg";
import queueImage from "../../assets/images/emoji-2.jpg";
import profileImage from "../../assets/images/emoji-3.jpg";
import medicalImage from "../../assets/images/emoji-4.jpg";
import waitingImage from "../../assets/images/emoji-5.jpg";

import "./DoctorProfile.css";

function DoctorProfile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        specialization: "",
        experienceYears: "",
        averageConsultationTime: "",
        licenseNumber: "",
        consultationFee: "",
        biography: "",
        createdAt: ""
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);

    const hasProfileDetails = [
        profile.specialization,
        profile.experienceYears,
        profile.averageConsultationTime,
        profile.licenseNumber,
        profile.consultationFee,
        profile.biography,
    ].some((value) => value !== "" && value !== null && value !== undefined);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const resp = await api.get("/Doctor/profile");
                const d = resp.data || {};
                if (mounted) {
                    setProfile({
                        firstName:               d.firstName               || "",
                        lastName:                d.lastName                || "",
                        email:                   d.email                   || "",
                        phone:                   d.phone                   || "",
                        department:              d.department              || "",
                        specialization:          d.specialization          || "",
                        experienceYears:         d.experienceYears         ?? "",
                        averageConsultationTime: d.averageConsultationTime ?? "",
                        licenseNumber:           d.licenseNumber           || "",
                        consultationFee:         d.consultationFee         ?? "",
                        biography:               d.biography               || "",
                        createdAt:               d.createdAt
                            ? new Date(d.createdAt).toLocaleDateString()
                            : "",
                    });
                }
            } catch (err) {
                console.error("Failed to load doctor profile:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!loading && !hasProfileDetails) {
            setIsEditing(true);
        }
    }, [loading, hasProfileDetails]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        try {
            setSaving(true);
            await api.put("/Doctor/profile", {
                specialization:          profile.specialization          || null,
                experienceYears:         profile.experienceYears !== "" ? parseInt(profile.experienceYears) : null,
                averageConsultationTime: profile.averageConsultationTime !== "" ? parseInt(profile.averageConsultationTime) : null,
                licenseNumber:           profile.licenseNumber           || null,
                consultationFee:         profile.consultationFee !== "" ? parseFloat(profile.consultationFee) : null,
                biography:               profile.biography               || null,
            });
            alert("Doctor profile updated successfully.");
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update doctor profile:", err);
            alert(err.response?.data?.message || "Failed to update profile.");
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
                        <span className="doctor-nav-image">
                            <img
                                src={medicalImage}
                                alt="Dashboard"
                            />
                        </span>

                        Dashboard
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-queue")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={queueImage}
                                alt="Patient Queue"
                            />
                        </span>

                        Patient Queue
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-appointments")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={appointmentImage}
                                alt="Appointments"
                            />
                        </span>

                        Appointments
                    </button>


                    <button
                        className="doctor-nav-item"
                        onClick={() =>
                            navigate("/doctor-schedule")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={waitingImage}
                                alt="My Schedule"
                            />
                        </span>

                        My Schedule
                    </button>


                    <button
                        className="doctor-nav-item active"
                        onClick={() =>
                            navigate("/doctor-profile")
                        }
                    >
                        <span className="doctor-nav-image">
                            <img
                                src={profileImage}
                                alt="My Profile"
                            />
                        </span>

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
                        <span className="doctor-nav-image">
                            <img
                                src={medicalImage}
                                alt="Logout"
                            />
                        </span>

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
                            DOCTOR PROFILE
                        </p>

                        <h1>
                            My Profile
                        </h1>

                        <p className="doctor-subtitle">
                            View and manage your professional
                            information.
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
                    PROFILE FORM
                ========================= */}

                <section className="doctor-profile-section">

                    <form
                        className="doctor-profile-card"
                        onSubmit={handleUpdate}
                    >

                        <div className="doctor-profile-header">
                            <div className="doctor-profile-avatar">
                                <img src={profileImage} alt="Doctor Profile" />
                            </div>
                            <div>
                                <h2>{profile.firstName} {profile.lastName}</h2>
                                <p>{profile.department || "No department set"}</p>
                                <small style={{ color: "#6b7280" }}>{profile.email}</small>
                            </div>
                        </div>

                        {loading && <p style={{ padding: 20, color: "#6b7280" }}>Loading profile…</p>}

                        {!loading && (
                            <>
                                <div className="doctor-form-group">
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        value={profile.department}
                                        disabled
                                        readOnly
                                    />
                                    <small>Department is assigned by administrators.</small>
                                </div>

                                <div className="doctor-form-group">
                                    <label htmlFor="specialization">Specialization</label>
                                    <input
                                        id="specialization"
                                        name="specialization"
                                        type="text"
                                        value={profile.specialization}
                                        onChange={handleChange}
                                        placeholder="e.g. General Medicine"
                                        disabled={!isEditing && hasProfileDetails}
                                    />
                                </div>

                                <div className="doctor-form-row">
                                    <div className="doctor-form-group">
                                        <label htmlFor="experienceYears">Experience (Years)</label>
                                        <input
                                            id="experienceYears"
                                            name="experienceYears"
                                            type="number"
                                            min="0"
                                            value={profile.experienceYears}
                                            onChange={handleChange}
                                            placeholder="e.g. 5"
                                            disabled={!isEditing && hasProfileDetails}
                                        />
                                    </div>

                                    <div className="doctor-form-group">
                                        <label htmlFor="averageConsultationTime">Avg. Consultation Time (min)</label>
                                        <input
                                            id="averageConsultationTime"
                                            name="averageConsultationTime"
                                            type="number"
                                            min="1"
                                            value={profile.averageConsultationTime}
                                            onChange={handleChange}
                                            placeholder="e.g. 20"
                                            disabled={!isEditing && hasProfileDetails}
                                        />
                                    </div>
                                </div>

                                <div className="doctor-form-group">
                                    <label htmlFor="licenseNumber">License Number</label>
                                    <input
                                        id="licenseNumber"
                                        name="licenseNumber"
                                        type="text"
                                        value={profile.licenseNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. MED-CM-12345"
                                        disabled={!isEditing && hasProfileDetails}
                                    />
                                </div>

                                <div className="doctor-form-group">
                                    <label htmlFor="consultationFee">Consultation Fee (FCFA)</label>
                                    <div className="doctor-fee-input">
                                        <span>FCFA</span>
                                        <input
                                            id="consultationFee"
                                            name="consultationFee"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={profile.consultationFee}
                                            onChange={handleChange}
                                            placeholder="e.g. 5000.00"
                                            disabled={!isEditing && hasProfileDetails}
                                        />
                                    </div>
                                </div>

                                <div className="doctor-form-group">
                                    <label htmlFor="biography">Biography</label>
                                    <textarea
                                        id="biography"
                                        name="biography"
                                        rows="6"
                                        value={profile.biography}
                                        onChange={handleChange}
                                        placeholder="Enter your professional biography..."
                                        disabled={!isEditing && hasProfileDetails}
                                    />
                                </div>

                                <div className="doctor-form-group">
                                    <label>Profile Created</label>
                                    <input type="text" value={profile.createdAt} disabled readOnly />
                                    <small>This is generated by the system and cannot be edited.</small>
                                </div>

                                <div className="doctor-profile-actions">
                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            className="doctor-primary-button"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="submit"
                                                className="doctor-primary-button"
                                                disabled={saving}
                                            >
                                                {saving ? "Saving…" : "Save Changes"}
                                            </button>
                                            <button
                                                type="button"
                                                className="doctor-cancel-button"
                                                onClick={() => setIsEditing(false)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                    </form>

                </section>

            </main>

        </div>
    );
}

export default DoctorProfile;