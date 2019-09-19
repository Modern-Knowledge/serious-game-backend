import express from "express";
import { Request, Response } from "express";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { Therapist } from "../lib/models/Therapist";
import { Status } from "../lib/enums/Status";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const {
    body: { _email, _password, _forename, _lastname }
  } = req;
  const therapistFacade = new TherapistFacade();
  const therapist = new Therapist();
  therapist.email = _email;
  therapist.password = bcrypt.hashSync(_password, 8);
  therapist.forename = _forename;
  therapist.lastname = _lastname;
  therapist.status = Status.ACTIVE;
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

export default router;
