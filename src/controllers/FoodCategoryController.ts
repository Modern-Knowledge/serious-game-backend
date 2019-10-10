/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { HttpResponse, HttpResponseStatus, HttpResponseMessageSeverity, HttpResponseMessage } from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { http4xxResponse } from "../util/http/httpResponses";
import { FoodCategoryFacade } from "../db/entity/enum/FoodCategoryFacade";

const router = express.Router();

const controllerName = "FoodCategoryController";

/**
 * GET /
 * Get all food categories.
 *
 * response:
 * - food-categories: all food-categories of the application
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const foodCategoryFacade = new FoodCategoryFacade();

    try {
        const foodCategories = await foodCategoryFacade.get();

        logEndpoint(controllerName, `Return all food-categories!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            foodCategories,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, "Alle Lebensmittelkategorien erfolgreich geladen!")
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /:id
 *
 * Get a food-category by id.
 *
 * params:
 * - id: id of the food-category
 *
 * response:
 * - food-category: food-category that was loaded
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const foodCategoryFacade = new FoodCategoryFacade();

    try {
        const foodCategory = await foodCategoryFacade.getById(id);

        if (!foodCategory) {
            logEndpoint(controllerName, `Food category with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Die Lebensmittelkategorie konnte nicht gefunden werden.`)
            ]);
        }

        logEndpoint(controllerName, `Food category with id ${id} was successfully loaded!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            foodCategory,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Die Lebensmittelkategorie wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
