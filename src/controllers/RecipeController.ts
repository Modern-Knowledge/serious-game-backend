import express from "express";
import { Request, Response } from "express";
import { RecipeFacade } from "../db/entity/kitchen/RecipeFacade";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  const recipeFacade = new RecipeFacade();
  const recipes = recipeFacade.get();
  res.jsonp(recipes);
});
router.get("/:id", (req: Request, res: Response) => {
  const recipeFacade = new RecipeFacade();
  const recipe = recipeFacade.getById(req.params.id);
  res.jsonp(recipe);
});

export default router;
