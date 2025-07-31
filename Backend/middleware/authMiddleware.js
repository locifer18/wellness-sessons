import JWT from "jsonwebtoken";

// Protected Routes token base
export const requireSignIn = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in 'x-auth-token' header (as set by your frontend's Axios defaults)
    if (req.header('x-auth-token')) {
      token = req.header('x-auth-token');
    }
    // 2. Fallback: Check for token in 'Authorization' header (common for 'Bearer TOKEN' format)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // Extract token after 'Bearer '
    }

    // If no token found in either place
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify the token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // Assuming your JWT payload contains a property named 'id' for the user's ID
    // Example payload when signing: { id: user._id }
    if (!decoded || !decoded.id) {
        return res.status(401).json({ message: 'Token is valid but user ID is missing from payload.' });
    }

    // Attach the decoded user ID to the request object
    // This is what your controllers (like saveDraftSession) will access as req.user.id
    req.user = { id: decoded.id };

    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token, authorization denied.' });
    }
    // Generic error for other issues
    res.status(500).json({ message: 'Server Error during authentication.' });
  }
};

export default requireSignIn;
