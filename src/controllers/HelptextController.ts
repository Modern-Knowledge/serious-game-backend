/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { HttpResponse, HttpResponseStatus, HttpResponseMessage, HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";
import { HelptextFacade } from "../db/entity/helptext/HelptextFacade";
import { logEndpoint } from "../util/log/endpointLogger";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { http4xxResponse } from "../util/http/httpResponses";

const router = express.Router();

const controllerName = "HelptextController";

/**
 * GET /
 *
 * Get all helptexts.
 *
 * response:
 * - helptexts: all helptexts of the application
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const helptextFacade = new HelptextFacade();

    try {
        const helptexts = await helptextFacade.get();

        logEndpoint(controllerName, `Return all helptexts!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            helptexts,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Alle Hilfetexte erfolgreich geladen!`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /:id
 *
 * Get a helptext by id.
 *
 * params:
 * - id: id of the helptext
 *
 * response:
 * - helptext: loaded helptext
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const helptextFacade = new HelptextFacade();

    try {
        const helptext = await helptextFacade.getById(id);

        if (!helptext) {
            logEndpoint(controllerName, `Helptext with id ${id} not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Der Hilfetext wurde nicht gefunden!`)
            ]);
        }

        logEndpoint(controllerName, `Helptext with id ${id} was successfully loaded!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            helptext,
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Der Hilfetext wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
