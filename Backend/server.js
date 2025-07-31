import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Assuming you have a db connection file
import authRoutes from './routes/authRoutes.js'; // Your authentication routes
import sessionRoutes from './routes/sessionRoutes.js'; // Your new session routes
import morgan from "morgan";

dotenv.config(); // Load environment variables
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Body parser for JSON requests
app.use(morgan("dev"));

// Define Routes
// Use your authentication routes
app.use('/api/auth', authRoutes);
// Use your new session routes
app.use('/api', sessionRoutes); // Note: /api is the base for session routes like /api/sessions, /api/my-sessions

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 8080; // Ensure this matches your frontend's API_URL port

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.bgCyan.white);
});
