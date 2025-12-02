import express from "express";
import { listarAlertas, enviarFormulario } from "../controllers/alertaController.js";
import { proteger } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", proteger, listarAlertas);


router.post("/:id/form", proteger, enviarFormulario);

export default router;
