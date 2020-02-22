
import express, { Request, Response } from "express";
import { check } from "express-validator";
import { ImageFacade } from "../db/entity/image/ImageFacade";
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { logEndpoint } from "../util/log/endpointLogger";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { rVM } from "../util/validation/validationMessages";

const router = express.Router();

const controllerName = "ImageController";

/**
 * GET /:id
 *
 * Returns an image by id.
 *
 * params:
 * - id: id of the image
 */
router.get("/:id", [
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
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `Das Bild mit der ID ${id} wurde nicht gefunden!`)
            ]);
        }

        logEndpoint(controllerName, `The image with id ${id} was successfully loaded!`, req);

        res.contentType("image/png");
        return res.status(HTTPStatusCode.OK).send(image.image);
    }
    catch (error) {
        return next(error);
    }
});

export default router;
