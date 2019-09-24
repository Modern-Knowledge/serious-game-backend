import express from "express";
import { Request, Response } from "express";
import { UserFacade } from "../db/entity/user/UserFacade";
import logger from "../util/logger";
import * as jwt from "jsonwebtoken";
import { PatientFacade } from "../db/entity/user/PatientFacade";
const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  res.jsonp("UserController");
});
router.get("/", async (req: Request, res: Response) => {
  const patientFacade = new PatientFacade();
  const patients = await patientFacade.get();
  res.status(200).jsonp(patients);
});

export default router;
