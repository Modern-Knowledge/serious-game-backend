
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { loggerString } from "../Helper";
import logger from "../log/logger";

/**
 * Retrieves the validation results from the express-validator. Checks if an
 * error occurred within the validation. If an error has been reported, the function
 * prints these errors and returns false. Otherwise true is returned.
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
 * Logs errors that are produced by express-validator.
 *
 * @param endpoint endpoint where the validation failed
 * @param errors array of validation-errors, that are returned by express validator
 */
function logValidatorErrors(endpoint: string, errors: any[]): void {
    for (const error of errors) {
        logger.error(`${loggerString()} ${endpoint}: Parameter: ${error.param}, ` +
            `Ort: ${error.location}, ` +
            `Text: ${error.msg.message}, ` +
            `Wert: ${!error.param.includes("password") ? error.value : ""}`);
    }
}
