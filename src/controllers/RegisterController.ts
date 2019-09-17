import express from "express";
import { Request, Response } from "express";
import {TherapistFacade} from "../db/entity/user/TherapistFacade";
import { Therapist } from '../lib/models/Therapist';


const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.jsonp("RegisterController");
});
router.post("/", async (req: Request, res: Response) => {
  const { body: { _email, _forename, _lastname, _password } } = req;
  const therapistFacade = new TherapistFacade();
  const response = await therapistFacade.insertTherapist(new Therapist(_email, _password, _forename, _lastname));
  res.jsonp(response)
});

export default router;
