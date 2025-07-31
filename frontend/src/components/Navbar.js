import React from 'react';
import {  NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function Navbar() {
    const [auth, setAuth] = useAuth();
    const navigate = useNavigate();

    const logOut = () => {
        setAuth({ user: null, token: "" });
        localStorage.removeItem('auth');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary custom-navbar shadow-sm">
            <div className="container">
                <NavLink to="/dashboard" className="navbar-brand fs-4 fw-bold">
                    Wellness Platform
                </NavLink>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <NavLink to="/dashboard" className="nav-link">
                                <i className="bi bi-house-door-fill me-1"></i> Dashboard
                            </NavLink>
                        </li>

                        {auth?.user && (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/my-sessions" className="nav-link">
                                        <i className="bi bi-person-lines-fill me-1"></i> My Sessions
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/my-session/new" className="nav-link">
                                        <i className="bi bi-plus-circle-fill me-1"></i> Create Session
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {auth?.user ? (
                            <li className="nav-item">
                                <button
                                    onClick={logOut}
                                    className="btn btn-danger btn-sm ms-lg-3"
                                >
                                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                                </button>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/login" className="nav-link">
                                        <i className="bi bi-box-arrow-in-right me-1"></i> Login
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/register" className="nav-link">
                                        <i className="bi bi-person-plus-fill me-1"></i> Register
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
