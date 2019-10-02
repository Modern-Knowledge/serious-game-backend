import express from "express";
import { Request, Response } from "express";
import { RecipeCompositeFacade } from '../db/composite/RecipeCompositeFacade';
import { HttpResponse, HttpResponseStatus, HttpResponseMessage, HttpResponseMessageSeverity } from '../lib/utils/http/HttpResponse';

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const recipeFacade = new RecipeCompositeFacade();
  const recipes = await recipeFacade.get();
  res.jsonp(recipes);
});
router.get("/:id", async (req: Request, res: Response) => {
  const recipeFacade = new RecipeCompositeFacade();
  const recipe = await recipeFacade.getById(req.params.id);
  res.jsonp(recipe);
});

export default router;
