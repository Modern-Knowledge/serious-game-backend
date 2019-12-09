
import { Response } from "express";
import { Request } from "express";
import { validationResult } from "express-validator";
import {
    HttpResponse,
    HttpResponseMessage, HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../../lib/utils/http/HttpResponse";
import { HTTPStatusCode } from "../../lib/utils/httpStatusCode";
import { toHttpResponseMessage } from "../validation/validationMessages";

/**
 * Returns a default http 4xx response. Response status is set to HttpResponseStatus.FAIL
 * Default status code: 404
 *
 * @param res http-response
 * @param messages messages that are appended to the http-response
 * @param code http-response status-code
 * @param data data that is appended to the response
 */
export function http4xxResponse(
    res: Response,
    messages?: HttpResponseMessage[],
    code: number = HTTPStatusCode.NOT_FOUND,
    data?: any): Response {

    return res.status(code).json(
        new HttpResponse(HttpResponseStatus.FAIL,
            data,
            messages
        ));
}

/**
 * Sends default 400 response if an error occurred in express-validator. Includes
 * the validation errors in the response.
 *
 * @param req request object
 * @param res response object
 */
export function failedValidation400Response(req: Request, res: Response): Response {
    return res.status(HTTPStatusCode.BAD_REQUEST).json(new HttpResponse(HttpResponseStatus.FAIL,
        undefined,
        [
            ...toHttpResponseMessage(validationResult(req).array())
        ]
    ));
}

/**
 * Sends http-403 response if the permission to view/edit endpoint is rejected.
 *
 * @param res response object
 */
export function forbidden403Response(res: Response): Response {
    return res.status(HTTPStatusCode.FORBIDDEN).json(new HttpResponse(HttpResponseStatus.FAIL,
        undefined, [
            new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Sie dürfen diese Aktion nicht durchführen!")
        ]
    ));
}
