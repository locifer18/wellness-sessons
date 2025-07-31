Wellness Session Scheduler
Project Overview
The Wellness Session Scheduler is a full-stack web application designed to help users create, manage, and share wellness sessions. It provides a personalized space for users to draft and publish their sessions, making them accessible to a wider audience. The application emphasizes user authentication, secure data management, and a clear, intuitive interface for content creation and discovery.

Features
User Authentication: Secure user registration and login functionality.

Session Creation & Management:

Users can create new wellness sessions with a title, content, tags, duration, and a specific date/time.

Auto-save functionality ensures progress is not lost while editing.

Sessions can be saved as drafts or published.

Draft & Published Sessions:

Users have a dedicated "My Sessions" page to view and manage their own sessions, distinguishing between drafts and published content.

Published sessions are visible on the public dashboard.

Public Dashboard: A central hub where all published wellness sessions from various users are displayed, allowing anyone to browse and view session details.

Session Details View: Dedicated pages for viewing the full details of both public and private sessions.

Responsive Design: The application is designed to be accessible and user-friendly across various devices (desktop, tablet, mobile).

Technologies Used
Frontend
React: A JavaScript library for building user interfaces.

React Router DOM: For declarative routing in React applications.

Axios: A promise-based HTTP client for making API requests.

Bootstrap: A popular CSS framework for responsive and mobile-first frontend development.

Tailwind CSS: A utility-first CSS framework for rapidly building custom designs.

date-fns: A modern JavaScript date utility library (used for date formatting/parsing).

debounce utility: For optimizing frequent function calls (e.g., auto-save).

Backend
Node.js: A JavaScript runtime built on Chrome's V8 JavaScript engine.

Express.js: A fast, unopinionated, minimalist web framework for Node.js.

MongoDB: A NoSQL database for storing session and user data.

Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.

JSON Web Tokens (JWT): For secure user authentication and authorization.

Bcrypt.js: For hashing passwords.

CORS: Middleware to enable Cross-Origin Resource Sharing.

Dotenv: To load environment variables from a .env file.

Setup Instructions
Follow these steps to get the project up and running on your local machine.

Prerequisites
Node.js (v14 or higher recommended)

npm (comes with Node.js)

MongoDB (running locally or accessible via a cloud service like MongoDB Atlas)

1. Clone the Repository
git clone <your-repository-url>
cd <your-project-folder>

2. Backend Setup
Navigate to the backend directory:

cd backend

Install backend dependencies:

npm install

Create a .env file in the backend directory with the following variables:

PORT=8080
MONGO_URI=mongodb://localhost:27017/wellness_scheduler # Or your MongoDB Atlas URI
JWT_SECRET=your_jwt_secret_key_here # Use a strong, random string

Start the backend server:

npm start
# or if you have nodemon installed globally:
# nodemon server.js

The backend server will run on http://localhost:8080.

3. Frontend Setup
Open a new terminal and navigate to the frontend directory:

cd ../frontend

Install frontend dependencies:

npm install

Start the frontend development server:

npm start

The frontend application will typically open in your browser at http://localhost:3000.

Usage
Register/Login: Upon first visiting the application, register a new account or log in with existing credentials.

Dashboard: Explore public wellness sessions created by other users.

My Sessions: Navigate to "My Sessions" to view your personal drafts and published sessions.

Create New Session: Click the "Create New Session" button to start drafting a new wellness session. Fill in all details, including title, content, tags, duration, and a specific date and time.

Save Draft: The application auto-saves your progress. You can also manually click "Save as Draft".

Publish Session: Once your session is complete and you're ready to share it, click "Publish Session". It will then appear on the public dashboard.

Edit/View Sessions: From "My Sessions", you can edit your drafts or view details of any of your sessions.

Folder Structure
.
├── backend/
│   ├── config/             # Database connection
│   ├── controllers/        # Logic for handling requests
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Mongoose schemas for data
│   ├── routes/             # API routes
│   └── server.js           # Main backend server file
├── frontend/
│   ├── public/             # Static assets (e.g., alram.wav)
│   ├── src/
│   │   ├── assets/         # Images, icons, etc.
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React Context for global state (e.g., Auth)
│   │   ├── pages/          # Main application pages
│   │   ├── utils/          # Utility functions (e.g., debounce)
│   │   └── App.js          # Main React application component
│   │   └── index.js        # React entry point
│   └── package.json        # Frontend dependencies
└── README.md

Contributing
Feel free to fork this repository, open issues, or submit pull requests.

License
This project is open-source and available under the MIT License.
