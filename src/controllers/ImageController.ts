/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express, { Request, Response } from "express";
import { ImageFacade } from "../db/entity/image/ImageFacade";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { logEndpoint } from "../util/log/endpointLogger";
import { http4xxResponse } from "../util/http/httpResponses";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";

const router = express.Router();

const controllerName = "ImageController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /:id
 * returns image by id
 *
 * params:
 * - id: id of the image
 */
router.get("/:id", authenticationMiddleware, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);

    const facade: ImageFacade = new ImageFacade();

    try {
        const image = await facade.getById(id);

        if (!image) {
            logEndpoint(controllerName, `The image with id ${id} does not exist!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Bild mit der ID ${id} wurde nicht gefunden!`)
            ]);
        }

        logEndpoint(controllerName, `The image with id ${id} was successfully loaded!`, req);

        return res.status(200).send(image.image);
    }
    catch (error) {
        return next(error);
    }
});

export default router;
