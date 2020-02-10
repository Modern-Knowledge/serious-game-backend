import express, {Request, Response} from "express";
import {check} from "express-validator";
import {RecipeCompositeFacade} from "../db/composite/RecipeCompositeFacade";
import {RecipeFacade} from "../db/entity/kitchen/RecipeFacade";
import {SQLOperator} from "../db/sql/enums/SQLOperator";
import {Recipe} from "../lib/models/Recipe";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import {failedValidation400Response, http4xxResponse} from "../util/http/httpResponses";
import {logEndpoint} from "../util/log/endpointLogger";
import {checkAuthentication, checkAuthenticationToken} from "../util/middleware/authenticationMiddleware";
import {checkTherapistPermission} from "../util/middleware/permissionMiddleware";
import {checkRouteValidation} from "../util/validation/validationHelper";
import {rVM} from "../util/validation/validationMessages";

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

        return res.status(HTTPStatusCode.OK).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {recipes, token: res.locals.authorizationToken},
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

        return res.status(HTTPStatusCode.OK).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {recipe, token: res.locals.authorizationToken}, [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Rezept wurde erfolgreich geladen!`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

/**
 * PUT :/id
 *
 * Update a recipe by id
 *
 * params:
 * - id: id of the recipe
 *
 * body:
 * - name: name of the recipe
 * - description: description of the recipe
 * - mealtime: mealtime of the recipe
 * - difficulty_id: difficulty of the recipe
 *
 * response:
 * - recipe: updated recipe
 * - token: authentication token
 */
router.put("/:id", authenticationMiddleware, checkTherapistPermission, [
    check("id").isNumeric().withMessage(rVM("id", "numeric")),

    check("_name").escape().trim()
        .not().isEmpty().withMessage(rVM("recipeName", "empty")),

    // not required
    // check("_description").escape().trim()
    //     .not().isEmpty().withMessage(rVM("lastname", "empty")),

    check("_mealtime").escape().trim()
        .not().isEmpty().withMessage(rVM("mealtime", "empty")),

    check("_difficultyId").isNumeric().withMessage(rVM("id", "numeric")),

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);

    const recipeFacade = new RecipeFacade();

    const recipe = new Recipe().deserialize(req.body);
    try {
        const dbRecipe = await recipeFacade.getById(id);

        if (!dbRecipe) {
            logEndpoint(controllerName, `Recipe with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `Rezept mit ID ${id} wurde nicht gefunden!`)
            ]);
        }

        recipe.id = id;

        const filter = recipeFacade.filter;
        filter.addFilterCondition("id", recipe.id);

        await recipeFacade.update(recipe);

        logEndpoint(controllerName, `Recipe with id ${id} was successfully updated!`, req);

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {recipe, token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `Rezept mit ID ${id} wurde erfolgreich aktualisiert!`, true)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /:mealtime/:difficulty
 *
 * Retrieves recipes with mealtime and difficulty
 *
 * params:
 * - mealtime: mealtime
 * - difficulty: id of the difficulty
 *
 * response:
 * - recipe: recipe that was loaded
 * - token: authentication token
 */
router.get("/:mealtime/:difficulty", authenticationMiddleware, [
    check("difficulty").isNumeric().withMessage(rVM("id", "numeric")),
    check("mealtime").escape().trim().not().isEmpty().withMessage(rVM("mealtime", "empty")),
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const mealtime = req.params.mealtime;
    const difficultyId = Number(req.params.difficulty);

    const recipeFacade = new RecipeCompositeFacade();
    if (mealtime !== "all") {
        recipeFacade.filter.addFilterCondition("mealtime", mealtime);
        recipeFacade.filter.addOperator(SQLOperator.AND);
    }

    if (difficultyId !== 0) {
        recipeFacade.filter.addFilterCondition("difficulty_id", difficultyId);
    }

    try {
        const recipes = await recipeFacade.get();

        logEndpoint(controllerName,
            `Recipes with mealtime '${mealtime}' and difficulty '${difficultyId}' was found!`, req);

        return res.status(HTTPStatusCode.OK).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {recipes, token: res.locals.authorizationToken}, [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Die Rezepte wurde erfolgreich geladen!`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
