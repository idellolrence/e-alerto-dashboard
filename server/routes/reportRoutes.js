import express from "express";
import mongoose from "mongoose";
import {
  listAllReports,
  getOneReport,
  createReport,
  updateReport,
  deleteReport,
  getReportAnalytics,
  getStatusAnalytics,
  getStatusCounts,
} from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.get("/list-all", listAllReports);
reportRouter.get("/get/:id", getOneReport);
reportRouter.post("/create", createReport);
reportRouter.put("/update/:id", updateReport);
reportRouter.delete("/delete/:id", deleteReport);
reportRouter.get("/analytics", getReportAnalytics);
reportRouter.get("/analytics/status", getStatusAnalytics);
reportRouter.get("/analytics/status-counts", getStatusCounts);
reportRouter.get("/image/:id", (req, res) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "reportImages",
  });
  bucket
    .openDownloadStream(new mongoose.Types.ObjectId(req.params.id))
    .pipe(res);
});

export default reportRouter;
