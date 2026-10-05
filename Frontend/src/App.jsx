import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import api from "./services/api";

import logo from "./assets/images/logo.jpg";
import homeImage from "./assets/images/img 5.jpg";
import appointmentImage from "./assets/images/img 3.jpg";

import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import PatientAppointments from "./pages/patient/PatientAppointments.jsx";
import PatientQueue from "./pages/patient/PatientQueue.jsx";
import PatientProfile from "./pages/patient/PatientProfile.jsx";

import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import DoctorQueue from "./pages/doctor/DoctorQueue.jsx";
import DoctorAppointments from "./pages/doctor/DoctorAppointments.jsx";
import DoctorSchedule from "./pages/doctor/DoctorSchedule.jsx";
import DoctorProfile from "./pages/doctor/DoctorProfile.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminPatients from "./pages/admin/AdminPatients.jsx";
import AdminQueue from "./pages/admin/AdminQueue";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminProfile from "./pages/admin/AdminProfile.jsx";

import "./index.css";


/* ==========================================================
   REUSABLE BRAND HEADER
   ========================================================== */

function BrandHeader({ backPath = null }) {
    const navigate = useNavigate();

    return (
        <header className="site-header">

            <div className="brand-container">

                {backPath && (
                    <button
                        className="header-back-button"
                        onClick={() => navigate(backPath)}
                    >
                        ←
                    </button>
                )}

                <img
                    src={logo}
                    alt="Smartcare Queue Logo"
                    className="site-logo"
                />

                <div className="brand-text">

                    <h2>
                        Smartcare Queue
                    </h2>

                    <p>
                        Smart healthcare for Simpler patient flow.
                    </p>

                </div>

            </div>

        </header>
    );
}


/* ==========================================================
   PAGE 1 — HOME PAGE
   ========================================================== */

function HomePage() {

    const navigate = useNavigate();

    return (
        <main className="page home-page">

            {/* Background decoration */}
            <div className="bg-circle bg-circle-one"></div>

            <div className="bg-circle bg-circle-two"></div>


            {/* Header */}
            <BrandHeader />


            {/* Main hero */}
            <section className="home-hero">

                <div className="home-content">

                    <h1>

                        Smarter Queues.

                        <br />

                        <span>
                            Better Patient Care.
                        </span>

                    </h1>


                    <p className="home-description">

                        Welcome to Smartcare Queue, a modern hospital
                        appointment and queue management system designed
                        to make healthcare visits faster, simpler and
                        more convenient.

                    </p>


                    <div className="home-features">

                        <FeatureCard
                            icon="⏱"
                            title="Less Waiting"
                            text="Know your estimated waiting time and queue position."
                        />

                        <FeatureCard
                            icon="📅"
                            title="Easy Scheduling"
                            text="Book appointments with available healthcare specialists."
                        />

                        <FeatureCard
                            icon="🏥"
                            title="Better Care"
                            text="Stay connected with your healthcare journey."
                        />

                    </div>


                    <button
                        className="primary-button continue-button"
                        onClick={() => navigate("/why-careflow")}
                    >

                        Continue

                        <span>
                            →
                        </span>

                    </button>

                </div>

            </section>


            <footer className="site-footer">

                Intelligent healthcare. Simpler patient flow.

            </footer>

        </main>
    );
}


/* ==========================================================
   PAGE 2 — WHY SMARTCARE QUEUE
   ========================================================== */

