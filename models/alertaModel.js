import mongoose from "mongoose";

const alertaSchema = mongoose.Schema(
  {
    tipo: {
      type: String, 
      required: true,
    },
    mensagem: { type: String, required: true },
    valor: { type: Number, required: true },
    sensor: { type: String, required: true },
    maquina: { type: String, required: true }, 
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);


const Alerta = mongoose.model("Alerta", alertaSchema);
export default Alerta;
