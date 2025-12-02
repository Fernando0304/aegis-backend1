import mongoose from "mongoose";

const SensorSchema = new mongoose.Schema({
  sensorId: {
    type: Number,
    required: true
  },
  machine: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  status: { 
    type: String,
    enum: ["NORMAL", "MEDIA", "CRITICA"],
    required: true
  },
  minLimit: Number,
  warnLimit: Number,
  maxLimit: Number,
  timestamp: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Sensor", SensorSchema);
