// C:\Users\Hp\OneDrive\PROJECTS\Internship Arvyax\Backend\routes\sessionRoutes.js

import express from 'express';
import {
    getPublicSessions,
    getPublicSessionById, // Import the new public view function
    getMySessions,
    getSingleMySession,
    saveDraftSession,
    publishSession,
    deleteSession
} from '../controllers/sessionController.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/sessions', getPublicSessions); // Get all published sessions
router.get('/sessions/:id', getPublicSessionById); // New: Get a single published session by ID (public)

// Protected routes (require authentication)
router.get('/my-sessions', protect, getMySessions);
router.get('/my-sessions/:id', protect, getSingleMySession); // This is for owner's private view/edit
router.post('/my-sessions/save-draft', protect, saveDraftSession);
router.post('/my-sessions/publish', protect, publishSession);
router.delete('/my-sessions/:id', protect, deleteSession);

export default router;
