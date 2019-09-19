import express, {Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import {UserFacade} from "../db/entity/user/UserFacade";
import {FilterAttribute} from "../db/filter/FilterAttribute";
import {SQLComparisonOperator} from "../db/sql/SQLComparisonOperator";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("LoginController");
});

router.get("/logout", (req: Request, res: Response) => {
  res.send("LoginController");
});

router.post("/login", async (req: Request, res: Response) => {
  const userFacade = new UserFacade();
  const {body: { email, password }} = req;
  const filter = userFacade.filter;
  filter.addFilterAttribute(new FilterAttribute("email", email, SQLComparisonOperator.EQUAL));

  const users = await userFacade.get();

  let user;
  if(users.length == 0) {
    return res.status(401).send("Invalid credentials.");
  }
  user = users[0];

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).send("Invalid credentials.");

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.SECRET_KEY,
    {
      expiresIn: 3600 // expires in 1 hour
    }
  );

  return res.status(200).send({ auth: true, token: token });
});

export default router;
