import express from "express";
import { Request, Response } from "express";
import { RecipeFacade } from "../db/entity/kitchen/RecipeFacade";
import logger from "../util/logger";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const recipeFacade = new RecipeFacade();
  const recipes = await recipeFacade.get();
  res.jsonp(recipes);
});
router.get("/:id", async (req: Request, res: Response) => {
  const recipeFacade = new RecipeFacade();
  const recipe = await recipeFacade.getById(req.params.id);
  res.jsonp(recipe);
});

export default router;
