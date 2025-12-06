// controllers/alertaController.js
import mongoose from "mongoose";
import Alerta from "../models/alertaModel.js";
import Formulario from "../models/Formulario.js";

const PERIODOS_VALIDOS = ["hoje", "ontem", "7dias", "30dias"];

// ==========================
// LISTAR ALERTAS COM FILTROS
// ==========================
export const listarAlertas = async (req, res) => {
  try {
    // leitura segura do periodo (pode vir por query ou params)
    const periodoRaw = req.query?.periodo ?? req.params?.periodo ?? null;
    const periodo = typeof periodoRaw === "string" ? periodoRaw.trim().toLowerCase() : null;

    const {
      maquina,
      sensor,
      sensorType,
      status,
      busca,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filtros = {};

    if (maquina) filtros.maquina = maquina;
    if (sensor) filtros.sensor = sensor;
    if (sensorType) filtros.type = sensorType;
    if (status) filtros.status = status;

    // FILTRO POR PERÍODO — aplica apenas se periodo for um valor válido
    if (periodo && PERIODOS_VALIDOS.includes(periodo)) {
      const agora = new Date();
      const inicio = new Date();

      switch (periodo) {
        case "hoje":
          inicio.setHours(0, 0, 0, 0);
          filtros.timestamp = { $gte: inicio };
          break;
        case "ontem":
          inicio.setDate(inicio.getDate() - 1);
          inicio.setHours(0, 0, 0, 0);
          {
            const fimOntem = new Date(inicio);
            fimOntem.setHours(23, 59, 59, 999);
            filtros.timestamp = { $gte: inicio, $lte: fimOntem };
          }
          break;
        case "7dias":
          inicio.setDate(inicio.getDate() - 7);
          filtros.timestamp = { $gte: inicio };
          break;
        case "30dias":
          inicio.setDate(inicio.getDate() - 30);
          filtros.timestamp = { $gte: inicio };
          break;
        default:
          break;
      }
    }

    // BUSCA GERAL
    if (busca) {
      filtros.$or = [
        { mensagem: { $regex: busca, $options: "i" } },
        { sensor: { $regex: busca, $options: "i" } },
        { maquina: { $regex: busca, $options: "i" } },
      ];
    }

    const [alertas, total] = await Promise.all([
      Alerta.find(filtros).sort({ timestamp: -1 }).skip(skip).limit(limitNum),
      Alerta.countDocuments(filtros),
    ]);

    const ativos = await Alerta.countDocuments({
      tipo: { $in: ["alerta", "critico"] },
    });

    return res.json({
      alertas,
      total,
      ativos,
      paginas: Math.ceil(total / limitNum),
      page: pageNum,
      limit: limitNum,
    });
  } catch (erro) {
    console.error("Erro listar alertas:", erro);
    return res.status(500).json({ erro: "Erro ao listar alertas.", detail: erro.message });
  }
};

// ==============================
// ENVIAR FORMULÁRIO DE MANUTENÇÃO
// ==============================
export const enviarFormulario = async (req, res) => {
  try {
    const { responsavel, falha, descricao } = req.body;
    const alertaId = req.params.id;

    if (!responsavel || !falha || !descricao) {
      return res.status(400).json({ message: "Preencha todos os campos." });
    }

    if (!mongoose.isValidObjectId(alertaId)) {
      return res.status(400).json({ message: "ID do alerta inválido." });
    }

    const alertaExistente = await Alerta.findById(alertaId).select("_id");
    if (!alertaExistente) {
      return res.status(404).json({ message: "Alerta não encontrado." });
    }

    const form = await Formulario.create({
      alertaId,
      responsavel,
      falha,
      descricao,
    });

    return res.status(201).json({
      message: "Formulário enviado com sucesso!",
      form,
    });
  } catch (erro) {
    console.error("Erro ao enviar formulário:", erro);
    return res.status(500).json({ erro: "Erro ao enviar formulário." });
  }
};
