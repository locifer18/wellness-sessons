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

import { requireSignIn } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/sessions', getPublicSessions); // Get all published sessions
router.get('/sessions/:id', getPublicSessionById); // New: Get a single published session by ID (public)

// Protected routes (require authentication)
router.get('/my-sessions', requireSignIn, getMySessions);
router.get('/my-sessions/:id', requireSignIn, getSingleMySession); // This is for owner's private view/edit
router.post('/my-sessions/save-draft', requireSignIn, saveDraftSession);
router.post('/my-sessions/publish', requireSignIn, publishSession);
router.delete('/my-sessions/:id', requireSignIn, deleteSession);

export default router;
