import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  perfilUsuario
} from "../controllers/userController.js";

import { proteger } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.get("/perfil", proteger, perfilUsuario);

export default router;
