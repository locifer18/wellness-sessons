import express from 'express';
import { requireSignIn } from "../middleware/authMiddleware.js";
import {
  loginController,
  registerController,
} from '../controllers/authController.js';

const router = express.Router();

// REGISTER || POST
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);

// PROTECTED USER ROUTE || GET
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

export default router;