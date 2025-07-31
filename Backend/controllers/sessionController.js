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

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required.' });
        }

        // Find the session by ID and ensure its status is 'published'
        const session = await Session.findOne({ _id: sessionId, status: 'published' });

        if (!session) {
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
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
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
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
        const sessionId = req.params.id;
        const session = await Session.findOne({
            _id: sessionId,
            userId: req.user.id
        });

        if (!session) {
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

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and Content are required' });
    }

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
        let session;
        if (id) {
            session = await Session.findOne({ _id: id, userId: req.user.id });

            if (!session) {
                return res.status(404).json({ message: 'Session not found or you do not have access to it' });
            }

            session.title = title;
            session.tags = tags || [];
            session.content = content;
            session.status = 'draft';

            await session.save();
            res.status(200).json({ message: 'Draft updated successfully', session });
        } else {
            session = new Session({
                userId: req.user.id,
                title,
                tags: tags || [],
                content,
                status: 'draft',
            });
            await session.save();
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

    if (!id) {
        return res.status(400).json({ message: 'Session ID is required to publish' });
    }
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
        const session = await Session.findOne({ _id: id, userId: req.user.id });

        if (!session) {
            return res.status(404).json({ message: 'Session not found or you do not have access to publish it' });
        }

        if (session.status === 'draft') {
            session.status = 'published';
            await session.save();
            res.status(200).json({ message: 'Session published successfully', session });
        } else {
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
        return res.status(401).json({ message: 'Not authorized, user ID missing from token.' });
    }

    try {
        const sessionId = req.params.id;


        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required for deletion.' });
        }

        const result = await Session.deleteOne({ _id: sessionId, userId: req.user.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Session not found or you do not have permission to delete it.' });
        }

        res.status(200).json({ message: 'Session deleted successfully.' });

    } catch (error) {
        console.error("deleteSession: Error in try-catch block:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid session ID format.' });
        }
        res.status(500).json({ message: 'Server Error during session deletion.' });
    }
};
