import express from "express";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { PatientFacade } from "../db/entity/user/PatientFacade";
import { Patient } from '../lib/models/Patient';
import { Status } from '../lib/enums/Status';
import logger from '../util/logger';
const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  res.jsonp("UserController");
});
router.get("/", async (req: Request, res: Response) => {
  const patientFacade = new PatientFacade();
  const patients = await patientFacade.get();
  res.status(200).jsonp(patients);
});
router.post("/", async (req: Request, res: Response) => {
  const patientFacade = new PatientFacade();
  const patient = new Patient().deserialize(req.body);
  patient.status = Status.ACTIVE;
  patient.failedLoginAttempts = 0;
  const response = await patientFacade.insertPatient(patient);
  const token = jwt.sign(
    { id: response.id, email: response.email },
    process.env.SECRET_KEY,
    {
      expiresIn: 3600 // expires in 1 hour
    }
  );
  res.status(201).jsonp({ auth: true, token: token, user: response });
});

export default router;
