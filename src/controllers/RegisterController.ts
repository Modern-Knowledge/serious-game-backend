import express from "express";
import { Request, Response } from "express";
import {TherapistFacade} from "../db/entity/user/TherapistFacade";
import { Therapist } from '../lib/models/Therapist';
import { Status } from '../lib/enums/Status';
import * as bcrypt from "bcryptjs";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { body: {_email, _password, _forename, _lastname} } = req;
  const therapistFacade = new TherapistFacade();
  const therapist = new Therapist();
  therapist.email = _email;
  therapist.password = bcrypt.hashSync(_password, 8);
  therapist.forename = _forename;
  therapist.lastname = _lastname;
  therapist.status = Status.ACTIVE;
  const response = await therapistFacade.insertTherapist(therapist);
  res.status(201).jsonp(response);
});

export default router;
