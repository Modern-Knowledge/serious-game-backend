import express from "express";
import { Request, Response } from "express";
import { UserFacade } from "../db/entity/user/UserFacade";
import { SQLOrder } from "../db/sql/SQLOrder";

const router = express.Router();

/**
 * GET /
 * Home page.
 */
router.get("/", async (req: Request, res: Response) => {
  const facade: UserFacade = new UserFacade("u");
  facade.addOrderBy("id", SQLOrder.DESC);
  facade.addOrderBy("username", SQLOrder.DESC);

  const users = await facade.getUsers();

  res.jsonp(users);
});

export default router;
