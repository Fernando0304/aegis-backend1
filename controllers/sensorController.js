// controllers/sensorController.js
import Sensor from "../models/sensorModel.js";

/*
==========================================================
 LISTAR ÚLTIMA LEITURA DE CADA SENSOR
==========================================================
*/
export const listarSensores = async (req, res) => {
  try {
    const sensores = await Sensor.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$sensorId",
          sensorId: { $first: "$sensorId" },
          machine: { $first: "$machine" },
          type: { $first: "$type" },
          value: { $first: "$value" },
          status: { $first: "$status" },
          minLimit: { $first: "$minLimit" },
          warnLimit: { $first: "$warnLimit" },
          maxLimit: { $first: "$maxLimit" },
          timestamp: { $first: "$timestamp" }
        }
      },
      { $sort: { sensorId: 1 } }
    ]);

    res.json(sensores);
  } catch (err) {
    res.status(500).json({ message: "Erro ao listar sensores" });
  }
};

/*
==========================================================
 HISTÓRICO DE UM SENSOR (últimas 50 leituras)
==========================================================
*/
export const obterSensorHistorico = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const historico = await Sensor.find({ sensorId: id })
      .sort({ timestamp: -1 })
      .limit(50);

    if (!historico.length)
      return res.status(404).json({ message: "Sensor não encontrado" });

    res.json(historico);
  } catch (err) {
    res.status(500).json({ message: "Erro ao obter sensor" });
  }
};

/*
==========================================================
 PEGAR APENAS A ÚLTIMA LEITURA (para SensorDetalhe)
==========================================================
*/
export const obterSensorPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const sensor = await Sensor.findOne({ sensorId: id }).sort({ timestamp: -1 });

    if (!sensor)
      return res.status(404).json({ message: "Sensor não encontrado" });

    res.json(sensor);
  } catch (err) {
    res.status(500).json({ message: "Erro ao obter sensor" });
  }
};

/*
==========================================================
 SENSORES CRÍTICOS
==========================================================
*/
export const sensoresCriticos = async (req, res) => {
  try {
    const criticos = await Sensor.aggregate([
      { $match: { status: "CRITICA" } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$sensorId",
          sensorId: { $first: "$sensorId" },
          value: { $first: "$value" },
          machine: { $first: "$machine" },
          type: { $first: "$type" },
          timestamp: { $first: "$timestamp" }
        }
      }
    ]);

    res.json(criticos);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar sensores críticos" });
  }
};

/*
==========================================================
 CRIAR SENSOR (APENAS PARA COMPATIBILIDADE - NÃO USADO)
==========================================================
*/
export const criarSensor = async (req, res) => {
  try {
    const novo = await Sensor.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ message: "Erro ao criar sensor" });
  }
};

/*
==========================================================
 ATUALIZAR SENSOR (COMPATIBILIDADE)
==========================================================
*/
export const atualizarSensor = async (req, res) => {
  try {
    const atualizado = await Sensor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ message: "Erro ao atualizar sensor" });
  }
};

/*
==========================================================
 DELETAR SENSOR (COMPATIBILIDADE)
==========================================================
*/
export const deletarSensor = async (req, res) => {
  try {
    await Sensor.findByIdAndDelete(req.params.id);
    res.json({ message: "Sensor removido" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao excluir sensor" });
  }
};
