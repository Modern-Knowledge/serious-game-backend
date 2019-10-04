/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express, { Request, Response } from "express";
import { ImageFacade } from "../db/entity/image/ImageFacade";
import logger from "../util/log/logger";
import { loggerString } from "../util/Helper";
import { check, validationResult } from "express-validator";
import { retrieveValidationMessage } from "../util/validation/validationMessages";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { logEndpoint } from "../util/log/endpointLogger";

const router = express.Router();

const controllerName = "ImageController";


/**
 * GET /:id
 * returns image by id
 *
 * params:
 * - id: id of the image
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
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

            return res.status(404).json(
                new HttpResponse(HttpResponseStatus.FAIL,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Bild mit der ID ${id} wurde nicht gefunden!`)
                    ]
                ));
        }

        logEndpoint(controllerName, `The image with id ${id} was successfully loaded!`, req);

        return res.status(200).send(image.image);
    }
    catch (error) {
        return next(error);
    }
});

export default router;
