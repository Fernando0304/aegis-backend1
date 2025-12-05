// controllers/alertaController.js
import mongoose from "mongoose";
import Alerta from "../models/alertaModel.js";
import Formulario from "../models/Formulario.js";

// ==========================
// LISTAR ALERTAS COM FILTROS (SEM FILTRO 'periodo')
// ==========================
export const listarAlertas = async (req, res) => {
  try {
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

    // ======= (REMOVIDO) filtro por periodo =======
    // O filtro 'periodo' foi removido do backend conforme solicitado.

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

    // valida formato do id (evita exceptions do mongoose)
    if (!mongoose.isValidObjectId(alertaId)) {
      return res.status(400).json({ message: "ID do alerta inválido." });
    }

    // opcional: checar se o alerta existe
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
