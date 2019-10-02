import express from "express";
import { Request, Response } from "express";
import { RecipeCompositeFacade } from '../db/composite/RecipeCompositeFacade';
import { HttpResponse, HttpResponseStatus, HttpResponseMessage, HttpResponseMessageSeverity } from '../lib/utils/http/HttpResponse';

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const recipeFacade = new RecipeCompositeFacade();
  const recipes = await recipeFacade.get();
  if(!recipes.length){
    res.json(new HttpResponse(HttpResponseStatus.FAIL,
      undefined,
      [
          new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Es konnten keine Rezepte gefunden werden.`)
      ]
    ));
  }
  return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
    recipes,
    [
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, null)
    ]
  ));
});
router.get("/:id", async (req: Request, res: Response) => {
  const recipeFacade = new RecipeCompositeFacade();
  const recipe = await recipeFacade.getById(req.params.id);
  if(!recipe){
    res.json(new HttpResponse(HttpResponseStatus.FAIL,
      undefined,
      [
          new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Rezept konnte nicht gefunden werden.`)
      ]
    ));
  }
  return res.status(201).json(new HttpResponse(HttpResponseStatus.SUCCESS,
    recipe,
    [
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, null)
    ]
  ));
});

export default router;
