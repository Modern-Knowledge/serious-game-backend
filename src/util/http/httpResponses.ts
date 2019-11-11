
import { Response } from "express";
import { Request } from "express";
import { validationResult } from "express-validator";
import {
    HttpResponse,
    HttpResponseMessage, HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../../lib/utils/http/HttpResponse";
import { toHttpResponseMessage } from "../validation/validationMessages";

/**
 * stores predefined http responses
 */

/**
 * returns a default http 4xx response. Response status is set to HttpResponseStatus.FAIL
 * default status code: 404
 *
 * @param res http response that is returned
 * @param messages messages that are appended to the http response
 * @param code http response status code
 * @param data data that is appended to the response
 */
export function http4xxResponse(res: Response, messages?: HttpResponseMessage[], code: number = 404, data?: any): Response {
    return res.status(code).json(
        new HttpResponse(HttpResponseStatus.FAIL,
            data,
            messages
        ));
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
 * sends 403 response if permission to view/edit endpoint is rejected
 *
 * @param res response object
 */
export function forbidden403Response(res: Response): Response {
    return res.status(403).json(new HttpResponse(HttpResponseStatus.FAIL,
        undefined, [
            new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Sie dürfen diese Aktion nicht durchführen!")
        ]
    ));
}
