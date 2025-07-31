// C:\Users\Hp\OneDrive\PROJECTS\Internship Arvyax\Backend\controllers\authController.js

import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js"; // Renamed from 'user' to 'userModel' to avoid collision

// Register User
export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body;

        // Validation
        if (!name) return res.status(400).send({ success: false, message: "Name is Required" });
        if (!email) return res.status(400).send({ success: false, message: "Email is Required" });
        if (!password) return res.status(400).send({ success: false, message: "Password is Required" });

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "Already Registered. Please login.",
            });
        }

        // Register user
        const hashedPassword = await hashPassword(password);
        const newUser = await new userModel({
            name,
            email,
            password: hashedPassword, // Store hashed password
        }).save();

        res.status(201).send({
            success: true,
            message: "User Registered Successfully",
            user: { // Only send necessary user info back
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });

    } catch (error) {
        console.error("Error in Register Controller:", error); // Use console.error for errors
        res.status(500).send({
            success: false,
            message: "Error in Register Controller",
            error: error.message, // Send specific error message
        });
    }
};

// Login User
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: "Email and password are required"
            });
        }

        // Check user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email is not registered"
            });
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).send({
                success: false,
                message: "Invalid password"
            });
        }

        // Update last login time (optional, but good practice)
        user.lastLogin = new Date();
        await user.save();

        // Generate Token - IMPORTANT: Use 'id' as the key in the payload for consistency with authMiddleware
        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).send({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token, // Send the token to the frontend
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send({
            success: false,
            message: "Error during login",
            error: error.message,
        });
    }
};

