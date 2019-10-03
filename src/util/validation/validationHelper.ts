import { validationResult } from "express-validator";
import { logValidatorErrors, toHttpResponseMessage } from "./validationMessages";
import { HttpResponse, HttpResponseStatus } from "../../lib/utils/http/HttpResponse";
import { Request, Response } from "express";

/**
 * checks if a validation in express-validator was not successful
 * logs errors in console
 *
 * returns http 400 to the client and sends the occurred errors as HttpResponseMessages back to client
 *
 * @param endpoint name of the endpoint that is validated
 * @param req request object
 * @param res response object
 */
export function checkRouteValidation(endpoint: string, req: Request, res: Response): Response {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logValidatorErrors(endpoint, errors.array());

        return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL,
            undefined,
            [
                ...toHttpResponseMessage(errors.array())
            ]
        ));
    }

    return undefined;
}