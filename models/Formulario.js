import mongoose from "mongoose";

const formularioSchema = mongoose.Schema(
  {
    alertaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alerta",
      required: true
    },
    responsavel: { type: String, required: true },
    falha: { type: String, required: true },
    descricao: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Formulario", formularioSchema);
