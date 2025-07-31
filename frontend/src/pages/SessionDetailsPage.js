import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { useAuth } from '../context/authContext';
import Layout from '../components/Layout';

function SessionDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate
    const [sessionMetadata, setSessionMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [auth] = useAuth();

    useEffect(() => {
        const fetchSessionData = async () => {
            setLoading(true);
            setError(null);
            // IMPORTANT FIX: Only proceed if a token is available
            if (!auth?.token) {
                // Optionally redirect to login if no token, as this is a protected route
                navigate('/login', { replace: true });
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/my-sessions/${id}`);
                const data = response.data;
                setSessionMetadata(data);
            } catch (err) {
                console.error("SessionDetailsPage useEffect: Failed to fetch session details:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Failed to load session details. It might not exist or you lack permission.");
                // If it's a 401 or 403, consider redirecting to login
                if (err.response?.status === 401 || err.response?.status === 403) {
                    navigate('/login', { replace: true });
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSessionData();
        } else {
            setLoading(false);
            setError("No session ID provided in the URL.");
        }
    }, [id, auth?.token, navigate]); // Add navigate to dependencies

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading session details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (!sessionMetadata) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning text-center" role="alert">
                    Session details could not be loaded.
                </div>
            </div>
        );
    }

    return (
        <Layout title="Session Details" description="View detailed information about the wellness session">
            <div className="container mt-4 mb-5">
                <h1 className="text-center mb-4 text-primary fw-bold">
                    <i className="bi bi-journal-text me-2"></i> {sessionMetadata?.title}
                </h1>

                <div className="card shadow-sm border-0 rounded-lg p-4 mb-4">
                    <div className="card-body">
                        <h5 className="card-title text-dark mb-3">Session Overview</h5>
                        <p className="card-text">
                            <strong>Status:</strong>{' '}
                            <span className={`badge ${sessionMetadata?.status === 'draft' ? 'bg-warning text-dark' : 'bg-success text-white'} rounded-pill px-2 py-1`}>
                                {sessionMetadata?.status?.toUpperCase()}
                            </span>
                        </p>
                        <p className="card-text">
                            <strong>Tags:</strong>{' '}
                            {sessionMetadata?.tags && sessionMetadata.tags.length > 0 ? (
                                sessionMetadata.tags.map((tag, index) => (
                                    <span key={index} className="badge bg-info text-dark me-1 mb-1 rounded-pill px-2 py-1">
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                <span className="badge bg-light text-muted border rounded-pill px-2 py-1">No Tags</span>
                            )}
                        </p>
                        <p className="card-text">
                            <strong>Created:</strong> {sessionMetadata?.createdAt ? new Date(sessionMetadata.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="card-text">
                            <strong>Last Updated:</strong> {sessionMetadata?.updatedAt ? new Date(sessionMetadata.updatedAt).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>

                {sessionMetadata?.content ? (
                    <div className="card shadow-sm border-0 rounded-lg p-4">
                        <div className="card-body">
                            <h5 className="card-title text-dark mb-3">Session Content</h5>
                            <div className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                                {sessionMetadata.content}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-warning text-center" role="alert">
                        No content available for this session.
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default SessionDetailsPage;
