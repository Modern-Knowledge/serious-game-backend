import { validationResult } from "express-validator";
import { logValidatorErrors, toHttpResponseMessage } from "./validationMessages";
import { HttpResponse, HttpResponseStatus } from "../../lib/utils/http/HttpResponse";
import { Request, Response } from "express";

/**
 * checks if a validation in express-validator was not successful
 * logs errors to console
 *
 * returns http 400 to the client and sends the occurred errors as HttpResponseMessages back to client
 *
 * @param endpoint name of the endpoint that is validated
 * @param req request object
 * @param res response object
 */
export function checkRouteValidation(endpoint: string, req: Request, res: Response): boolean {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logValidatorErrors(endpoint, errors.array());

        return false;
    }

    return true;
}

/**
 * sends default 400 response if an error occurred in express-validator
 * @param req request object
 * @param res response object
 */
export function sendDefault400Response(req: Request, res: Response): Response {
    return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL,
        undefined,
        [
            ...toHttpResponseMessage(validationResult(req).array())
        ]
    ));
}