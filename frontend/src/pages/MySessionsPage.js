import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import Layout from '../components/Layout';

function MySessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [auth] = useAuth();
    const [message, setMessage] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const navigate = useNavigate();

    const fetchMySessions = async () => {
        setLoading(true);
        setError(null);

        if (!auth?.token) {
            console.log("MySessionsPage useEffect: No token available, redirecting to login.");
            navigate('/login', { replace: true });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/my-sessions`);
            setSessions(response.data);
        } catch (err) {
            console.error("Failed to fetch user's sessions:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to load your sessions. Please ensure you are logged in.");
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMySessions();
    }, [auth?.token, navigate]);

    const handlePublishFromCard = async (sessionId) => {
        setMessage('');
        if (!auth?.token) {
            setMessage("Cannot publish: Not authenticated. Please log in.");
            return;
        }
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/my-sessions/publish`, { id: sessionId });
            setMessage('Session published successfully! 🚀');
            await fetchMySessions();
        } catch (error) {
            console.error('Publish failed:', error.response?.data || error.message);
            setMessage(error.response?.data?.message || 'Publish failed! ❌');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeleteClick = (sessionId) => {
        setConfirmDeleteId(sessionId);
        setMessage('');
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;

        setMessage('');
        if (!auth?.token) {
            setMessage("Cannot delete: Not authenticated. Please log in.");
            setConfirmDeleteId(null);
            return;
        }

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/my-sessions/${confirmDeleteId}`);
            setMessage('Session deleted successfully! 🗑️');
            await fetchMySessions();
        } catch (error) {
            console.error('Delete failed:', error.response?.data || error.message);
            setMessage(error.response?.data?.message || 'Delete failed! ');
        } finally {
            setConfirmDeleteId(null);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDeleteId(null);
        setMessage('');
    };

    return (
        <Layout title="My Sessions" description="Manage your personal wellness sessions">
            <div className="container mt-4 mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="text-primary fw-bold">My Sessions</h1>
                    <Link to="/my-session/new" className="btn btn-primary btn-lg rounded-pill shadow">
                        <i className="bi bi-plus-circle me-2"></i> Create New Session
                    </Link>
                </div>

                {message && (
                    <div className={`alert ${message.includes('failed') || message.includes('Cannot') ? 'alert-danger' : 'alert-success'} mt-3 text-center`} role="alert">
                        {message}
                    </div>
                )}

                {loading && (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center py-5">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted fs-5">Loading your personal sessions...</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger text-center" role="alert">
                        <p className="mb-0">{error}</p>
                        <p className="mb-0 mt-2">If the issue persists, try logging out and back in.</p>
                    </div>
                )}

                {!loading && !error && sessions.length === 0 && (
                    <div className="alert alert-info text-center py-4" role="alert">
                        <h4 className="alert-heading">No Sessions Created Yet!</h4>
                        <p>It looks like you haven't drafted or published any wellness sessions.</p>
                        <hr />
                        <p className="mb-0">Click the "Create New Session" button to get started!</p>
                    </div>
                )}

                {!loading && !error && sessions.length > 0 && (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {sessions.map((session) => (
                            <div className="col" key={session._id}>
                                <div className="card h-100 shadow-sm border-0 rounded-lg transform-on-hover">
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title text-dark mb-3 fw-semibold">{session.title}</h5>
                                        <div className="mb-1">
                                            {session.tags && session.tags.length > 0 ? (
                                                session.tags.map((tag, index) => (
                                                    <span key={index} className="badge bg-primary text-white rounded-pill px-2 py-1">
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="badge bg-light text-muted border rounded-pill px-2 py-1">No Tags</span>
                                            )}
                                        </div>
                                        <div className="mt-auto pt-2 d-flex justify-content-between align-items-center">
                                            {/* Status Badge */}
                                            {session.status === 'draft' ? (
                                                <span className="badge bg-warning text-dark rounded-pill px-3  fw-bold">DRAFT</span>
                                            ) : (
                                                <span className="badge bg-success text-white rounded-pill px-3 py-2 fw-bold">PUBLISHED</span>
                                            )}
                                            {/* Action Buttons - FIX APPLIED HERE */}
                                            <div className="d-flex flex-wrap gap-2 justify-content-end"> {/* Added flex-wrap and justify-content-end */}
                                                {session.status === 'draft' && (
                                                    <button
                                                        onClick={() => handlePublishFromCard(session._id)}
                                                        className="btn btn-outline-success btn-sm rounded-pill"
                                                    >
                                                        <i className="bi bi-rocket-fill me-1"></i> Publish
                                                    </button>
                                                )}
                                                <Link to={`/my-sessions/view/${session._id}`} className="btn btn-outline-info btn-sm rounded-pill">
                                                    <i className="bi bi-eye-fill me-1"></i> View
                                                </Link>
                                                <Link to={`/my-sessions/edit/${session._id}`} className="btn btn-outline-primary btn-sm rounded-pill">
                                                    <i className="bi bi-pencil-fill me-1"></i> Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(session._id)}
                                                    className="btn btn-outline-danger btn-sm rounded-pill"
                                                >
                                                    <i className="bi bi-trash-fill me-1"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {confirmDeleteId && (
                    <> {/* Use a fragment to group the backdrop and modal */}
                        <div className="modal-backdrop fade show d-block"></div>
                        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Confirm Deletion</h5>
                                        <button type="button" className="btn-close" onClick={handleCancelDelete} aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        Are you sure you want to delete this session? This action cannot be undone.
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>Cancel</button>
                                        <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}

export default MySessionsPage;
