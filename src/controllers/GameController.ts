/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { GameCompositeFacade } from "../db/composite/GameCompositeFacade";
import { HttpResponse, HttpResponseStatus, HttpResponseMessageSeverity, HttpResponseMessage } from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { check } from "express-validator";
import { retrieveValidationMessage } from "../util/validation/validationMessages";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { http4xxResponse } from "../util/http/httpResponses";
import passport from "passport";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";

const router = express.Router();

const controllerName = "GameController";

router.use(checkAuthenticationToken);
router.use(checkAuthentication); // disable

/**
 * GET /
 * Get all games.
 *
 * response:
 * - games: all games of the application
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const gameFacade = new GameCompositeFacade();

    console.log(res.locals.authorizationToken);
    console.log(res.locals.user);

    try {
        const games = await gameFacade.get();

        logEndpoint(controllerName, `Return all games!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            games,
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
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
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
            game,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Spiel wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
