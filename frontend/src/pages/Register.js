import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaQuestion, FaGoogle, FaFacebookF, FaApple } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/AuthStyles.css';

const Register = () => {
    // State variables for registration form
    // These will hold the values entered by the user
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handlesubmit = async (e) => {
        e.preventDefault();
        try {
            // Sending a POST request to the backend API to register the user
            const res = await axios.post(`http://localhost:8080/api/auth/register`, {
                name,
                email,
                password,
            });
            if (res && res.data.success) {
                toast.success(res.data.message);
                navigate("/login");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Registration failed. Please try again.");
        }
    }

    return (
        <Layout title="Register - Wellness App">
            <div className='auth-container'>
                <div className='auth-card'>
                    <div className='auth-header'>
                        <h2 className='auth-title'>Create Account</h2>
                        <p className='auth-subtitle'>Welcome to Wellness Platform</p>
                    </div>

                    <div className='auth-form'>
                        <form onSubmit={handlesubmit}>
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">Full Name</label>
                                <div className="input-group">
                                    <div className='input-group-div'>
                                        <span className="input-group-text"><FaUser /></span>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="form-control"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <div className="input-group">
                                    <div className='input-group-div'>
                                        <span className="input-group-text"><FaEnvelope /></span>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="form-control"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="input-group">
                                    <div className='input-group-div'>
                                        <span className="input-group-text"><FaLock /></span>
                                        <input
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="form-control"
                                            placeholder="Create a password"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="auth-btn">Create Account</button>

                            <div className="auth-divider">
                                <span className="auth-divider-text">Or register with</span>
                            </div>

                            <div className="social-login">
                                <button type="button" className="social-btn">
                                    <FaGoogle />
                                </button>
                                <button type="button" className="social-btn">
                                    <FaFacebookF />
                                </button>
                                <button type="button" className="social-btn">
                                    <FaApple />
                                </button>
                            </div>
                        </form>

                        <div className="auth-footer">
                            <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}


export default Register;
