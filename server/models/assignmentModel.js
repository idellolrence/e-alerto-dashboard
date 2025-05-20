// models/assignmentModel.js
import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reports",
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    // New fields for completion workflow
    siteInspectionReport: {
      type: String,
      default: null,
    },
    originalFileName: {
      type: String,
      default: null,
    },
    accomplishmentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Assignment =
  mongoose.models.assignments ||
  mongoose.model("assignments", assignmentSchema);
export default Assignment;
