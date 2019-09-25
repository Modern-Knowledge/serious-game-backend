import express, { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { UserFacade } from "../db/entity/user/UserFacade";
import { FilterAttribute } from "../db/filter/FilterAttribute";
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";
import { TherapistFacade } from '../db/entity/user/TherapistFacade';
import { JWTHelper } from '../util/JWTHelper';
import logger from '../util/logger';

const router = express.Router();

/**
 * POST /
 * Login with email and password.
 */
router.post("/login", async (req: Request, res: Response) => {
  const userFacade = new UserFacade();
  
  const {body: { email, password }} = req;
  const filter = userFacade.filter;
  filter.addFilterCondition("email", email, SQLComparisonOperator.EQUAL);
  try{
    const users = await userFacade.get();

    let user;
    if (users.length == 0) {
      return res.status(401).send("Invalid credentials.");
    }
    user = users[0];

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).send("Invalid credentials.");
    const jwtHelper: JWTHelper = new JWTHelper();
    const token = await jwtHelper.signToken(user);
    return res.status(200).send({ auth: true, token: token });
  } 
  catch(error){
    return res.status(500).jsonp(error);
  }
});

export default router;
