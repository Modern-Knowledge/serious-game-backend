

import express from "express";
import { Request, Response } from "express";
import { RecipeCompositeFacade } from "../db/composite/RecipeCompositeFacade";
import {
    HttpResponse,
    HttpResponseStatus,
    HttpResponseMessage,
    HttpResponseMessageSeverity
} from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";

const router = express.Router();

const controllerName = "RecipeController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 *
 * Get all recipes.
 *
 * response:
 * - recipes: all recipes of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const recipeFacade = new RecipeCompositeFacade();
    try {
        const recipes = await recipeFacade.get();

        logEndpoint(controllerName, `Return all recipes!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {recipes: recipes, token: res.locals.authorizationToken},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Alle Rezepte erfolgreich geladen!`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /:id
 *
 * Get a recipe by id.
 *
 * params:
 * - id: id of the recipe
 *
 * response:
 * - recipe: recipe that was loaded
 * - token: authentication token
 */
router.get("/:id", authenticationMiddleware, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const recipeFacade = new RecipeCompositeFacade();

    try {
        const recipe = await recipeFacade.getById(id);

        if (!recipe) {
            logEndpoint(controllerName, `Recipe with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Rezept konnte nicht gefunden werden.`)
            ]);
        }

        logEndpoint(controllerName, `Recipe with id ${id} was successfully loaded!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {recipe: recipe, token: res.locals.authorizationToken}, [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Rezept wurde erfolgreich geladen!`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