function WhyCareFlowPage() {

    const navigate = useNavigate();

    return (
        <main className="page secondary-page">


            {/* Header */}
            <BrandHeader backPath="/" />


            {/* Introduction */}
            <section className="intro-section">

                <div className="intro-content">

                    <h1>

                        Healthcare that moves

                        <br />

                        <span>
                            with you.
                        </span>

                    </h1>


                    <p>

                        Smartcare Queue connects patients, doctors and
                        hospital teams through a smarter, faster and
                        more transparent healthcare experience.

                    </p>


                    <div className="button-group">

                        <button
                            className="primary-button"
                            onClick={() => navigate("/appointment")}
                        >

                            Continue

                            <span>
                                →
                            </span>

                        </button>


                        <button
                            className="secondary-button"
                            onClick={() => navigate("/")}
                        >

                            Back to Home

                        </button>

                    </div>

                </div>


                <div className="intro-image-container">

                    <img
                        src={homeImage}
                        alt="Modern healthcare"
                        className="intro-image"
                    />

                </div>

            </section>


            {/* Benefits */}
            <section className="benefits-section">

                <div className="section-heading">

                    <span>
                        WHY SMARTCARE QUEUE
                    </span>


                    <h2>

                        Everything you need for

                        <br />

                        a smoother patient journey.

                    </h2>


                    <p>

                        From appointment scheduling to consultation,
                        Smartcare Queue keeps patients informed and
                        connected throughout their hospital visit.

                    </p>

                </div>


                <div className="benefits-grid">

                    <BenefitCard
                        number="01"
                        icon="📅"
                        title="Efficient Doctor Scheduling"
                        text="Connect with specialized medical staff, view available consultation hours and choose a convenient appointment time."
                    />


                    <BenefitCard
                        number="02"
                        icon="🎟"
                        title="Digital Ticketing"
                        text="Receive a digital queue ticket without standing in a physical line."
                    />


                    <BenefitCard
                        number="03"
                        icon="📱"
                        title="Live Queue Access"
                        text="Check your queue position, estimated waiting time and appointment information."
                    />


                    <BenefitCard
                        number="04"
                        icon="🧠"
                        title="AI-Assisted Predictions"
                        text="Use intelligent predictions to estimate waiting times and support better patient flow."
                    />


                    <BenefitCard
                        number="05"
                        icon="🔔"
                        title="Real-Time Updates"
                        text="Stay informed as your queue position and appointment information changes."
                    />


                    <BenefitCard
                        number="06"
                        icon="👨‍⚕️"
                        title="Healthcare Team Management"
                        text="Healthcare staff can manage waiting patients and monitor the consultation queue."
                    />

                </div>

            </section>


            {/* Call to action */}
            <section className="cta-section">

                <div>

                    <span>
                        READY FOR A BETTER EXPERIENCE?
                    </span>


                    <h2>
                        Your hospital journey can be simpler.
                    </h2>


                    <p>

                        Continue to smart appointment scheduling
                        and digital queue management.

                    </p>

                </div>


                <button
                    className="primary-button"
                    onClick={() => navigate("/appointment")}
                >

                    Continue

                    <span>
                        →
                    </span>

                </button>

            </section>


            <footer className="site-footer">

                Smartcare Queue · Intelligent healthcare. Simpler patient flow.

            </footer>

        </main>
    );
}


/* ==========================================================
   PAGE 3 — SMART APPOINTMENT SCHEDULING
   ========================================================== */

function AppointmentIntroPage() {

    const navigate = useNavigate();

    return (
        <main className="page appointment-page">


            {/* Header */}
            <BrandHeader backPath="/why-careflow" />


            {/* Appointment hero */}
            <section className="appointment-hero">

                <div className="appointment-content">

                    <h1>

                        Plan your visit.

                        <br />

                        <span>
                            Skip the uncertainty.
                        </span>

                    </h1>


                    <p>

                        Choose the right specialist, select a convenient
                        consultation slot and receive a digital waiting
                        ticket with an estimated call time.

                    </p>


                    <div className="appointment-buttons">

                        <button
                            className="primary-button"
                            onClick={() => navigate("/login")}
                        >

                            Schedule Your Appointment

                            <span>
                                →
                            </span>

                        </button>


                        <button
                            className="secondary-button"
                            onClick={() => navigate("/why-careflow")}
                        >

                            ← Previous

                        </button>

                    </div>

                </div>


                <div className="appointment-image-container">

                    <img
                        src={appointmentImage}
                        alt="Smart appointment scheduling"
                        className="appointment-image"
                    />

                </div>

            </section>


            {/* How it works */}
            <section className="steps-section">

                <div className="section-heading">

                    <span>
                        HOW IT WORKS
                    </span>


                    <h2>

                        A simpler way to manage

                        <br />

                        your hospital visit.

                    </h2>


                    <p>

                        Get from appointment booking to consultation
                        with fewer delays and more visibility.

                    </p>

                </div>


                <div className="steps-grid">

                    <StepCard
                        number="01"
                        title="Choose a Specialist"
                        text="Find the doctor or department that best matches your healthcare needs."
                    />


                    <StepCard
                        number="02"
                        title="Select a Time"
                        text="Choose an available consultation slot that works for your schedule."
                    />


                    <StepCard
                        number="03"
                        title="Get Confirmation"
                        text="Receive your appointment details immediately after booking."
                    />


                    <StepCard
                        number="04"
                        title="Receive Your Digital Ticket"
                        text="Your queue ticket is generated with your position and estimated call time."
                    />

                </div>

            </section>


            {/* Features */}
            <section className="appointment-features">

                <div className="appointment-feature">

                    <div className="feature-large-icon">
                        ⚡
                    </div>


                    <div>

                        <h3>
                            Instant Slot Confirmation
                        </h3>


                        <p>

                            Know immediately that your selected
                            consultation time has been reserved.

                        </p>

                    </div>

                </div>


                <div className="appointment-feature">

                    <div className="feature-large-icon">
                        🎟
                    </div>


                    <div>

                        <h3>
                            Real-Time Ticket Generator
                        </h3>


                        <p>

                            Receive your digital queue ticket and
                            monitor your position without waiting
                            at a counter.

                        </p>

                    </div>

                </div>

            </section>


            {/* Final CTA */}
            <section className="final-cta">

                <div>

                    <span>
                        SCHEDULE YOUR FIRST APPOINTMENT
                    </span>


                    <h2>

                        Start your hospital visit

                        <br />

                        with confidence.

                    </h2>


                    <p>

                        Choose a specialist, pick a convenient time
                        and let Smartcare Queue help manage the queue
                        so you can spend less time waiting.

                    </p>

                </div>


                <button
                    className="primary-button large-button"
                    onClick={() => navigate("/login")}
                >

                    Get Started

                    <span>
                        →
                    </span>

                </button>

            </section>


            <footer className="site-footer">

                Smartcare Queue · Smart appointments. Digital queues. Better care.

            </footer>

        </main>
    );
}


