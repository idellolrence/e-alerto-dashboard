// backend/routes/activityLogsRoutes.js
import express from "express";
import {
  listAllLogs,
  createLog,
  purgeLogs,
} from "../controllers/activityLogsController.js";
import userAuth from "../middleware/userAuth.js";

const activityLogsRouter = express.Router();

activityLogsRouter.get("/list-all", userAuth, listAllLogs);
activityLogsRouter.post("/create", userAuth, createLog);
activityLogsRouter.post( "/purge",    userAuth, purgeLogs);   // ← new

export default activityLogsRouter;
