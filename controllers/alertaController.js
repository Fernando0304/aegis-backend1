// controllers/alertaController.js (substitua apenas a função listarAlertas)
import Alerta from "../models/alertaModel.js";
import Formulario from "../models/Formulario.js"; // deixe como está se o arquivo existir

export const listarAlertas = async (req, res) => {
  try {
    // logs iniciais para debug
    console.log("➡️ listarAlertas called with query:", req.query);

    // Aceita tanto ?periodo= quanto ?period= (robustez)
    const {
      maquina,
      sensor,
      sensorType,
      status,
      busca,
      page = 1,
      limit = 10,
    } = req.query;

    // leitura segura do periodo (evita ReferenceError se nome chegar diferente)
    const periodo = req.query.periodo ?? req.query.period ?? null;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filtros = {};
    if (maquina) filtros.maquina = maquina;
    if (sensor) filtros.sensor = sensor;
    if (sensorType) filtros.type = sensorType;
    if (status) filtros.status = status;

    // FILTRO POR PERÍODO (uso seguro do periodo)
    if (periodo) {
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
          const fimOntem = new Date(inicio);
          fimOntem.setHours(23, 59, 59, 999);
          filtros.timestamp = { $gte: inicio, $lte: fimOntem };
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
          console.log("⚠️ listarAlertas: periodo desconhecido:", periodo);
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
      Alerta.find(filtros)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum),
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
    console.error("Erro listar alertas - stack:", erro.stack);
    return res.status(500).json({
      erro: "Erro ao listar alertas.",
      detail: erro.message, // temporário só para debug no Postman; remova em produção se quiser
    });
  }
};
