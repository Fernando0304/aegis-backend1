import mongoose from "mongoose";

const dashboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Dashboard", dashboardSchema);