/* ==========================================================
   PAGE 4 — LOGIN PAGE
   ========================================================== */

function LoginPage() {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");


    return (
        <main className="login-page">


            {/* Background decoration */}
            <div className="login-glow login-glow-one"></div>

            <div className="login-glow login-glow-two"></div>


            {/* Back button */}
            <button
                className="login-back-button"
                onClick={() => navigate("/appointment")}
            >

                ← Back

            </button>


            {/* Glass container */}
            <section className="login-container">


                {/* Left panel */}
                <div className="login-info">


                    <div className="login-brand">

                        <img
                            src={logo}
                            alt="Smartcare Queue Logo"
                            className="login-logo"
                        />


                        <div className="login-brand-text">

                            <h3>
                                Smartcare Queue
                            </h3>

                            <p>
                                Smart healthcare. Simpler patient flow.
                            </p>

                        </div>

                    </div>


                    <div className="login-info-content">

                        <h1>

                            Welcome

                            <br />

                            <span>
                                back.
                            </span>

                        </h1>


                        <p>

                            Sign in to your Smartcare Queue account
                            to manage appointments, digital queue
                            tickets and your hospital visit.

                        </p>


                        <div className="login-trust-list">

                            <div className="login-trust-item">

                                <span className="trust-icon">
                                    ✓
                                </span>

                                Secure account access

                            </div>


                            <div className="login-trust-item">

                                <span className="trust-icon">
                                    ✓
                                </span>

                                Real-time queue information

                            </div>


                            <div className="login-trust-item">

                                <span className="trust-icon">
                                    ✓
                                </span>

                                Easy appointment management

                            </div>

                        </div>

                    </div>


                    <div className="login-info-footer">

                        <span>
                            Smartcare Queue
                        </span>

                        <span>
                            •
                        </span>

                        <span>
                            Intelligent healthcare management
                        </span>

                    </div>

                </div>


                {/* Login form */}
                <div className="login-form-panel">


                    <div className="login-form-header">

                        <div className="mobile-login-logo">

                            <img
                                src={logo}
                                alt="Smartcare Queue"
                            />

                        </div>


                        <h2>
                            Sign in
                        </h2>


                        <p>
                            Enter your credentials to continue.
                        </p>

                    </div>


                    <form
                        className="login-form"
                        onSubmit={async (event) => {
                            event.preventDefault();

                            try {
                                const payload = {
                                    Email: email,
                                    Password: password,
                                };

                                const response = await api.post(
                                    "/Auth/login",
                                    payload
                                );

                                const data = response.data || {};
                                const token = data.token || data.Token;

                                if (!token) {
                                    alert(
                                        data.message ||
                                            "Login failed."
                                    );
                                    return;
                                }

                                const nameFromToken = (() => {
                                    try {
                                        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
                                        return payload.name || payload.unique_name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || null;
                                    } catch {
                                        return null;
                                    }
                                })();

                                login(token, {
                                    name: nameFromToken || `${role || "Doctor"} User`,
                                    email: email.trim().toLowerCase(),
                                    role,
                                });

                                // Navigate based on selected role
                                if (role === "Doctor")
                                    navigate("/doctor-dashboard");
                                else if (role === "Admin")
                                    navigate("/admin-dashboard");
                                else navigate("/patientDashboard");

                            } catch (err) {
                                console.error(err);
                                const serverMsg = err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;
                                alert(`Login failed: ${serverMsg}`);
                            }
                        }}
                    >


                        {/* Account type */}
                        <div className="form-group">

                            <label htmlFor="role">
                                Account type
                            </label>


                            <select
                                id="role"
                                className="form-input"
                                value={role}
                                onChange={(e) =>
                                    setRole(e.target.value)
                                }
                                required
                            >

                                <option value="" disabled>
                                    Select account type
                                </option>

                                <option value="Patient">Patient</option>

                                <option value="Doctor">Doctor</option>

                                <option value="Admin">Administrator</option>

                            </select>

                        </div>


                        {/* Email */}
                        <div className="form-group">

                            <label htmlFor="email">
                                Email address
                            </label>


                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />

                        </div>


                        {/* Password */}
                        <div className="form-group">

                            <div className="form-label-row">

                                <label htmlFor="password">
                                    Password
                                </label>


                                <button
                                    type="button"
                                    className="forgot-password"
                                    onClick={() =>
                                        console.log(
                                            "Forgot password clicked"
                                        )
                                    }
                                >
                                    Forgot password?
                                </button>

                            </div>


                            <div className="password-input-wrapper">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className="form-input password-input"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />


                                <button
                                    type="button"
                                    className="password-show-button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >

                                    {showPassword
                                        ? "Hide"
                                        : "Show"}

                                </button>

                            </div>

                        </div>


                        {/* Remember me */}
                        <div className="remember-row">

                            <label className="remember-label">

                                <input
                                    type="checkbox"
                                />


                                <span>
                                    Remember me
                                </span>

                            </label>


                            <span className="secure-text">
                                🔒 Secure login
                            </span>

                        </div>


                        {/* Sign in */}
                        <button
                            type="submit"
                            className="login-submit-button"
                        >

                            Sign in

                            <span>
                                →
                            </span>

                        </button>

                    </form>


                    {/* Registration */}
                    <div className="register-section">

                        <p>
                            Don't have an account?
                        </p>


                        <button
                            className="register-button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >

                            Create an account

                            <span>
                                →
                            </span>

                        </button>

                    </div>


                    <p className="login-security-note">

                        Your information is protected and handled securely.

                    </p>

                </div>

            </section>


            <footer className="login-footer">

                © 2026 Smartcare Queue · Intelligent healthcare management

            </footer>

        </main>
    );
}


