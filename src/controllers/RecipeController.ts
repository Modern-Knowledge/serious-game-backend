/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { RecipeCompositeFacade } from "../db/composite/RecipeCompositeFacade";
import { HttpResponse, HttpResponseStatus, HttpResponseMessage, HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";

const router = express.Router();

const controllerName = "RecipeController";

/**
 * GET
 * Get all recipes.
 */
router.get("/", async (req: Request, res: Response) => {
  const recipeFacade = new RecipeCompositeFacade();
  const recipes = await recipeFacade.get();
  if (!recipes.length) {
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
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS)
    ]
  ));
});

/**
 * GET
 * Get a recipe by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
  const recipeFacade = new RecipeCompositeFacade();
  const recipe = await recipeFacade.getById(Number(req.params.id));
  if (!recipe) {
    res.json(new HttpResponse(HttpResponseStatus.FAIL,
      undefined,
      [
          new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Rezept konnte nicht gefunden werden.`)
      ]
    ));
  }
  return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
    recipe,
    [
        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS)
    ]
  ));
});

export default router;
