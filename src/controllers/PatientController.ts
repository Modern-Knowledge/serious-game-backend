import express from "express";
import { Request, Response } from "express";
import { PatientFacade } from "../db/entity/user/PatientFacade";
import { Patient } from '../lib/models/Patient';
import { Status } from '../lib/enums/Status';
import { JWTHelper } from '../util/JWTHelper';
const router = express.Router();

/**
 * GET /
 * Get patient by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  res.jsonp("UserController");
});

/**
 * GET /
 * Get all patients.
 */
router.get("/", async (req: Request, res: Response) => {
  const patientFacade = new PatientFacade();
  try{
    const patients = await patientFacade.get();
    return res.status(200).jsonp(patients);
  }
  catch(error) {
    return res.status(500).jsonp(error);
  }
  
});

/**
 * POST /
 * Insert a patient.
 */
router.post("/", async (req: Request, res: Response) => {
  const patientFacade = new PatientFacade();
  const patient = new Patient().deserialize(req.body);
  patient.status = Status.ACTIVE;
  patient.failedLoginAttempts = 0;
  try{
    const response = await patientFacade.insertPatient(patient);
    const jwtHelper: JWTHelper = new JWTHelper();
    const token = await jwtHelper.signToken(response);
    return res.status(201).jsonp({ auth: true, token: token, user: response });
  }
  catch(error) {
    return res.status(500).jsonp(error);
  }
});

export default router;
