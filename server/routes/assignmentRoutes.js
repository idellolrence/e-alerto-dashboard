// routes/assignmentRoutes.js
import express from "express";
import {
  listAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  uploadSiteReport,
} from "../controllers/assignmentController.js";
import userAuth from "../middleware/userAuth.js";

const assignmentRouter = express.Router();

assignmentRouter.get("/list-all", userAuth, listAllAssignments);
assignmentRouter.post("/create", userAuth, createAssignment);
assignmentRouter.put("/update/:id", userAuth, updateAssignment);
assignmentRouter.delete("/delete/:id", userAuth, deleteAssignment);
assignmentRouter.post("/upload-report/:id", userAuth, uploadSiteReport); // New endpoint for PDF upload

export default assignmentRouter;
