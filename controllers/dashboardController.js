import Sensor from "../models/sensorModel.js";
import Alerta from "../models/alertaModel.js";

export const getDashboard = async (req, res) => {
  try {
    const totalAlertas = await Alerta.countDocuments();

    const alertasRecentes = await Alerta
      .find()
      .sort({ timestamp: -1 })
      .limit(5);

    const sensoresCriticos = await Sensor.find({ status: "CRITICA" })
      .sort({ timestamp: -1 })
      .limit(5);

    const ultimosSensores = await Sensor.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$sensorId",
          sensorId: { $first: "$sensorId" },
          machine: { $first: "$machine" },
          type: { $first: "$type" },
          value: { $first: "$value" },
          status: { $first: "$status" },
          timestamp: { $first: "$timestamp" }
        }
      },
      { $sort: { sensorId: 1 } }
    ]);

    res.json({
      totalAlertas,
      alertasRecentes,
      sensoresCriticos,
      ultimosSensores
    });

  } catch (err) {
    res.status(500).json({ message: "Erro ao gerar dashboard", error: err });
  }
};
