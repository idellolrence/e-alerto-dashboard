import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import regUserRouter from "./routes/regUserRoutes.js";
import reportRouter from "./routes/reportRoutes.js";
import assignmentRouter from "./routes/assignmentRoutes.js";
import activityLogsRouter from "./routes/activityLogsRoutes.js";
import path from "path";
import feedbackRouter from "./routes/feedbackRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API Endpoints
app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/reguser", regUserRouter);
app.use("/api/reports", reportRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/activitylogs", activityLogsRouter);
app.use("/api/feedback", feedbackRouter);

app.listen(port, () => console.log(`Server started on PORT:${port}`));
