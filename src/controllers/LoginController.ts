import express from "express";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { UserFacade } from '../db/entity/user/UserFacade';
import logger from '../util/logger';
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("LoginController");
});

router.get("/logout", (req: Request, res: Response) => {
  res.send("LoginController");
});

router.post("/login", async (req: Request, res: Response) => {
  const userFacade = new UserFacade();
  const { body: {email, password} } = req;
  const users = await userFacade.getUsers();

  const user = users.find(user => user.email === email);
  if (!user) return res.status(404).send('Invalid credentials.');

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).send({ auth: false, token: null });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.SECRET_KEY, {
    expiresIn: 3600 // expires in 1 hour
  });

  res.status(200).send({ auth: true, token: token });
});

export default router;
