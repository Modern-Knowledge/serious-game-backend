import { Request, Response } from "express";
import { UserFacade } from "../db/entity/user/UserFacade";
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";
import { SQLOrder } from "../db/sql/SQLOrder";

/**
 * GET /
 * Home page.
 */
export const index = async (req: Request, res: Response) => {


  const facade: UserFacade = new UserFacade("u");
  facade.addOrderBy("id", SQLOrder.DESC);
  facade.addOrderBy("username", SQLOrder.DESC);

  facade.addFilter("username", undefined, SQLComparisonOperator.IS);

  const exclAttr: string[] = ["username"];
  const users = await facade.getUsers(exclAttr);

  res.send(users);
};
