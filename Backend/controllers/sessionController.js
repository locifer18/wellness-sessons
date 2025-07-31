// C:\Users\Hp\OneDrive\PROJECTS\Internship Arvyax\Backend\controllers\sessionController.js

import Session from '../models/sessionModel.js';

// @desc    Get all public wellness sessions
// @route   GET /api/sessions
// @access  Public
export const getPublicSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ status: 'published' }).sort({ createdAt: -1 });
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error fetching public sessions:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single public (published) session by ID
// @route   GET /api/sessions/:id
// @access  Public
export const getPublicSessionById = async (req, res) => {
    try {
        const sessionId = req.params.id;
        console.log("getPublicSessionById: Attempting to fetch public session with ID:", sessionId);

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required.' });
        }

        // Find the session by ID and ensure its status is 'published'
        const session = await Session.findOne({ _id: sessionId, status: 'published' });

        if (!session) {
            console.log(`getPublicSessionById: Public session with ID ${sessionId} not found or not published.`);
            return res.status(404).json({ message: 'Public session not found or not available.' });
        }

        res.status(200).json(session);
    } catch (error) {
        console.error("Error fetching public session by ID:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid session ID format.' });
        }
        res.status(500).json({ message: 'Server Error.' });
    }
};


// @desc    Get user's own sessions (draft + published)
// @route   GET /api/my-sessions
// @access  Private
export const getMySessions = async (req, res) => {
    if (!req.user || !req.user.id) {
        console.log("getMySessions: Authorization failed - req.user.id is missing.");
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
        console.log("getMySessions: Fetching sessions for userId:", req.user.id);
        const sessions = await Session.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error fetching user's sessions:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    View a single user session (private view for owner)
// @route   GET /api/my-sessions/:id
// @access  Private
export const getSingleMySession = async (req, res) => {
    if (!req.user || !req.user.id) {
        console.log("getSingleMySession: Authorization failed - req.user.id is missing.");
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
        const sessionId = req.params.id;
        console.log("getSingleMySession: Fetching session ID:", sessionId, "for userId:", req.user.id);
        const session = await Session.findOne({
            _id: sessionId,
            userId: req.user.id
        });

        if (!session) {
            console.log(`getSingleMySession: Session ${sessionId} not found or does not belong to user ${req.user.id}`);
            return res.status(404).json({ message: 'Session not found or you do not have access to it' });
        }

        res.status(200).json(session);
    } catch (error) {
        console.error("Error fetching single session:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid session ID format' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Save or update a draft session
// @route   POST /api/my-sessions/save-draft
// @access  Private
export const saveDraftSession = async (req, res) => {
    const { id, title, tags, content } = req.body;

    console.log("saveDraftSession: Incoming request body:", req.body);
    console.log("saveDraftSession: Authenticated User ID (req.user.id):", req.user?.id);

    if (!title || !content) {
        console.log("saveDraftSession: Validation failed - Missing title or content");
        return res.status(400).json({ message: 'Title and Content are required' });
    }

    if (!req.user || !req.user.id) {
        console.log("saveDraftSession: Authorization failed - req.user.id is missing.");
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
        let session;
        if (id) {
            console.log(`saveDraftSession: Attempting to update existing session with ID: ${id} for userId: ${req.user.id}`);
            session = await Session.findOne({ _id: id, userId: req.user.id });

            if (!session) {
                console.log(`saveDraftSession: Session with ID ${id} not found or doesn't belong to user ${req.user.id}`);
                return res.status(404).json({ message: 'Session not found or you do not have access to it' });
            }

            session.title = title;
            session.tags = tags || [];
            session.content = content;
            session.status = 'draft';

            await session.save();
            console.log("saveDraftSession: Session updated successfully:", session);
            res.status(200).json({ message: 'Draft updated successfully', session });
        } else {
            console.log("saveDraftSession: Attempting to create new session for userId:", req.user.id);
            session = new Session({
                userId: req.user.id,
                title,
                tags: tags || [],
                content,
                status: 'draft',
            });
            await session.save();
            console.log("saveDraftSession: New session created successfully:", session);
            res.status(201).json({ message: 'Draft created successfully', session });
        }
    } catch (error) {
        console.error("saveDraftSession: Error in try-catch block:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid session ID format' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Publish a session
// @route   POST /api/my-sessions/publish
// @access  Private
export const publishSession = async (req, res) => {
    const { id } = req.body;

    console.log("publishSession: Incoming request body:", req.body);
    console.log("publishSession: Authenticated User ID (req.user.id):", req.user?.id);

    if (!id) {
        return res.status(400).json({ message: 'Session ID is required to publish' });
    }
    if (!req.user || !req.user.id) {
        console.log("publishSession: Authorization failed - req.user.id is missing.");
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
        console.log(`publishSession: Attempting to publish session with ID: ${id} for userId: ${req.user.id}`);
        const session = await Session.findOne({ _id: id, userId: req.user.id });

        if (!session) {
            console.log(`publishSession: Session with ID ${id} not found or doesn't belong to user ${req.user.id}`);
            return res.status(404).json({ message: 'Session not found or you do not have access to publish it' });
        }

        if (session.status === 'draft') {
            session.status = 'published';
            await session.save();
            console.log("publishSession: Session published successfully:", session);
            res.status(200).json({ message: 'Session published successfully', session });
        } else {
            console.log("publishSession: Session is already published:", session);
            res.status(200).json({ message: 'Session is already published', session });
        }

    } catch (error) {
        console.error("publishSession: Error in try-catch block:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid session ID format' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a session
// @route   DELETE /api/my-sessions/:id
// @access  Private
export const deleteSession = async (req, res) => {
    if (!req.user || !req.user.id) {
        console.log("deleteSession: Authorization failed - req.user.id is missing.");
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
        const sessionId = req.params.id;

        console.log("deleteSession: Incoming session ID:", sessionId);
        console.log("deleteSession: Authenticated User ID (req.user.id):", req.user?.id);

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required for deletion.' });
        }

        console.log(`deleteSession: Attempting to delete session ${sessionId} for userId: ${req.user.id}`);
        const result = await Session.deleteOne({ _id: sessionId, userId: req.user.id });

        if (result.deletedCount === 0) {
            console.log(`deleteSession: Session ${sessionId} not found or does not belong to user ${req.user.id}`);
            return res.status(404).json({ message: 'Session not found or you do not have permission to delete it.' });
        }

        console.log(`deleteSession: Session ${sessionId} deleted successfully by user ${req.user.id}`);
        res.status(200).json({ message: 'Session deleted successfully.' });

    } catch (error) {
        console.error("deleteSession: Error in try-catch block:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid session ID format.' });
        }
        res.status(500).json({ message: 'Server Error during session deletion.' });
    }
};
