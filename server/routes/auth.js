// server/routes/auth.js
import express from "express";
import { loginAdmin, registerAdmin } from "../controllers/authController.js";

const router = express.Router();

// Login e registro
router.post("/login", loginAdmin);
router.post("/register", registerAdmin);

export default router;
