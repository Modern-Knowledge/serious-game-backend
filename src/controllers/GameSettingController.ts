
import express from "express";
import { Request, Response } from "express";
import { check } from "express-validator";
import { GameSettingFacade } from "../db/entity/settings/GameSettingFacade";
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

const controllerName = "GameSettingController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 *
 * Get all game-settings.
 *
 * response:
 * - game-settings: all game-settings of the application
 * - token: authenticated token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const gameSettingFacade = new GameSettingFacade();

    try {
        const gameSettings = await gameSettingFacade.get();

        logEndpoint(controllerName, `Return all gameSettings!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {gameSettings, token: res.locals.authorizationToken},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                    "Alle Spieleinstellungen erfolgreich geladen!")
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /:id
 *
 * Get a game-setting by id.
 *
 * params:
 * - id: id of the game-setting
 *
 * response:
 * - game-setting: game-setting that was loaded
 * - token: authenticated token
 */
router.get("/:id", authenticationMiddleware, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const gameSettingFacade = new GameSettingFacade();

    try {
        const gameSetting = await gameSettingFacade.getById(id);

        if (!gameSetting) {
            logEndpoint(controllerName, `Game-Setting with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `Die Spieleinstellung konnte nicht gefunden werden.`)
            ]);
        }

        logEndpoint(controllerName, `Game-Setting with id ${id} was successfully loaded!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {gameSetting, token: res.locals.authorizationToken},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                    `Die Spieleinstellung wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
