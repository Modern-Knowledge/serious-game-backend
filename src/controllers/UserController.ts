import express from "express";
import { Request, Response } from "express";
import logger from "../util/logger";
import { TherapistFacade } from '../db/entity/user/TherapistFacade';
import { PatientFacade } from '../db/entity/user/PatientFacade';
import { SQLComparisonOperator } from '../db/sql/SQLComparisonOperator';
import { JWTHelper } from '../util/JWTHelper';
const router = express.Router();

/**
 * GET /
 * Get the user belonging to the sent JWT.
 */
router.get("/related", async (req: Request, res: Response) => {
  const token = req.headers["x-access-token"].toString();
  if (!token) return res.status(401).send({ auth: false, message: "No token provided." });
  const jwtHelper: JWTHelper = new JWTHelper();
  return jwtHelper.verifyToken(token, async function(err, decoded){
    if (err) return res.status(500).send({ auth: false, message: "Failed to authenticate token." });
    try{
      const data: any = decoded;
      const userFacade = data.therapist ? new TherapistFacade() : new PatientFacade();
      //TODO: use getById
      const filter = userFacade.filter;
      filter.addFilterCondition(data.therapist ? "therapist_id" : "patient_id", data.id, SQLComparisonOperator.EQUAL);
      const users = await userFacade.get();
      let user;
      if (users.length == 0) {
        return res.status(401).send("Invalid credentials.");
      }
      user = users[0];
      if (!user) return res.status(404).send("User not found.");
      const {id, email, forename, lastname} = user;
      return res.status(200).jsonp({id, email, forename, lastname});
    }
    catch(error){
      return res.status(500).jsonp(error);
    }
  });
});

/**
 * GET /
 * Get a user by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  logger.debug(req.params.id);
  res.jsonp("UserController");
});


export default router;
