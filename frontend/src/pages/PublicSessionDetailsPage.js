import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
// No need to import useAuth here as it's a public page

function PublicSessionDetailsPage() {
    const { id } = useParams(); // Get the session ID from the URL
    const [sessionData, setSessionData] = useState(null); // Will hold the public session data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_PUBLIC_SESSION_URL = 'http://localhost:8080/api/sessions'; // Public endpoint

    useEffect(() => {
        const fetchPublicSession = async () => {
            setLoading(true);
            setError(null);

            if (!id) {
                setLoading(false);
                setError("No session ID provided in the URL.");
                return;
            }

            try {
                // Fetch public session details directly from the public endpoint
                const response = await axios.get(`${API_PUBLIC_SESSION_URL}/${id}`);
                setSessionData(response.data);
            } catch (err) {
                console.error("Failed to fetch public session details:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Public session not found or not available.");
            } finally {
                setLoading(false);
            }
        };

        fetchPublicSession();
    }, [id, API_PUBLIC_SESSION_URL]); // Depend on ID and URL

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading public session details...</p>
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

    if (!sessionData) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning text-center" role="alert">
                    Public session details could not be loaded.
                </div>
            </div>
        );
    }

    return (
        <Layout title={`Public Session - ${sessionData.title}`} description={sessionData.description}>
            <div className="container mt-4 mb-5">
                <h1 className="text-center mb-4 text-primary fw-bold">
                    <i className="bi bi-journal-text me-2"></i> {sessionData.title}
                </h1>

                <div className="card shadow-sm border-0 rounded-lg p-4 mb-4">
                    <div className="card-body">
                        <h5 className="card-title text-dark mb-3">Session Overview</h5>
                        <p className="card-text">
                            <strong>Status:</strong>{' '}
                            <span className={`badge bg-success text-white rounded-pill px-2 py-1`}> {/* Always published for this view */}
                                PUBLISHED
                            </span>
                        </p>
                        <p className="card-text">
                            <strong>Tags:</strong>{' '}
                            {sessionData.tags && sessionData.tags.length > 0 ? (
                                sessionData.tags.map((tag, index) => (
                                    <span key={index} className="badge bg-info text-dark me-1 mb-1 rounded-pill px-2 py-1">
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                <span className="badge bg-light text-muted border rounded-pill px-2 py-1">No Tags</span>
                            )}
                        </p>
                        <p className="card-text">
                            <strong>Created:</strong> {new Date(sessionData.createdAt).toLocaleDateString()}
                        </p>
                        <p className="card-text">
                            <strong>Last Updated:</strong> {new Date(sessionData.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {sessionData.content ? (
                    <div className="card shadow-sm border-0 rounded-lg p-4">
                        <div className="card-body">
                            <h5 className="card-title text-dark mb-3">Session Content</h5>
                            <div className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                                {sessionData.content}
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

export default PublicSessionDetailsPage;
