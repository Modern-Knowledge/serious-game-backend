import { Request, Response } from "express";
import { UserFacade } from "../db/entity/user/UserFacade";
import { Filter } from "../db/filter/Filter";
import { FilterAttribute } from "../db/filter/FilterAttribute";
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";

/**
 * GET /
 * Home page.
 */
export const index = async (req: Request, res: Response) => {

  const f: Filter = new Filter("u");
  f.addFilterAttribute(new FilterAttribute("username", "%a%", SQLComparisonOperator.LIKE));
  const facade: UserFacade = new UserFacade("u");
  const attr: string[] = ["username"];
  const users = await facade.getUsers(f, attr);

  res.send(users);
};
