import express from "express";
import { Request, Response } from "express";
import { JWTHelper } from "../util/JWTHelper";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { Therapist } from "../lib/models/Therapist";
import { TherapistsPatientsFacade } from "../db/entity/user/TherapistsPatientsFacade";
import { Status } from "../lib/enums/Status";
import { TherapistPatient } from "../lib/models/TherapistPatient";
import { Patient } from "../lib/models/Patient";
import logger from "../util/logger";
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";
const router = express.Router();

/**
 * GET /
 * Get a therapist by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  res.jsonp("UserController");
});

/**
 * GET /
 * Get all therapists.
 */
router.get("/", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  try {
    const therapists = await therapistFacade.get();
    return res.status(200).jsonp(therapists);
  } catch (error) {
    return res.status(500).jsonp(error);
  }
});

/**
 * POST /
 * Insert a therapist.
 */
router.post("/", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  const therapist = new Therapist().deserialize(req.body);
  therapist.status = Status.ACTIVE;
  therapist.failedLoginAttempts = 0;
  try {
    const response = await therapistFacade.insertTherapist(therapist);
    const jwtHelper: JWTHelper = new JWTHelper();
    const token = await jwtHelper.signToken(response);
    return res.status(201).jsonp({ auth: true, token: token, user: response });
  } catch (error) {
    return res.status(500).jsonp(error);
  }
});

/**
 * PUT /
 * Update a therapist by id.
 */
router.put("/:id", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  const therapistPatientsFacade = new TherapistsPatientsFacade();

  const therapist = new Therapist().deserialize(req.body);
  try {
    const therapistPatient = new TherapistPatient();
    therapistPatient.therapistId = therapist.id;
    await therapistPatientsFacade.syncPatients(therapistPatient);

    for (const patient of therapist.patients) {
      therapistPatient.patientId = patient.id;
      await therapistPatientsFacade.insertTherapistPatient(therapistPatient);
    }
    const filter = therapistFacade.filter;
    filter.addFilterCondition(
      "therapist_id",
      therapist.id,
      SQLComparisonOperator.EQUAL
    );
    await therapistFacade.updateTherapist(therapist);
    return res.status(200).jsonp(therapist);
  } catch (error) {
    return res.status(500).jsonp(error);
  }
});

export default router;
