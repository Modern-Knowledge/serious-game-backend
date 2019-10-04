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
import { checkRouteValidation, sendDefault400Response } from "../util/validation/validationHelper";

const router = express.Router();

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

    if (!checkRouteValidation("ImageController/:id", req, res)) {
        return sendDefault400Response(req, res);
    }

    const id = Number(req.params.id);

    const facade: ImageFacade = new ImageFacade();

    try {
        const image = await facade.getById(id);

        if (!image) {
            logger.debug(`${loggerString()} POST ImageController/:id: The image with id ${id} does not exist!`);

            return res.status(404).json(
                new HttpResponse(HttpResponseStatus.FAIL,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Das Bild mit der id ${id} wurde nicht gefunden!`)
                    ]
                ));
        }

        logger.debug(`${loggerString()} POST ImageController/:id: The image with id ${id} was successfully loaded!`);

        return res.status(200).send(image.image);
    }
    catch (error) {
        return next(error);
    }
});

export default router;
