/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { WordFacade } from "../db/entity/word/WordFacade";
import { HttpResponse, HttpResponseStatus, HttpResponseMessage, HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { check } from "express-validator";
import { retrieveValidationMessage } from "../util/validation/validationMessages";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { http4xxResponse } from "../util/http/httpResponses";

const router = express.Router();

const controllerName = "WordController";

/**
 * GET /
 *
 * Get all words.
 *
 * response:
 * - words: all words of the application
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const wordFacade = new WordFacade();

    try {
        const words = await wordFacade.get();

        logEndpoint(controllerName, `Return all words!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            words,
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
 * - game: word that was loaded
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))

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

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            word,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Wort wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
