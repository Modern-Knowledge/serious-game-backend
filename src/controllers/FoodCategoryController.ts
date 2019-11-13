
import express from "express";
import { Request, Response } from "express";
import { check } from "express-validator";
import { FoodCategoryFacade } from "../db/entity/enum/FoodCategoryFacade";
import { HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus } from "../lib/utils/http/HttpResponse";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { logEndpoint } from "../util/log/endpointLogger";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { rVM } from "../util/validation/validationMessages";

const router = express.Router();

const controllerName = "FoodCategoryController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 * Get all food categories.
 *
 * response:
 * - food-categories: all food-categories of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const foodCategoryFacade = new FoodCategoryFacade();

    try {
        const foodCategories = await foodCategoryFacade.get();

        logEndpoint(controllerName, `Return all food-categories!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {foodCategories, token: res.locals.authorizationToken}, [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                    "Alle Lebensmittelkategorien erfolgreich geladen!")
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
 * - token: authentication token
 */
router.get("/:id", authenticationMiddleware, [
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
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `Die Lebensmittelkategorie konnte nicht gefunden werden.`)
            ]);
        }

        logEndpoint(controllerName, `Food category with id ${id} was successfully loaded!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {foodCategory, token: res.locals.authorizationToken},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                    `Die Lebensmittelkategorie wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
