import express from "express";
import {
  listarSensores,
  obterSensorPorId,
  obterSensorHistorico,
  sensoresCriticos,
  criarSensor,
  atualizarSensor,
  deletarSensor
} from "../controllers/sensorController.js";

const router = express.Router();

// Última leitura de todos os sensores
router.get("/", listarSensores);

// Última leitura do sensor
router.get("/:id", obterSensorPorId);

// Histórico (últimas 50 leituras)
router.get("/:id/historico", obterSensorHistorico);

// Críticos
router.get("/status/criticos", sensoresCriticos);

// CRUD (compatibilidade)
router.post("/", criarSensor);
router.put("/:id", atualizarSensor);
router.delete("/:id", deletarSensor);

export default router;
