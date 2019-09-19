import express from "express";
import { Request, Response } from "express";
import { UserFacade } from '../db/entity/user/UserFacade';
import logger from '../util/logger';
import * as jwt from "jsonwebtoken";
const router = express.Router();

router.get("/related", async (req: Request, res: Response) => {
  const userFacade = new UserFacade();
  const token = req.headers['x-access-token'].toString();
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  return jwt.verify(token, process.env.SECRET_KEY, async function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    const users = await userFacade.getUsers();
    const data: any = decoded;
    const user = users.find(user => user.email === data.email);
    if (!user) return res.status(404).send('User not found.');
    const {id, email, forename, lastname} = user;
    return res.status(200).jsonp({id,email,forename,lastname});
  });
});
router.get("/:id", async (req: Request, res: Response) => {
  logger.debug(req.params.id);
  res.jsonp("UserController");
});


export default router;
