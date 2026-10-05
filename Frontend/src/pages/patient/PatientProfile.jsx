import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import dashboardImage from "../../assets/images/dashboard.png";
import profileImage from "../../assets/images/profile.png";
import logoutImage from "../../assets/images/logout.png";
import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";
import api from "../../services/api";

function PatientProfile() {

    const navigate = useNavigate();


    const [editing, setEditing] = useState(true);

    // null = not yet loaded, false = profile exists, true = no profile yet (need to create)
    const [needsCreate, setNeedsCreate] = useState(null);

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        name: "",
        email: "",
        phone: "",
        age: "",
        dateOfBirth: "",
        gender: "",
        occupation: "",
        address: "",
        bloodGroup: "",
        allergies: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
    });

    const [createForm, setCreateForm] = useState({
        age: "",
        dateOfBirth: "",
        gender: "",
        occupation: "",
        address: "",
        bloodGroup: "",
        allergies: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
    });

    const [_loading, setLoading] = useState(true);
    const [_error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get("/Patients/me");
                const data = response.data || {};
                if (mounted) {
                    // PatientResponseDto now returns: firstName, lastName, fullName,
                    // email, phone, dateOfBirth, gender, address, bloodGroup,
                    // allergies, emergencyContactName, emergencyContactPhone
                    setProfile({
                        firstName:            data.firstName            || "",
                        lastName:             data.lastName             || "",
                        name:                 data.fullName             || "",
                        email:                data.email                || "",
                        phone:                data.phone                || "",
                        age:                  data.age !== null && data.age !== undefined ? String(data.age) : "",
                        dateOfBirth:          data.dateOfBirth
                            ? String(data.dateOfBirth).slice(0, 10)
                            : "",
                        gender:               data.gender               || "",
                        occupation:           data.occupation           || "",
                        address:              data.address              || "",
                        bloodGroup:           data.bloodGroup           || "",
                        allergies:            data.allergies            || "",
                        emergencyContactName: data.emergencyContactName  || "",
                        emergencyContactPhone:data.emergencyContactPhone || "",
                    });
                    setNeedsCreate(false);
                }
            } catch (err) {
                // 404 means the patient profile doesn't exist yet — switch to create mode
                if (err.response?.status === 404) {
                    if (mounted) setNeedsCreate(true);
                } else {
                    console.error("Failed to load profile:", err);
                    if (mounted) setError(err.response?.data?.message || "Unable to load profile.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadProfile();

        return () => (mounted = false);
    }, []);

    const handleCreateChange = (event) => {
        const { name, value } = event.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            await api.post("/Patients", createForm);
            // Reload the newly-created profile
            const resp = await api.get("/Patients/me");
            const data = resp.data || {};
            setProfile({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                name: data.fullName || "",
                email: data.email || "",
                phone: data.phone || "",
                age: data.age !== null && data.age !== undefined ? String(data.age) : "",
                dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).slice(0, 10) : "",
                gender: data.gender || "",
                occupation: data.occupation || "",
                address: data.address || "",
                bloodGroup: data.bloodGroup || "",
                allergies: data.allergies || "",
                emergencyContactName: data.emergencyContactName || "",
                emergencyContactPhone: data.emergencyContactPhone || "",
            });
            setNeedsCreate(false);
            alert("Patient profile created successfully.");
        } catch (err) {
            console.error("Failed to create profile:", err);
            alert(err.response?.data?.message || "Failed to create profile.");
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (event) => {

        const { name, value } = event.target;

        setProfile((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            // Only send fields that the API accepts in UpdatePatientDto
            const payload = {
                age: profile.age === "" ? null : Number(profile.age),
                occupation: profile.occupation || "",
                address: profile.address || "",
                emergencyContactName: profile.emergencyContactName || "",
                emergencyContactPhone: profile.emergencyContactPhone || "",
                bloodGroup: profile.bloodGroup || "",
                allergies: profile.allergies || "",
            };

            await api.put("/Patients/me", payload);
            // reload profile from server to get canonical values
            const resp = await api.get("/Patients/me");
            const data = resp.data || {};
            setProfile({
                firstName:            data.firstName            || "",
                lastName:             data.lastName             || "",
                name:                 data.fullName             || "",
                email:                data.email                || "",
                phone:                data.phone                || "",
                age:                  data.age !== null && data.age !== undefined ? String(data.age) : "",
                dateOfBirth:          data.dateOfBirth
                    ? String(data.dateOfBirth).slice(0, 10)
                    : "",
                gender:               data.gender               || "",
                occupation:           data.occupation           || "",
                address:              data.address              || "",
                bloodGroup:           data.bloodGroup           || "",
                allergies:            data.allergies            || "",
                emergencyContactName: data.emergencyContactName  || "",
                emergencyContactPhone:data.emergencyContactPhone || "",
            });
            alert("Your profile has been updated successfully.");
            setEditing(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
            alert(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete your patient profile?");
        if (!confirmed) return;

        try {
            setLoading(true);
            await api.delete("/Patients/me");
            alert("Your profile has been deleted.");
            navigate("/register");
        } catch (err) {
            console.error("Failed to delete profile:", err);
            alert(err.response?.data?.message || "Failed to delete profile.");
        } finally {
            setLoading(false);
        }
    };

    // ── Create-profile screen (shown when no profile exists yet) ──────────────
    if (needsCreate === true) {
        return (
            <div className="patient-dashboard">
                <aside className="patient-sidebar">
                    <div className="patient-brand">
                        <img src={logo} alt="Smartcare Queue" className="patient-logo" />
                        <div className="patient-brand-text">
                            <h2>Smartcare Queue</h2>
                            <p>Smarter healthcare for Better care.</p>
                        </div>
                    </div>
                    <nav className="patient-navigation">
                        <button className="patient-nav-item" onClick={() => navigate("/patientDashboard")}>
                            <img src={dashboardImage} alt="" className="patient-nav-icon" />Dashboard
                        </button>
                        <button className="patient-nav-item" onClick={() => navigate("/patientAppointments")}>
                            <img src={appointmentImage} alt="" className="patient-nav-icon" />Appointments
                        </button>
                        <button className="patient-nav-item" onClick={() => navigate("/patientQueue")}>
                            <img src={queueImage} alt="" className="patient-nav-icon" />Queue Status
                        </button>
                        <button className="patient-nav-item active" onClick={() => navigate("/patientProfile")}>
                            <img src={profileImage} alt="" className="patient-nav-icon" />My Profile
                        </button>
                    </nav>
                    <div className="patient-sidebar-bottom">
                        <button className="patient-logout-button" onClick={() => navigate("/login")}>
                            <img src={logoutImage} alt="" className="patient-nav-icon" />Logout
                        </button>
                    </div>
                </aside>

                <main className="patient-main">
                    <header className="patient-topbar">
                        <div>
                            <p className="patient-page-label">MY PROFILE</p>
                            <h1>Create Your Patient Profile</h1>
                            <p className="patient-subtitle">
                                You don't have a patient profile yet. Fill in your healthcare
                                information to get started.
                            </p>
                        </div>
                    </header>

                    <section className="patient-profile-section">
                        <form
                            className="patient-glass-card patient-profile-card"
                            onSubmit={handleCreate}
                        >
                            <div className="profile-section-heading">
                                <span>HEALTHCARE INFORMATION</span>
                                <h2>New Patient Profile</h2>
                            </div>

                            <div className="profile-form-grid">
                                <div className="profile-form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={createForm.age}
                                        onChange={handleCreateChange}
                                        min="0"
                                        max="120"
                                        required
                                        placeholder="Enter age"
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={createForm.dateOfBirth}
                                        onChange={handleCreateChange}
                                        required
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={createForm.gender}
                                        onChange={handleCreateChange}
                                        required
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div className="profile-form-group">
                                    <label>Occupation</label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        value={createForm.occupation}
                                        onChange={handleCreateChange}
                                        placeholder="Enter occupation"
                                        required
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label>Blood Group</label>
                                    <select
                                        name="bloodGroup"
                                        value={createForm.bloodGroup}
                                        onChange={handleCreateChange}
                                    >
                                        <option value="">Select blood group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>

                            <div className="profile-form-group full-width">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={createForm.address}
                                    onChange={handleCreateChange}
                                    placeholder="Enter your residential address"
                                    rows="3"
                                />
                            </div>

                            <div className="profile-form-group full-width">
                                <label>Allergies</label>
                                <textarea
                                    name="allergies"
                                    value={createForm.allergies}
                                    onChange={handleCreateChange}
                                    placeholder="Enter any known allergies or type 'None'"
                                    rows="2"
                                />
                            </div>

                            <div className="profile-section-heading profile-spacing">
                                <span>EMERGENCY CONTACT</span>
                                <h2>Emergency Contact Information</h2>
                            </div>

                            <div className="profile-form-grid">
                                <div className="profile-form-group">
                                    <label>Emergency Contact Name</label>
                                    <input
                                        type="text"
                                        name="emergencyContactName"
                                        value={createForm.emergencyContactName}
                                        onChange={handleCreateChange}
                                        placeholder="Full name"
                                    />
                                </div>
                                <div className="profile-form-group">
                                    <label>Emergency Contact Phone</label>
                                    <input
                                        type="tel"
                                        name="emergencyContactPhone"
                                        value={createForm.emergencyContactPhone}
                                        onChange={handleCreateChange}
                                        placeholder="+237 6XXXXXXXX"
                                    />
                                </div>
                            </div>

                            <div className="profile-actions">
                                <button type="submit" className="primary-button">
                                    Create Profile
                                </button>
                            </div>
                        </form>
                    </section>
                </main>
            </div>
        );
    }

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
                        className="patient-nav-item active"
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
                            MY PROFILE
                        </p>

                        <h1>
                            Personal Information
                        </h1>

                        <p className="patient-subtitle">
                            View and manage your healthcare
                            information.
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
                    PROFILE
                ========================= */}

                <section className="patient-profile-section">

                    <form
                        className="patient-glass-card patient-profile-card"
                        onSubmit={handleUpdate}
                    >

                        {/* Account Information */}

                        <div className="profile-section-heading">

                            <span>
                                ACCOUNT INFORMATION
                            </span>

                            <h2>
                                Basic Information
                            </h2>

                        </div>


                        <div className="profile-form-grid">

                            <div className="profile-form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    disabled={!editing}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    disabled={!editing}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone}
                                    disabled={!editing}
                                    onChange={handleChange}
                                    placeholder="+237 6XXXXXXXX"
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Age
                                </label>

                                <input
                                    type="number"
                                    name="age"
                                    value={profile.age}
                                    disabled={!editing}
                                    onChange={handleChange}
                                    min="0"
                                    max="120"
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={profile.dateOfBirth}
                                    disabled={!editing}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={profile.gender}
                                    disabled={!editing}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                </select>

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Occupation
                                </label>

                                <input
                                    type="text"
                                    name="occupation"
                                    value={profile.occupation}
                                    disabled={!editing}
                                    onChange={handleChange}
                                    placeholder="Enter occupation"
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Blood Group
                                </label>

                                <select
                                    name="bloodGroup"
                                    value={profile.bloodGroup}
                                    disabled={!editing}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select blood group
                                    </option>

                                    <option value="A+">
                                        A+
                                    </option>

                                    <option value="A-">
                                        A-
                                    </option>

                                    <option value="B+">
                                        B+
                                    </option>

                                    <option value="B-">
                                        B-
                                    </option>

                                    <option value="AB+">
                                        AB+
                                    </option>

                                    <option value="AB-">
                                        AB-
                                    </option>

                                    <option value="O+">
                                        O+
                                    </option>

                                    <option value="O-">
                                        O-
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* Address */}

                        <div className="profile-section-heading profile-spacing">

                            <span>
                                PERSONAL DETAILS
                            </span>

                            <h2>
                                Healthcare Information
                            </h2>

                        </div>


                        <div className="profile-form-group full-width">

                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={profile.address}
                                disabled={!editing}
                                onChange={handleChange}
                                placeholder="Enter your residential address"
                                rows="3"
                            />

                        </div>


                        <div className="profile-form-group full-width">

                            <label>
                                Allergies
                            </label>

                            <textarea
                                name="allergies"
                                value={profile.allergies}
                                disabled={!editing}
                                onChange={handleChange}
                                placeholder="Enter any known allergies or type 'None'"
                                rows="3"
                            />

                        </div>


                        {/* Emergency Contact */}

                        <div className="profile-section-heading profile-spacing">

                            <span>
                                EMERGENCY CONTACT
                            </span>

                            <h2>
                                Emergency Contact Information
                            </h2>

                        </div>


                        <div className="profile-form-grid">

                            <div className="profile-form-group">

                                <label>
                                    Emergency Contact Name
                                </label>

                                <input
                                    type="text"
                                    name="emergencyContactName"
                                    value={
                                        profile.emergencyContactName
                                    }
                                    disabled={!editing}
                                    onChange={handleChange}
                                    placeholder="Full name"
                                />

                            </div>


                            <div className="profile-form-group">

                                <label>
                                    Emergency Contact Phone
                                </label>

                                <input
                                    type="tel"
                                    name="emergencyContactPhone"
                                    value={
                                        profile.emergencyContactPhone
                                    }
                                    disabled={!editing}
                                    onChange={handleChange}
                                    placeholder="+237 6XXXXXXXX"
                                />

                            </div>

                        </div>


                        {/* Buttons */}

                        <div className="profile-actions">

                            {!editing ? (

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={() => {
                                        setEditing(true);
                                        // focus first editable input for convenience
                                        setTimeout(() => {
                                            const el = document.querySelector('.patient-profile-card input[name="name"], .patient-profile-card textarea, .patient-profile-card select');
                                            if (el) el.focus();
                                        }, 50);
                                    }}
                                >
                                    Update Profile
                                </button>

                            ) : (

                                <>

                                    <button
                                        type="submit"
                                        className="primary-button"
                                    >
                                        Save Changes
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() =>
                                            setEditing(false)
                                        }
                                    >
                                        Cancel
                                    </button>

                                </>

                            )}


                            <button
                                type="button"
                                className="danger-button"
                                onClick={handleDelete}
                            >
                                Delete Profile
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
}

export default PatientProfile;