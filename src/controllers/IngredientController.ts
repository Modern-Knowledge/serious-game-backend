/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import {
  HttpResponse,
  HttpResponseStatus,
  HttpResponseMessage,
  HttpResponseMessageSeverity
} from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import {
  checkRouteValidation,
  failedValidation400Response
} from "../util/validation/validationHelper";
import { http4xxResponse } from "../util/http/httpResponses";
import { IngredientFacade } from "../db/entity/kitchen/IngredientFacade";
import { FoodCategoryFacade } from "../db/entity/enum/FoodCategoryFacade";

const router = express.Router();

const controllerName = "IngredientController";

/**
 * GET /
 *
 * Get all ingredients.
 *
 * response:
 * - ingredients: all ingredients of the application
 */
router.get("/", async (req: Request, res: Response, next: any) => {
  const ingredientFacade = new IngredientFacade();
  try {
    const ingredients = await ingredientFacade.get();

    logEndpoint(controllerName, `Return all ingredients!`, req);

    return res
      .status(200)
      .json(
        new HttpResponse(HttpResponseStatus.SUCCESS, ingredients, [
          new HttpResponseMessage(
            HttpResponseMessageSeverity.SUCCESS,
            `Alle Zutate erfolgreich geladen!`
          )
        ])
      );
  } catch (e) {
    return next(e);
  }
});

/**
 * GET /:id
 *
 * Get a ingredient by id.
 *
 * params:
 * - id: id of the ingredient
 *
 * response:
 * - ingredient: ingredient that was loaded
 */
router.get(
  "/:id",
  [
    check("id")
      .isNumeric()
      .withMessage(rVM("id", "numeric"))
  ],
  async (req: Request, res: Response, next: any) => {
    if (!checkRouteValidation(controllerName, req, res)) {
      return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const ingredientFacade = new IngredientFacade();
    try {
      const ingredient = await ingredientFacade.getById(id);

      if (!ingredient) {
        logEndpoint(
          controllerName,
          `Ingredient with id ${id} was not found!`,
          req
        );

        return http4xxResponse(res, [
          new HttpResponseMessage(
            HttpResponseMessageSeverity.DANGER,
            `Die Zutat konnte nicht gefunden werden.`
          )
        ]);
      }

      logEndpoint(
        controllerName,
        `Ingredient with id ${id} was successfully loaded!`,
        req
      );

      return res
        .status(200)
        .json(
          new HttpResponse(HttpResponseStatus.SUCCESS, ingredient, [
            new HttpResponseMessage(
              HttpResponseMessageSeverity.SUCCESS,
              `Die Zutat wurde erfolgreich geladen!`
            )
          ])
        );
    } catch (e) {
      return next(e);
    }
  }
);

/**
 * GET /category/:category_id
 *
 * Get ingredients by category_id.
 *
 * params:
 * - category_id: category-id of the ingredients
 *
 * response:
 * - ingredients: ingredients that were loaded
 */
router.get("/category/:category_id", [
     check("category_id").isNumeric().withMessage(rVM("id", "numeric"))
    ], async (req: Request, res: Response, next: any) => {

      if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
      }

      const categoryId = Number(req.params.category_id);

      const ingredientFacade = new IngredientFacade();
      ingredientFacade.foodCategoryFacadeFilter.addFilterCondition("id", categoryId);

      const foodCategoryFacade = new FoodCategoryFacade();

      try {
        const foodCategory = await foodCategoryFacade.getById(categoryId);

        if (!foodCategory) {
          logEndpoint(
              controllerName,
              `Food-category with id ${categoryId} was not found!`,
              req
          );

          return http4xxResponse(res, [
            new HttpResponseMessage(
                HttpResponseMessageSeverity.DANGER,
                `Die Lebensmittelkategorie konnte nicht gefunden werden.`
            )
          ]);
        }

        const ingredients = await ingredientFacade.get();

        logEndpoint(
            controllerName,
            `Ingredients with category-id ${categoryId} were successfully loaded!`,
            req
        );

        return res.status(200).json(
                new HttpResponse(HttpResponseStatus.SUCCESS,
                    ingredients,
                    [new HttpResponseMessage(
                      HttpResponseMessageSeverity.SUCCESS,
                      `Die Zutaten der Kategorie "${foodCategory.name}" wurden erfolgreich geladen!`
                  )
                ])
            );
      } catch (e) {
        return next(e);
      }
    }
);

export default router;
