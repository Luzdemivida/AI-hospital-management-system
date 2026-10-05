import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";

import appointmentImage from "../../assets/images/appointment.png";
import queueImage from "../../assets/images/queue.png";
import profileImage from "../../assets/images/profile.png";
import dashboardImage from "../../assets/images/dashboard.png";
import logoutImage from "../../assets/images/logout.png";

import api from "../../services/api";
import "./AdminUsers.css";

function AdminUsers() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        status: ""
    });

    // ── Create User (Doctor / Admin) ────────────────────────────────────────
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "Doctor",
        password: "",
    });
    const [creating, setCreating] = useState(false);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/Admin/users");

            console.log("Users API response:", response.data);

            const data = response.data;

            if (Array.isArray(data)) {
                setUsers(data);
            } else if (Array.isArray(data?.data)) {
                setUsers(data.data);
            } else if (Array.isArray(data?.users)) {
                setUsers(data.users);
            } else {
                setUsers([]);
            }

        } catch (err) {
            console.error("Failed to load users:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const getUserId = (user) => {
        return user.id || user.userId;
    };

    const getUserName = (user) => {
        if (user.firstName || user.lastName) {
            return `${user.firstName || ""} ${
                user.lastName || ""
            }`.trim();
        }

        return user.name || user.fullName || "Unknown User";
    };

    const getRole = (user) => {
        return user.role || user.userRole || "—";
    };

    const getStatus = (user) => {
        return user.status || "Active";
    };

    const openEdit = async (user) => {
        const id = getUserId(user);

        if (!id) {
            alert("This user does not have a valid ID.");
            return;
        }

        try {
            const response = await api.get(
                `/Admin/users/${id}`
            );

            const data = response.data;

            const actualUser = data?.data || data?.user || data;

            setSelectedUser(actualUser);

            setEditForm({
                firstName: actualUser.firstName || "",
                lastName: actualUser.lastName || "",
                phone: actualUser.phone || "",
                status: actualUser.status || ""
            });

            setShowEditModal(true);

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to retrieve user details."
            );
        }
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const updateUser = async (event) => {
        event.preventDefault();

        if (!selectedUser) {
            return;
        }

        const id = getUserId(selectedUser);

        try {
            await api.put(
                `/Admin/users/${id}`,
                editForm
            );

            alert("User updated successfully.");

            setShowEditModal(false);

            await loadUsers();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to update user."
            );
        }
    };

    const deleteUser = async (user) => {
        const id = getUserId(user);

        if (!id) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${getUserName(user)}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/Admin/users/${id}`);

            alert("User deleted successfully.");

            await loadUsers();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to delete user."
            );
        }
    };

    const activateUser = async (user) => {
        const id = getUserId(user);

        if (!id) {
            return;
        }

        try {
            await api.put(
                `/Admin/users/${id}/activate`
            );

            alert("User activated successfully.");

            await loadUsers();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to activate user."
            );
        }
    };

    const deactivateUser = async (user) => {
        const id = getUserId(user);

        if (!id) {
            return;
        }

        try {
            await api.put(
                `/Admin/users/${id}/deactivate`
            );

            alert("User deactivated successfully.");

            await loadUsers();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to deactivate user."
            );
        }
    };

    // ── Create User handler ─────────────────────────────────────────────────
    const handleCreateChange = (event) => {
        const { name, value } = event.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const createUser = async (event) => {
        event.preventDefault();

        if (!createForm.firstName || !createForm.lastName ||
            !createForm.email || !createForm.password) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            setCreating(true);
            await api.post("/Admin/users", createForm);
            alert(`${createForm.role} account created successfully.`);
            setShowCreateModal(false);
            setCreateForm({ firstName: "", lastName: "", email: "", phone: "", role: "Doctor", password: "" });
            await loadUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Unable to create user.");
        } finally {
            setCreating(false);
        }
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
                        className="admin-nav-item active"
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

            {/* MAIN */}

            <main className="admin-main">

                <header className="admin-topbar">

                    <div>

                        <p className="admin-page-label">
                            USER MANAGEMENT
                        </p>

                        <h1>
                            System Users
                        </h1>

                        <p className="admin-subtitle">
                            Manage registered users and their
                            system access.
                        </p>

                    </div>

                    <button
                        className="admin-secondary-button"
                        onClick={loadUsers}
                    >
                        ↻ Refresh
                    </button>

                </header>

                <section className="admin-content-card">

                    <div className="admin-section-heading">

                        <div>
                            <p>USERS</p>

                            <h2>
                                Registered Users
                            </h2>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <strong>
                                {users.length} Users
                            </strong>
                            <button
                                className="admin-primary-button"
                                onClick={() => setShowCreateModal(true)}
                            >
                                + Create Doctor / Admin
                            </button>
                        </div>

                    </div>

                    {loading && (
                        <div className="admin-loading">
                            Loading users...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="admin-error">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        users.length === 0 && (

                            <div className="admin-empty-state">

                                <div>🔐</div>

                                <h3>
                                    No users found
                                </h3>

                                <p>
                                    No users were returned by
                                    the backend.
                                </p>

                            </div>
                        )}

                    {!loading &&
                        !error &&
                        users.length > 0 && (

                            <div className="admin-table-wrapper">

                                <table className="admin-table">

                                    <thead>

                                        <tr>
                                            <th>#</th>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {users.map(
                                            (user, index) => {

                                                const id =
                                                    getUserId(user);

                                                const status =
                                                    getStatus(user);

                                                const active =
                                                    String(
                                                        status
                                                    ).toLowerCase() ===
                                                    "active";

                                                return (

                                                    <tr
                                                        key={
                                                            id ||
                                                            index
                                                        }
                                                    >

                                                        <td>
                                                            {index + 1}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    getUserName(
                                                                        user
                                                                    )
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                user.email ||
                                                                "—"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                user.phone ||
                                                                "—"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                getRole(
                                                                    user
                                                                )
                                                            }
                                                        </td>

                                                        <td>

                                                            <span
                                                                className={
                                                                    active
                                                                        ? "admin-status active"
                                                                        : "admin-status inactive"
                                                                }
                                                            >
                                                                {
                                                                    status
                                                                }
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <div className="admin-user-actions">

                                                                <button
                                                                    onClick={() =>
                                                                        openEdit(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                {active ? (

                                                                    <button
                                                                        onClick={() =>
                                                                            deactivateUser(
                                                                                user
                                                                            )
                                                                        }
                                                                    >
                                                                        Deactivate
                                                                    </button>

                                                                ) : (

                                                                    <button
                                                                        onClick={() =>
                                                                            activateUser(
                                                                                user
                                                                            )
                                                                        }
                                                                    >
                                                                        Activate
                                                                    </button>

                                                                )}

                                                                <button
                                                                    className="danger"
                                                                    onClick={() =>
                                                                        deleteUser(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>

                                                            </div>

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

            {/* EDIT MODAL */}

            {showEditModal && selectedUser && (

                <div className="admin-modal-overlay">

                    <div className="admin-modal">

                        <div className="admin-modal-header">

                            <div>
                                <p>USER MANAGEMENT</p>

                                <h2>
                                    Edit User
                                </h2>
                            </div>

                            <button
                                onClick={() =>
                                    setShowEditModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={updateUser}>

                            <div className="admin-form-group">

                                <label>
                                    First Name
                                </label>

                                <input
                                    name="firstName"
                                    value={
                                        editForm.firstName
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                />

                            </div>

                            <div className="admin-form-group">

                                <label>
                                    Last Name
                                </label>

                                <input
                                    name="lastName"
                                    value={
                                        editForm.lastName
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                />

                            </div>

                            <div className="admin-form-group">

                                <label>
                                    Phone
                                </label>

                                <input
                                    name="phone"
                                    value={
                                        editForm.phone
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                />

                            </div>

                            <div className="admin-form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        editForm.status
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                >

                                    <option value="">
                                        Select Status
                                    </option>

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>

                                </select>

                            </div>

                            <div className="admin-modal-actions">

                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                >
                                    Save Changes
                                </button>

                                <button
                                    type="button"
                                    className="admin-cancel-button"
                                    onClick={() =>
                                        setShowEditModal(false)
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* CREATE USER MODAL */}
            {showCreateModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">

                        <div className="admin-modal-header">
                            <div>
                                <p>USER MANAGEMENT</p>
                                <h2>Create Doctor / Admin Account</h2>
                                <p style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                                    Patients self-register publicly. Use this form to create Doctor or Admin accounts.
                                </p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)}>×</button>
                        </div>

                        <form onSubmit={createUser}>

                            <div className="admin-form-group">
                                <label>Role <span style={{ color: "#b91c1c" }}>*</span></label>
                                <select
                                    name="role"
                                    value={createForm.role}
                                    onChange={handleCreateChange}
                                    required
                                >
                                    <option value="Doctor">Doctor</option>
                                    <option value="Admin">Administrator</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label>First Name <span style={{ color: "#b91c1c" }}>*</span></label>
                                <input
                                    name="firstName"
                                    value={createForm.firstName}
                                    onChange={handleCreateChange}
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Last Name <span style={{ color: "#b91c1c" }}>*</span></label>
                                <input
                                    name="lastName"
                                    value={createForm.lastName}
                                    onChange={handleCreateChange}
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Email Address <span style={{ color: "#b91c1c" }}>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={createForm.email}
                                    onChange={handleCreateChange}
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={createForm.phone}
                                    onChange={handleCreateChange}
                                    placeholder="Enter phone number (optional)"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Temporary Password <span style={{ color: "#b91c1c" }}>*</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    value={createForm.password}
                                    onChange={handleCreateChange}
                                    placeholder="Set a temporary password"
                                    required
                                />
                                <p style={{ margin: "5px 0 0", fontSize: 11, color: "#6b7280" }}>
                                    Share this password with the user — they should change it after first login.
                                </p>
                            </div>

                            <div className="admin-modal-actions">
                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={creating}
                                >
                                    {creating ? "Creating…" : `Create ${createForm.role} Account`}
                                </button>
                                <button
                                    type="button"
                                    className="admin-cancel-button"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminUsers;