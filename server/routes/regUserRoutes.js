import express from "express";
import {
  listAllRegUsers,
  getOneRegUser,
  createRegUser,
  updateRegUser,
  deleteRegUser,
} from "../controllers/regUserController.js";

const regUserRouter = express.Router();

regUserRouter.get("/list-all", listAllRegUsers);
regUserRouter.get("/get/:id", getOneRegUser);
regUserRouter.post("/create", createRegUser);
regUserRouter.put("/update/:id", updateRegUser);
regUserRouter.delete("/delete/:id", deleteRegUser);

export default regUserRouter;
