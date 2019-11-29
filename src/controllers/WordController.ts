
import express from "express";
import { Request, Response } from "express";
import { check } from "express-validator";
import { WordFacade } from "../db/entity/word/WordFacade";
import { HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus } from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { logEndpoint } from "../util/log/endpointLogger";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { rVM } from "../util/validation/validationMessages";

const router = express.Router();

const controllerName = "WordController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 *
 * Get all words.
 *
 * response:
 * - words: all words of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const wordFacade = new WordFacade();

    try {
        const words = await wordFacade.get();

        logEndpoint(controllerName, `Return all words!`, req);

        return res.status(HTTPStatusCode.OK).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {words, token: res.locals.authorizationToken},
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
 * Get a word by id.
 *
 * params:
 * - id: id of the word
 *
 * response:
 * - word: word that was loaded
 * - token: authentication token 🥺
 */
router.get("/:id", authenticationMiddleware, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const wordFacade = new WordFacade();

    try {
        const word = await wordFacade.getById(id);

        if (!word) {
            logEndpoint(controllerName, `Word with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Wort konnte nicht gefunden werden.`)
            ]);
        }

        logEndpoint(controllerName, `Word with id ${id} was successfully loaded!`, req);

        return res.status(HTTPStatusCode.OK).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {word, token: res.locals.authorizationToken}, [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Wort wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
