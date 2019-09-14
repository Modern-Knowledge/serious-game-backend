import express, {Request, Response} from "express";
import {UserFacade} from "../db/entity/user/UserFacade";
import {SQLOrder} from "../db/sql/SQLOrder";
import {Filter} from "../db/filter/Filter";
import {FilterAttribute} from "../db/filter/FilterAttribute";
import {SQLComparisonOperator} from "../db/sql/SQLComparisonOperator";
import {User} from "../lib/models/User";

const router = express.Router();

/**
 * GET /
 * Home page.
 */
router.get("/", async (req: Request, res: Response) => {
  // const facade: UserFacade = new UserFacade("u");
  // facade.addOrderBy("id", SQLOrder.DESC);
  //
  // const filter: Filter = facade.getFacadeFilter();
  // filter.addFilterAttribute(new FilterAttribute("der", "asdasd", SQLComparisonOperator.EQUAL));
  //
  // //const users = await facade.getUsers();
  //
  // const u: User = new User();
  // await facade.insertUser(u);

  res.jsonp("users");
});

export default router;
