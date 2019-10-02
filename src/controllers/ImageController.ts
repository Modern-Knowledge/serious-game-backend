import express, { Request, Response } from "express";
import { ImageFacade } from "../db/entity/image/ImageFacade";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../util/http/HttpResponse";
import logger from "../util/log/logger";
import { loggerString } from "../util/Helper";
import { check, validationResult } from "express-validator";
import {
    logValidatorErrors,
    retrieveValidationMessage,
    toHttpResponseMessage
} from "../util/validation/validationMessages";

const router = express.Router();

/**
 * GET /
 * Image by id.
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logValidatorErrors("POST ImageController/:id", errors.array());

        return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL,
            undefined,
            [
                ...toHttpResponseMessage(errors.array())
            ]
        ));
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
