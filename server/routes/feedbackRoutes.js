import express from "express";
import { listAllFeedback } from "../controllers/feedbackController.js";

const feedbackRouter = express.Router();

feedbackRouter.get("/list-all", listAllFeedback);

export default feedbackRouter;
