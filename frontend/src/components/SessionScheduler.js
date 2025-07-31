import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

// Path to your alarm sound in the public directory
// Make sure 'alram.wav' is placed directly in your React project's 'public' folder.
const ALARM_SOUND_SRC = "../../public/alarm.wav";

function SessionScheduler() {
    const [auth] = useAuth();
    const [sessions, setSessions] = useState([]);
    const [sessionAlert, setSessionAlert] = useState(null);
    const [sessionTimer, setSessionTimer] = useState(null);
    const reminderTimeoutRef = useRef(null);
    const sessionStartTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const audioRef = useRef(new Audio(ALARM_SOUND_SRC)); // Create Audio object once

    const API_BASE_URL = 'http://localhost:8080/api';

    // Function to play alarm sound
    const playAlarm = useCallback(() => {
        console.log("Attempting to play alarm sound...");
        if (audioRef.current) {
            audioRef.current.play().then(() => {
                console.log("Alarm sound played successfully.");
            }).catch(error => {
                console.error("Error playing alarm sound:", error);
                // This often happens due to browser autoplay policies.
                // You might need a user interaction to play audio.
                setSessionAlert({
                    message: "Please click anywhere on the page to enable alarm sound.",
                    type: "warning"
                });
            });
        }
    }, []);

    // Function to clear all timeouts
    const clearAllTimeouts = useCallback(() => {
        if (reminderTimeoutRef.current) {
            clearTimeout(reminderTimeoutRef.current);
            reminderTimeoutRef.current = null;
            console.log("Cleared reminder timeout.");
        }
        if (sessionStartTimeoutRef.current) {
            clearTimeout(sessionStartTimeoutRef.current);
            sessionStartTimeoutRef.current = null;
            console.log("Cleared session start timeout.");
        }
    }, []);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!auth?.token) {
                console.log("SessionScheduler: No auth token, skipping session fetch.");
                setSessions([]);
                return;
            }
            try {
                console.log("SessionScheduler: Fetching user's sessions...");
                const response = await axios.get(`${API_BASE_URL}/my-sessions`, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                console.log("SessionScheduler: Fetched sessions:", response.data);
                setSessions(response.data);
            } catch (error) {
                console.error('Error fetching sessions:', error.response?.data || error.message);
                setSessions([]);
            }
        };

        fetchSessions();

        // Clean up timeouts when component unmounts
        return () => {
            clearAllTimeouts();
        };
    }, [auth?.token, API_BASE_URL, clearAllTimeouts]);

    useEffect(() => {
        clearAllTimeouts(); // Clear existing timers before setting new ones

        if (sessions.length === 0) {
            setSessionAlert(null);
            setSessionTimer(null);
            return;
        }

        const now = new Date();
        console.log("Current time:", now.toLocaleString());

        // Filter for upcoming published sessions
        const upcomingSessions = sessions.filter(session =>
            session.status === 'published' && new Date(session.sessionDate) > now
        ).sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

        console.log("Upcoming published sessions:", upcomingSessions.map(s => ({ title: s.title, date: s.sessionDate })));

        if (upcomingSessions.length > 0) {
            const nextSession = upcomingSessions[0];
            const sessionStartTime = new Date(nextSession.sessionDate);
            const timeToStart = sessionStartTime.getTime() - now.getTime(); // Milliseconds

            console.log("Next session:", nextSession.title, "starts at:", sessionStartTime.toLocaleString());
            console.log("Time until next session starts (ms):", timeToStart);

            // Set reminder 5 minutes before
            const fiveMinutesBefore = 5 * 60 * 1000; // 5 minutes in milliseconds
            const timeToReminder = timeToStart - fiveMinutesBefore;

            if (timeToReminder > 0) {
                console.log(`Setting 5-minute reminder for '${nextSession.title}' in ${Math.round(timeToReminder / 1000 / 60)} minutes.`);
                reminderTimeoutRef.current = setTimeout(() => {
                    setSessionAlert({
                        message: `Reminder: Your session "${nextSession.title}" starts in 5 minutes!`,
                        type: "info"
                    });
                    playAlarm();
                    console.log("5-minute reminder triggered.");
                }, timeToReminder);
            } else {
                console.log("5-minute reminder time has already passed or is too close.");
            }

            // Set session start alarm
            if (timeToStart > 0) {
                console.log(`Setting session start alarm for '${nextSession.title}' in ${Math.round(timeToStart / 1000)} seconds.`);
                sessionStartTimeoutRef.current = setTimeout(() => {
                    setSessionAlert({
                        message: `Your session "${nextSession.title}" is starting NOW!`,
                        type: "success"
                    });
                    playAlarm();
                    console.log("Session start alarm triggered.");
                    // After session starts, clear alert after a few seconds
                    setTimeout(() => setSessionAlert(null), 5000);
                    setSessionTimer(null); // Clear timer display
                }, timeToStart);

                // Update timer countdown every second
                const interval = setInterval(() => {
                    const remainingTime = new Date(nextSession.sessionDate).getTime() - new Date().getTime();
                    if (remainingTime <= 0) {
                        clearInterval(interval);
                        setSessionTimer(null);
                    } else {
                        const totalSeconds = Math.floor(remainingTime / 1000);
                        const minutes = Math.floor(totalSeconds / 60);
                        const seconds = totalSeconds % 60;
                        setSessionTimer({
                            title: nextSession.title,
                            minutes: minutes,
                            seconds: seconds
                        });
                    }
                }, 1000);

                return () => clearInterval(interval); // Cleanup interval
            } else {
                console.log("Session start time has already passed.");
                setSessionAlert({
                    message: `Session "${nextSession.title}" has already started or passed.`,
                    type: "warning"
                });
                setSessionTimer(null);
            }
        } else {
            console.log("No upcoming published sessions found.");
            setSessionAlert({
                message: "No upcoming wellness sessions scheduled.",
                type: "info"
            });
            setSessionTimer(null);
        }
    }, [sessions, playAlarm, clearAllTimeouts]); // Re-run effect if sessions change

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4 text-primary fw-bold">
                <i className="bi bi-calendar-check me-2"></i> Upcoming Sessions
            </h2>

            {sessionAlert && (
                <div className={`
                    fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
                    ${sessionAlert.type === 'info' ? 'bg-blue-500/80' : ''}
                    ${sessionAlert.type === 'success' ? 'bg-green-500/80' : ''}
                    ${sessionAlert.type === 'warning' ? 'bg-yellow-500/80' : ''}
                    ${sessionAlert.type === 'danger' ? 'bg-red-500/80' : ''}
                    p-4
                `}>
                    <div className={`
                        bg-white rounded-lg shadow-xl p-6 text-center max-w-sm mx-auto
                        transform transition-all duration-300 scale-100 opacity-100
                        border-4
                        ${sessionAlert.type === 'info' ? 'border-blue-600 text-blue-800' : ''}
                        ${sessionAlert.type === 'success' ? 'border-green-600 text-green-800' : ''}
                        ${sessionAlert.type === 'warning' ? 'border-yellow-600 text-yellow-800' : ''}
                        ${sessionAlert.type === 'danger' ? 'border-red-600 text-red-800' : ''}
                    `}>
                        <h3 className="text-2xl font-bold mb-3">
                            {sessionAlert.type === 'info' && <i className="bi bi-info-circle-fill me-2 text-blue-500"></i>}
                            {sessionAlert.type === 'success' && <i className="bi bi-check-circle-fill me-2 text-green-500"></i>}
                            {sessionAlert.type === 'warning' && <i className="bi bi-exclamation-triangle-fill me-2 text-yellow-500"></i>}
                            {sessionAlert.type === 'danger' && <i className="bi bi-x-circle-fill me-2 text-red-500"></i>}
                            {sessionAlert.type === 'success' ? 'Session Starting!' : 'Notification'}
                        </h3>
                        <p className="text-lg mb-4">{sessionAlert.message}</p>
                        <button
                            onClick={() => setSessionAlert(null)}
                            className={`
                                px-6 py-2 rounded-full text-white font-semibold shadow-md
                                transition-colors duration-200
                                ${sessionAlert.type === 'info' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                                ${sessionAlert.type === 'success' ? 'bg-green-500 hover:bg-green-600' : ''}
                                ${sessionAlert.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                                ${sessionAlert.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''}
                            `}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {sessionTimer && (
                <div className="fixed bottom-4 right-4 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-full shadow-lg p-4 z-40 animate-pulse-fade-in">
                    <div className="flex items-center space-x-3">
                        <i className="bi bi-hourglass-split text-3xl"></i>
                        <div>
                            <p className="text-sm font-light">Next Session:</p>
                            <p className="text-lg font-bold">{sessionTimer.title}</p>
                            <p className="text-xl font-extrabold">
                                {sessionTimer.minutes.toString().padStart(2, '0')}:
                                {sessionTimer.seconds.toString().padStart(2, '0')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {sessions.length === 0 ? (
                <div className="text-center py-5">
                    <p className="lead text-muted">No sessions found. Create one to get started!</p>
                    <button
                        onClick={() => navigate('/my-sessions/new')}
                        className="btn btn-primary rounded-pill px-4 py-2 mt-3 shadow-sm"
                    >
                        <i className="bi bi-plus-circle me-2"></i> Create New Session
                    </button>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {sessions.map(session => (
                        <div key={session._id} className="col">
                            <div className="card h-100 shadow-sm border-0 rounded-lg transform transition duration-300 hover:scale-105">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title text-primary fw-bold mb-2">{session.title}</h5>
                                    <p className="card-text text-muted mb-1">
                                        <i className="bi bi-calendar me-1"></i>
                                        {new Date(session.sessionDate).toLocaleString()}
                                    </p>
                                    <p className="card-text text-muted mb-1">
                                        <i className="bi bi-hourglass me-1"></i>
                                        {session.durationMinutes} minutes
                                    </p>
                                    <p className="card-text text-muted mb-3">
                                        <i className="bi bi-tags me-1"></i>
                                        {session.tags && session.tags.length > 0 ? session.tags.join(', ') : 'No tags'}
                                    </p>
                                    <p className="card-text flex-grow-1">{session.content.substring(0, 100)}...</p>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <span className={`badge ${session.status === 'published' ? 'bg-success' : 'bg-info'} rounded-pill px-3 py-2`}>
                                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                        </span>
                                        <div className="btn-group">
                                            <button
                                                onClick={() => navigate(`/my-sessions/edit/${session._id}`)}
                                                className="btn btn-sm btn-outline-primary rounded-pill me-2"
                                                title="Edit Session"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                onClick={() => navigate(`/sessions/${session._id}`)}
                                                className="btn btn-sm btn-outline-info rounded-pill"
                                                title="View Session"
                                            >
                                                <i className="bi bi-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SessionScheduler;

