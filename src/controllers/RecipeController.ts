/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

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
import {check} from "express-validator";
import {retrieveValidationMessage} from "../util/validation/validationMessages";
import {checkRouteValidation, failedValidation400Response} from "../util/validation/validationHelper";
import {http4xxResponse} from "../util/http/httpResponses";

const router = express.Router();

const controllerName = "RecipeController";

/**
 * GET /
 *
 * Get all recipes.
 *
 * response:
 * - helptexts: all recipes of the application
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const recipeFacade = new RecipeCompositeFacade();
    try {
        const recipes = await recipeFacade.get();

        logEndpoint(controllerName, `Return all recipes!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            recipes,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS)
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
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
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
            recipe,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Rezept wurde erfolgreich geladen!`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