/* ==========================================================
   PAGE 5 — REGISTRATION PAGE
   ========================================================== */

function RegistrationPage() {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // Role is always Patient for public registration.
    // Doctor / Admin accounts are created by an Admin through the admin panel.
    const role = "Patient";


    return (
        <main className="login-page">


            {/* Background */}
            <div className="login-glow login-glow-one"></div>

            <div className="login-glow login-glow-two"></div>


            {/* Back button */}
            <button
                className="login-back-button"
                onClick={() => navigate("/login")}
            >

                ← Back to Login

            </button>


            {/* Glass container */}
            <section className="login-container">


                {/* Left panel */}
                <div className="login-info">


                    <div className="login-brand">

                        <img
                            src={logo}
                            alt="Smartcare Queue Logo"
                            className="login-logo"
                        />


                        <div className="login-brand-text">

                            <h3>
                                Smartcare Queue
                            </h3>

                            <p>
                                Smart healthcare. Simpler patient flow.
                            </p>

                        </div>

                    </div>


                    <div className="login-info-content">

                        <h1>

                            Join

                            <br />

                            <span>
                                Smartcare Queue.
                            </span>

                        </h1>


                        <p>

                            Create your account and take control
                            of your hospital visits with smarter
                            appointment and queue management.

                        </p>


                        <div className="login-trust-list">

                            <div className="login-trust-item">

                                <span className="trust-icon">
                                    ✓
                                </span>

                                Easy appointment scheduling

                            </div>


                            <div className="login-trust-item">

                                <span className="trust-icon">
                                    ✓
                                </span>

                                Digital queue management

                            </div>


                            <div className="login-trust-item">

                                <span className="trust-icon">
                                    ✓
                                </span>

                                Real-time queue information

                            </div>


                            <div className="login-trust-item">

                                <span className="trust-icon">
                                    ✓
                                </span>

                                Secure healthcare access

                            </div>

                        </div>

                    </div>


                    <div className="login-info-footer">

                        <span>
                            Smartcare Queue
                        </span>

                        <span>
                            •
                        </span>

                        <span>
                            Intelligent healthcare management
                        </span>

                    </div>

                </div>


                {/* Registration form */}
                <div className="login-form-panel">


                    <div className="login-form-header">

                        <div className="mobile-login-logo">

                            <img
                                src={logo}
                                alt="Smartcare Queue"
                            />

                        </div>


                        <h2>
                            Create account
                        </h2>


                        <p>
                            Register to start using Smartcare Queue.
                        </p>

                    </div>


                    <form
                        className="login-form"
                        onSubmit={async (event) => {
                            event.preventDefault();

                            if (password !== confirmPassword) {
                                alert("Passwords do not match.");
                                return;
                            }

                            try {
                                const payload = {
                                    FirstName: firstName,
                                    LastName: lastName,
                                    Email: email,
                                    Phone: phone,
                                    Password: password,
                                    Role: role,
                                };

                                const response = await api.post(
                                    "/Auth/register",
                                    payload
                                );

                                const data = response.data || {};
                                const token = data.token || data.Token;

                                if (!token) {
                                    alert(
                                        data.message ||
                                            "Registration failed."
                                    );
                                    return;
                                }

                                const nameFromToken = (() => {
                                    try {
                                        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
                                        return payload.name || payload.unique_name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || null;
                                    } catch {
                                        return null;
                                    }
                                })();

                                login(token, {
                                    name: nameFromToken || `${firstName} ${lastName}`.trim() || "Patient",
                                    firstName,
                                    lastName,
                                    email: email.trim().toLowerCase(),
                                    role,
                                });

                                // Role is always Patient for public registration
                                navigate("/patientDashboard");

                            } catch (err) {
                                console.error(err);
                                const serverMsg = err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;
                                alert(`Registration failed: ${serverMsg}`);
                            }
                        }}
                    >


                        {/* First name */}
                        <div className="form-group">

                            <label htmlFor="firstName">
                                First name
                            </label>


                            <input
                                    id="firstName"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your first name"
                                    required
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                />

                        </div>


                        {/* Last name */}
                        <div className="form-group">

                            <label htmlFor="lastName">
                                Last name
                            </label>


                            <input
                                    id="lastName"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your last name"
                                    required
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                />

                        </div>


                        {/* Email */}
                        <div className="form-group">

                            <label htmlFor="registerEmail">
                                Email address
                            </label>


                            <input
                                    id="registerEmail"
                                    type="email"
                                    className="form-input"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                        </div>


                        {/* Phone */}
                        <div className="form-group">

                            <label htmlFor="phone">
                                Phone number
                            </label>


                            <input
                                    id="phone"
                                    type="tel"
                                    className="form-input"
                                    placeholder="Enter your phone number"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />

                        </div>


                        {/* Password */}
                        <div className="form-group">

                            <label htmlFor="registerPassword">
                                Password
                            </label>


                            <div className="password-input-wrapper">

                                <input
                                    id="registerPassword"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className="form-input password-input"
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />


                                <button
                                    type="button"
                                    className="password-show-button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >

                                    {showPassword
                                        ? "Hide"
                                        : "Show"}

                                </button>

                            </div>

                        </div>


                        {/* Confirm password */}
                        <div className="form-group">

                            <label htmlFor="confirmPassword">
                                Confirm password
                            </label>


                            <div className="password-input-wrapper">

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className="form-input password-input"
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />


                                <button
                                    type="button"
                                    className="password-show-button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >

                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}

                                </button>

                            </div>

                        </div>


                        {/* Account type — patient only, no picker needed */}
                        <div className="form-group">
                            <label>Account type</label>
                            <div className="form-input" style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                background: "rgba(240,249,255,0.8)",
                                color: "#0b8792",
                                fontWeight: 700,
                                cursor: "default",
                                userSelect: "none"
                            }}>
                                <span>🧑‍⚕️</span>
                                Patient
                            </div>
                            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
                                Doctor and Admin accounts are created by administrators only.
                            </p>
                        </div>


                        {/* Terms */}
                        <div className="remember-row">

                            <label className="remember-label">

                                <input
                                    type="checkbox"
                                    required
                                />


                                <span>
                                    I agree to the terms and conditions
                                </span>

                            </label>

                        </div>


                        {/* Create account */}
                        <button
                            type="submit"
                            className="login-submit-button"
                        >

                            Create account

                            <span>
                                →
                            </span>

                        </button>

                    </form>


                    {/* Login link */}
                    <div className="register-section">

                        <p>
                            Already have an account?
                        </p>


                        <button
                            className="register-button"
                            onClick={() =>
                                navigate("/login")
                            }
                        >

                            Sign in

                            <span>
                                →
                            </span>

                        </button>

                    </div>


                    <p className="login-security-note">

                        Your information is protected and handled securely.

                    </p>

                </div>

            </section>


            <footer className="login-footer">

                © 2026 Smartcare Queue · Intelligent healthcare management

            </footer>

        </main>
    );
}


