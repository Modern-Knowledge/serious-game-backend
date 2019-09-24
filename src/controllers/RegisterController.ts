import express from "express";
import { Request, Response } from "express";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { Therapist } from "../lib/models/Therapist";
import { Status } from "../lib/enums/Status";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const therapistFacade = new TherapistFacade();
  const therapist = new Therapist().deserialize(req.body);
  therapist.password = bcrypt.hashSync(therapist.password, 8);
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

export default router;
