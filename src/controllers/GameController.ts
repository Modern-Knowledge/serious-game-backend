

import express from "express";
import { Request, Response } from "express";
import { GameCompositeFacade } from "../db/composite/GameCompositeFacade";
import { HttpResponse, HttpResponseStatus, HttpResponseMessageSeverity, HttpResponseMessage } from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";

const router = express.Router();

const controllerName = "GameController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 * Get all games.
 *
 * response:
 * - games: all games of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const gameFacade = new GameCompositeFacade();

    try {
        const games = await gameFacade.get();

        logEndpoint(controllerName, `Return all games!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {game: games, token: res.locals.authorizationToken},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, "Alle Spiele erfolgreich geladen!")
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /:id
 *
 * Get a game by id.
 *
 * params:
 * - id: id of the game
 *
 * response:
 * - game: game that was loaded
 * - token: authentication token
 */
router.get("/:id", authenticationMiddleware, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const gameFacade = new GameCompositeFacade();

    try {
        const game = await gameFacade.getById(id);

        if (!game) {
            logEndpoint(controllerName, `Game with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Spiel konnte nicht gefunden werden.`)
            ]);
        }

        logEndpoint(controllerName, `Game with id ${id} was successfully loaded!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {game: game, token: res.locals.authorizationToken},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Spiel wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
