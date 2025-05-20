// backend/models/activityLogsModel.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employees",
      required: true,
    },
    employeeName: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
    newValue: { type: mongoose.Schema.Types.Mixed, default: null },
    ipAddress: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.activitylogs ||
  mongoose.model("activitylogs", activityLogSchema);
