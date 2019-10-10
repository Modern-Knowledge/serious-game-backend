/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { HttpResponse, HttpResponseStatus, HttpResponseMessage, HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { http4xxResponse } from "../util/http/httpResponses";
import { ErrortextFacade } from "../db/entity/helptext/ErrortextFacade";

const router = express.Router();

const controllerName = "ErrortextController";

/**
 * GET /
 *
 * Get all errortexts.
 *
 * response:
 * - errortexts: all errortexts of the application
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const errorTextFacade = new ErrortextFacade();

    try {
        const errortexts = await errorTextFacade.get();

        logEndpoint(controllerName, `Return all errortexts!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            errortexts,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Alle Fehlertexte erfolgreich geladen!`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /:id
 *
 * Get a errortext by id.
 *
 * params:
 * - id: id of the errortext
 *
 * response:
 * - errortext: loaded errortext
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const errortextFacade = new ErrortextFacade();

    try {
        const errortext = await errortextFacade.getById(id);

        if (!errortext) {
            logEndpoint(controllerName, `Errortext with id ${id} not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Der Fehlertext wurde nicht gefunden!`)
            ]);
        }

        logEndpoint(controllerName, `Errortext with id ${id} was successfully loaded!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            errortext,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Der Fehlertext wurde erfolgreich gefunden!`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
