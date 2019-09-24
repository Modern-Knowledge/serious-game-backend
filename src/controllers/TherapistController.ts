import express from "express";
import { Request, Response } from "express";
import { UserFacade } from "../db/entity/user/UserFacade";
import logger from "../util/logger";
import * as jwt from "jsonwebtoken";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { Therapist } from "../lib/models/Therapist";
import { TherapistsPatientsFacade } from "../db/entity/user/TherapistsPatientsFacade";
import { SQLValueAttributes } from "../db/sql/SQLValueAttributes";
const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  res.jsonp("UserController");
});
router.get("/", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  const therapists = await therapistFacade.get();
  res.status(200).jsonp(therapists);
});
router.put("/:id", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  const therapistPatientsFacade = new TherapistsPatientsFacade();
  const therapist = new Therapist().deserialize(req.body);
  const response = await therapistFacade.updateTherapist(therapist);
  res.status(200).jsonp(response);
});

export default router;
