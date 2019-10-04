/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { validationResult } from "express-validator";
import { toHttpResponseMessage } from "./validationMessages";
import { HttpResponse, HttpResponseStatus } from "../../lib/utils/http/HttpResponse";
import { Request, Response } from "express";
import logger from "../log/logger";
import { loggerString } from "../Helper";

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
        logValidatorErrors(req.method + " " + endpoint + req.path, errors.array());

        return false;
    }

    return true;
}

/**
 * sends default 400 response if an error occurred in express-validator
 * @param req request object
 * @param res response object
 */
export function failedValidation400Response(req: Request, res: Response): Response {
    return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL,
        undefined,
        [
            ...toHttpResponseMessage(validationResult(req).array())
        ]
    ));
}

/**
 * logs errors to console that are produced by express-validator
 * @param endpoint endpoint that reports the errors
 * @param errors error array that is returned by express validator
 */
export function logValidatorErrors(endpoint: string, errors: any[]): void {
    for (const error of errors) {
        logger.debug(`${loggerString()} ${endpoint}: Parameter: ${error.param}, Ort: ${error.location}, Text: ${error.msg.message}, Wert: ${!error.param.includes("password") ? error.value : ""}`);
    }
}