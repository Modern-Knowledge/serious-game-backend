import express from "express";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { Therapist } from "../lib/models/Therapist";
import { TherapistsPatientsFacade } from "../db/entity/user/TherapistsPatientsFacade";
import { Status } from '../lib/enums/Status';
const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  res.jsonp("UserController");
});
router.get("/", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  const therapists = await therapistFacade.get();
  res.status(200).jsonp(therapists);
});
router.post("/", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  const therapist = new Therapist().deserialize(req.body);
  therapist.status = Status.ACTIVE;
  therapist.failedLoginAttempts = 0;
  const response = await therapistFacade.insertTherapist(therapist);
  const token = jwt.sign(
    { id: response.id, email: response.email },
    process.env.SECRET_KEY,
    {
      expiresIn: 3600 // expires in 1 hour
    }
  );
  res.status(201).jsonp({ auth: true, token: token, user: response });
});
router.put("/:id", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  const therapistPatientsFacade = new TherapistsPatientsFacade();
  const therapist = new Therapist().deserialize(req.body);
  const response = await therapistFacade.updateTherapist(therapist);
  res.status(200).jsonp(response);
});


export default router;
