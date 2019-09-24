import express from "express";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { Therapist } from "../lib/models/Therapist";
import { TherapistsPatientsFacade } from "../db/entity/user/TherapistsPatientsFacade";
import { Status } from '../lib/enums/Status';
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
  try{
    const therapists = await therapistFacade.get();
    return res.status(200).jsonp(therapists);
  }
  catch(error) {
    return res.status(500).jsonp(error);
  }
  
});

/**
 * GET /
 * Insert a therapist.
 */
router.post("/", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  const therapist = new Therapist().deserialize(req.body);
  therapist.status = Status.ACTIVE;
  therapist.failedLoginAttempts = 0;
  try{
    const response = await therapistFacade.insertTherapist(therapist);
    const token = jwt.sign(
      { id: response.id, email: response.email },
      process.env.SECRET_KEY,
      {
        expiresIn: 3600 // expires in 1 hour
      }
    );
    return res.status(201).jsonp({ auth: true, token: token, user: response });
  }
  catch(error) {
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
  try{
    const response = await therapistFacade.updateTherapist(therapist);
    return res.status(200).jsonp(response);
  }
  catch(error) {
    return res.status(500).jsonp(error);
  }
});


export default router;
