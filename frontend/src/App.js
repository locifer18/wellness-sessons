import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardPage from './pages/Dashboard';
import MySessionsPage from './pages/MySessionsPage';
import SessionEditorPage from './pages/SessionEditorPage';
import SessionDetailsPage from './pages/SessionDetailsPage'; // For owner's private view
import PublicSessionDetailsPage from './pages/PublicSessionDetailsPage'; // New: For public view
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/sessions/view/:id" element={<PublicSessionDetailsPage />} />

                {/* Protected Routes - only accessible if authenticated */}
                <Route element={<PrivateRoute />}>
                    <Route path="/my-sessions" element={<MySessionsPage />} />
                    <Route path="/my-session/new" element={<SessionEditorPage />} />
                    <Route path="/my-sessions/edit/:id" element={<SessionEditorPage />} />
                    <Route path="/my-sessions/view/:id" element={<SessionDetailsPage />} />
                </Route>

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Catch-all for 404 Not Found */}
                <Route path="*" element={
                    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
                        <h1 className="text-4xl font-bold text-muted">404 - Page Not Found</h1>
                    </div>
                } />
            </Routes>
        </Router>
    );
}

export default App;