/* ==========================================================
   REUSABLE COMPONENTS
   ========================================================== */

function FeatureCard({ icon, title, text }) {

    return (
        <div className="feature-card">

            <div className="feature-icon">
                {icon}
            </div>


            <div>

                <h3>
                    {title}
                </h3>


                <p>
                    {text}
                </p>

            </div>

        </div>
    );
}


function BenefitCard({ number, icon, title, text }) {

    return (
        <div className="benefit-card">

            <div className="benefit-top">

                <span className="benefit-number">
                    {number}
                </span>


                <span className="benefit-icon">
                    {icon}
                </span>

            </div>


            <h3>
                {title}
            </h3>


            <p>
                {text}
            </p>

        </div>
    );
}


function StepCard({ number, title, text }) {

    return (
        <div className="step-card">

            <span className="step-number">
                {number}
            </span>


            <h3>
                {title}
            </h3>


            <p>
                {text}
            </p>

        </div>
    );
}


/* ==========================================================
   APPLICATION ROUTES
   ========================================================== */

function App() {
    return (
        <Routes>

            {/* Home */}
            <Route
                path="/"
                element={<HomePage />}
            />

            {/* Why Smartcare Queue */}
            <Route
                path="/why-careflow"
                element={<WhyCareFlowPage />}
            />

            {/* Appointment Introduction */}
            <Route
                path="/appointment"
                element={<AppointmentIntroPage />}
            />

            {/* Login */}
            <Route
                path="/login"
                element={<LoginPage />}
            />

            {/* Registration */}
            <Route
                path="/register"
                element={<RegistrationPage />}
            />

            {/* ==================================================
                PATIENT DASHBOARD
               ================================================== */}

            <Route
                path="/patientDashboard"
                element={<PatientDashboard />}
            />

            {/* Patient Appointments */}
            <Route
                path="/patientAppointments"
                element={<PatientAppointments />}
            />

            {/* Patient Queue */}
            <Route
                path="/patientQueue"
                element={<PatientQueue />}
            />

            {/* Patient Profile */}
            <Route
                path="/patientProfile"
                element={<PatientProfile />}
            />

{/* ==================================================
                DOCTOR DASHBOARD
               ================================================== */}

<Route
    path="/doctor-dashboard"
    element={<DoctorDashboard />}
/>

<Route
    path="/doctor-queue"
    element={<DoctorQueue />}
/>

<Route
    path="/doctor-appointments"
    element={<DoctorAppointments />}
/>

<Route
    path="/doctor-schedule"
    element={<DoctorSchedule />}
/>

<Route
    path="/doctor-profile"
    element={<DoctorProfile />}
/>

{/* ==================================================
                ADMIN DASHBOARD
               ================================================== */}

<Route
    path="/admin-dashboard"
    element={<AdminDashboard />}
/>
<Route
    path="/admin-doctors"
    element={<AdminDoctors />}
/>
<Route
    path="/admin-patients"
    element={<AdminPatients />}
/>

<Route
    path="/admin-queue"
    element={<AdminQueue />}
/>

<Route
    path="/admin-users"
    element={<AdminUsers />}
/>
<Route
    path="/admin-appointments"
    element={<AdminAppointments />}
/>
<Route
    path="/admin-profile"
    element={<AdminProfile />}
/>
        </Routes>
    );
}

export default App;