import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportID: { type: String, required: true },
  classification: { type: String, required: true },
  measurement: { type: String },
  location: { type: String, required: true },
  status: { type: String, default: "Submitted" },
  username: { type: String },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
  image_file: { type: String, required: true }, // base64
});

const reportModel = mongoose.models.reports || mongoose.model("reports", reportSchema);

export default reportModel;