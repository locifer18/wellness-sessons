import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import debounce from '../utils/debounce';
import Layout from '../components/Layout';

function SessionEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [auth] = useAuth();

    const [sessionData, setSessionData] = useState({
        title: '',
        tags: '',
        content: '', // Title and Content are required 
    });
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:8080/api';

    const debouncedSave = useCallback(
        debounce(async (dataToSave, sessionId) => {
            if (!auth?.token) {
                setMessage("Cannot auto-save: Not authenticated.");
                return;
            }
            setIsSaving(true);
            setMessage('Saving draft...');
            try {
                const response = await axios.post(`${API_BASE_URL}/my-sessions/save-draft`, { ...dataToSave, id: sessionId });
                if (!sessionId && response.data.session._id) {
                    navigate(`/my-sessions/edit/${response.data.session._id}`, { replace: true });
                }
                setMessage('Draft saved!');
            } catch (error) {
                console.error('Auto-save failed:', error.response?.data || error.message);
                setMessage(error.response?.data?.message || 'Auto-save failed!');
            } finally {
                setIsSaving(false);
                setTimeout(() => setMessage(''), 3000);
            }
        }, 3000),
        [navigate, API_BASE_URL, auth?.token]
    );

    useEffect(() => {
        const fetchSession = async () => {
            if (id) {
                if (!auth?.token) {
                    setLoading(false);
                    setError("Authentication token not found. Please log in.");
                    return;
                }
                try {
                    setLoading(true);
                    setError(null);
                    const response = await axios.get(`${API_BASE_URL}/my-sessions/${id}`);
                    setSessionData({
                        title: response.data.title,
                        tags: response.data.tags.join(', '),
                        content: response.data.content, // Changed from jsonFileUrl to content
                    });
                } catch (err) {
                    console.error('Failed to fetch session for editing:', err.response?.data || err.message);
                    setError(err.response?.data?.message || 'Failed to load session for editing. It might not exist or you lack permission.');
                    navigate('/my-sessions');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchSession();
    }, [id, navigate, API_BASE_URL, auth?.token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSessionData(prevData => ({ ...prevData, [name]: value }));
        debouncedSave({ ...sessionData, [name]: value }, id);
    };

    const handleSaveDraft = async () => {
        setMessage('');
        if (!auth?.token) {
            setMessage("Cannot save: Not authenticated. Please log in.");
            return;
        }
        setIsSaving(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/my-sessions/save-draft`, { ...sessionData, id: id });
            if (!id && response.data.session._id) {
                navigate(`/my-sessions/edit/${response.data.session._id}`, { replace: true });
            }
            setMessage('Session draft saved manually! ✅');
        } catch (error) {
            console.error('Manual save failed:', error.response?.data || error.message);
            setMessage(error.response?.data?.message || 'Manual save failed! ');
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handlePublish = async () => {
        setMessage('');
        if (!id) {
            setMessage('Please save the session as a draft first before publishing.');
            return;
        }
        if (!auth?.token) {
            setMessage("Cannot publish: Not authenticated. Please log in.");
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/my-sessions/publish`, { id });
            setMessage('Session published successfully! 🚀');
            navigate('/my-sessions');
        } catch (error) {
            console.error('Publish failed:', error.response?.data || error.message);
            setMessage(error.response?.data?.message || 'Publish failed! ❌');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading session data...</p>
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

    return (
        <Layout title={id ? "Edit Session" : "Create New Session"} description="Create or edit your wellness session" keywords="wellness, session, create, edit" author="Wellness Platform">
            <div className="container mt-4 mb-5">
                <h1 className="text-center mb-4 text-primary fw-bold">
                    <i className="bi bi-pencil-square me-2"></i> {id ? 'Edit Session' : 'Create New Session'}
                </h1>
                <div className="card shadow-sm border-0 rounded-lg p-4"> 
                     {message && (
                        <div className={`alert ${message.includes('failed') || message.includes('Cannot') ? 'alert-danger' : 'alert-success'} mt-3 text-center`} role="alert">
                            {message}
                        </div>
                    )}
                    <form onSubmit={(e) => e.preventDefault()} className="row g-3">
                        <div className="col-12">
                            <label htmlFor="title" className="form-label fw-semibold">Title</label>
                            <input
                                type="text"
                                className="form-control rounded-md"
                                id="title"
                                name="title"
                                value={sessionData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="tags" className="form-label fw-semibold">Tags (comma-separated)</label>
                            <input
                                type="text"
                                className="form-control rounded-md"
                                id="tags"
                                name="tags"
                                value={sessionData.tags}
                                onChange={handleChange}
                                placeholder="e.g., yoga, meditation, mindfulness"
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="content" className="form-label fw-semibold">Content</label> {/* Changed label */}
                            <textarea // Changed to textarea
                                className="form-control rounded-md"
                                id="content"
                                name="content"
                                value={sessionData.content}
                                onChange={handleChange}
                                rows="10" // Make it a multi-line input
                                placeholder="Enter your session instructions or description here..."
                                required
                            ></textarea>
                        </div>

                        <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="btn btn-secondary rounded-pill shadow-sm px-4"
                                disabled={isSaving || !auth?.token}
                            >
                                {isSaving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <><i className="bi bi-save-fill me-2"></i> Save as Draft</>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handlePublish}
                                className="btn btn-primary rounded-pill shadow-sm px-4"
                                disabled={!id || !auth?.token}
                            >
                                <i className="bi bi-rocket-fill me-2"></i> Publish Session
                            </button>
                        </div>
                    </form>
                   
                </div>
            </div>
        </Layout>
    );
}

export default SessionEditorPage;
