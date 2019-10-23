

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
} from "../util/validation/validationHelper";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { IngredientFacade } from "../db/entity/kitchen/IngredientFacade";
import { FoodCategoryFacade } from "../db/entity/enum/FoodCategoryFacade";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";

const router = express.Router();

const controllerName = "IngredientController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 *
 * Get all ingredients.
 *
 * response:
 * - ingredients: all ingredients of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const ingredientFacade = new IngredientFacade();
    try {
        const ingredients = await ingredientFacade.get();

        logEndpoint(controllerName, `Return all ingredients!`, req);

        return res.status(200).json(
                new HttpResponse(HttpResponseStatus.SUCCESS,
                    {ingredients: ingredients, token: res.locals.authorizationToken}, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Alle Zutate erfolgreich geladen!`)
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
 * - token: authentication token
 */
router.get("/:id", authenticationMiddleware, [
        check("id").isNumeric().withMessage(rVM("id", "numeric"))
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
                    new HttpResponse(HttpResponseStatus.SUCCESS,
                        { ingredient: ingredient, token: res.locals.authorizationToken}, [
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
 * GET /category/:id
 *
 * Get ingredients by category_id.
 *
 * params:
 * - id: category-id of the ingredients
 *
 * response:
 * - ingredients: ingredients that were loaded
 * - token: authentication token
 */
router.get("/category/:id", authenticationMiddleware, [
        check("id").isNumeric().withMessage(rVM("id", "numeric"))
    ], async (req: Request, res: Response, next: any) => {

        if (!checkRouteValidation(controllerName, req, res)) {
            return failedValidation400Response(req, res);
        }

        const categoryId = Number(req.params.id);

        const ingredientFacade = new IngredientFacade();
        ingredientFacade.foodCategoryFacadeFilter.addFilterCondition("id", categoryId);

        try {
            const ingredients = await ingredientFacade.get();

            logEndpoint(
                controllerName,
                `Ingredients with category-id ${categoryId} were successfully loaded!`,
                req
            );

            let categoryName = "";
            if (ingredients.length > 0) {
                categoryName = ingredients[0].foodCategory.name;
            }

            return res.status(200).json(
                new HttpResponse(HttpResponseStatus.SUCCESS,
                    {ingredients: ingredients, token: res.locals.authorizationToken},
                    [new HttpResponseMessage(
                        HttpResponseMessageSeverity.SUCCESS,
                        `Die Zutaten der Kategorie "${categoryName}" wurden erfolgreich geladen!`
                    )
                    ])
            );
        } catch (e) {
            return next(e);
        }
    }
);

export default router;
