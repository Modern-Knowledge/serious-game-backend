import { Request, Response } from "express";
import { UserFacade } from "../db/entity/user/UserFacade";
import { UserFilter } from "../db/entity/user/filter/UserFilter";

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  const facade: UserFacade = new UserFacade("u");
  const filter: UserFilter = new UserFilter();
  const users = facade.getUsers(filter);

  users.then(rows => {
    res.send(rows);
  });
};
