import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios directly
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

function DashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sessions`);
        setSessions(response.data);
      } catch (err) {
        console.error("Failed to fetch public sessions:", err);
        setError("Failed to load public sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <Layout title="Dashboard" description="Discover public wellness sessions">
      <div className="container-fluid p-0">
        {/* Hero Section */}
        <div className="bg-primary text-white py-5 text-center shadow-md mb-5">
          <div className="container">
            <h1 className="display-4 fw-bold mb-3">Discover Your Wellness Journey</h1>
            <p className="lead mb-4">Explore a variety of public wellness sessions, from invigorating yoga to calming meditation.</p>
            <Link to="/my-sessions" className="btn btn-light btn-lg rounded-pill shadow-sm">
              Browse Sessions
            </Link>
          </div>
        </div>

        <div className="container mt-4 mb-5">
          <h2 className="text-center mb-4 text-primary fw-bold" id="sessions-list">Public Wellness Sessions</h2>

          {loading && (
            <div className="d-flex flex-column justify-content-center align-items-center text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted fs-5">Fetching inspiring sessions for you...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              <p className="mb-0">{error}</p>
              <p className="mb-0 mt-2">Please ensure your backend is running and accessible.</p>
            </div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div className="alert alert-info text-center py-4" role="alert">
              <h4 className="alert-heading">No Sessions Found!</h4>
              <p>It looks like there are no public wellness sessions available right now.</p>
              <hr />
              <p className="mb-0">Check back later or try creating your own session if you're logged in!</p>
            </div>
          )}

          {!loading && !error && sessions.length > 0 && (
            <div className="row session-list row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {sessions.map((session) => (
                <div className="col" key={session._id}>
                  <div className="card h-100 shadow-sm border-0 rounded-lg transform-on-hover">
                    <div className="category-overlay">
                      <div className="category-content">
                        <Link to={`/my-sessions/view/${session._id}`} className="btn btn-light btn-sm">
                          <FaArrowRight className="ms-2" />
                        </Link>
                      </div>
                    </div>
                    <Link to={`/my-sessions/view/${session._id}`} className="stretched-link"></Link>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-dark mb-2 fw-semibold">{session.title}</h5>
                      <div className="mb-3">
                        {session.tags && session.tags.length > 0 ? (
                          session.tags.map((tag, index) => (
                            <span key={index} className="badge bg-primary text-white me-1 mb-1 rounded-pill px-2 py-1">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="badge bg-light text-muted border rounded-pill px-2 py-1">No Tags</span>
                        )}
                      </div>
                      <div className="mt-auto pt-2">
                        <p className="card-text text-muted small">
                          Published: {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
