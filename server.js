import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import mqtt from "mqtt";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Models
import Sensor from "./models/sensorModel.js";
import Alerta from "./models/alertaModel.js";

// Rotas
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import alertaRoutes from "./routes/alertaRoutes.js";

// Conexão MongoDB
import connectDB from "./config/db.js";

dotenv.config();
const app = express();

// ===============================
// FIX __dirname (ESM)
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// CRIAR /uploads SE NÃO EXISTIR
// ===============================
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log("📁 Pasta /uploads criada automaticamente.");
}

// ===============================
// MIDDLEWARES
// ===============================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

// ===============================
// ROTAS
// ===============================
app.use("/api/sensores", sensorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/alertas", alertaRoutes);

// ===============================
// CONEXÃO MONGODB
// ===============================
connectDB();

// ===============================
// MQTT – ASSINANDO 10 SENSORES
// ===============================
const mqttClient = mqtt.connect(process.env.MQTT_BROKER);

mqttClient.on("connect", () => {
  console.log("✅ Conectado ao MQTT Broker:", process.env.MQTT_BROKER);

  mqttClient.subscribe("aegis/sensores/+/telemetria", (err) => {
    if (err) console.error("❌ Erro ao assinar tópicos:", err.message);
    else console.log("📡 Assinando: aegis/sensores/+/telemetria");
  });
});

// ===============================
// RECEBENDO TELEMETRIA
// ===============================
mqttClient.on("message", async (topic, message) => {
  try {
   
    const data = JSON.parse(message.toString());
    console.log("📩 Telemetria recebida:", topic, data);

    
    const parts = topic.split("/");
    const sensorId = Number(parts[2]); 

    // ===============================
    // SALVAR TELEMETRIA NO BANCO
    // ===============================
    const saved = await Sensor.create({
      sensorId,
      machine: data.machine,
      type: data.type,
      value: data.value,
      status: data.status,      
      minLimit: data.minLimit,
      warnLimit: data.warnLimit,
      maxLimit: data.maxLimit,
      timestamp: new Date(data.timestamp)
    });

    console.log(`📦 Telemetria salva: Sensor ${sensorId}: ${saved.value}`);

    // ===============================
    // ALERTAS AUTOMÁTICOS
    // ===============================       
    const alerta = {
      sensor: `Sensor ${sensorId}`,
      maquina: data.machine,
      status: data.status, 
      mensagem: "",
      tipo: data.type,
      valor: data.value,
      timestamp: new Date()
    };

    if (data.status === "CRITICA") {
      alerta.mensagem = `${data.type} CRÍTICA — acima do limite máximo!`;
    } 
    else if (data.status === "MEDIA") {
      alerta.mensagem = `${data.type} em ALERTA — acima do limite de atenção.`;
    } 
    else {
      alerta.mensagem = `${data.type} normalizada.`;
    }

   
    await Alerta.create(alerta);

    console.log(`🚨 Alerta registrado: Sensor ${sensorId} — ${data.status}`);

  } catch (error) {
    console.error("❌ Erro ao processar MQTT:", error);
  }
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🌍 Servidor rodando na porta ${PORT}`)
);
