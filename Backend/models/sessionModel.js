import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'users', // This tells Mongoose which model to use during population
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true, // Removes whitespace from both ends of a string
    },
    tags: {
        type: [String], // Array of strings
        default: [], // Default to an empty array if no tags are provided
    },
    content: { // Storing the URL to the JSON file
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published'], // Only allows 'draft' or 'published'
        default: 'draft', // New sessions are drafts by default
        required: true,
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

export default mongoose.model("sessions", sessionSchema);