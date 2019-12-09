import { Request, Response } from "express";
import { Roles } from "../../lib/enums/Roles";
import { Patient } from "../../lib/models/Patient";
import { Therapist } from "../../lib/models/Therapist";
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../../lib/utils/httpStatusCode";
import { getRequestUrl, loggerString } from "../Helper";
import { http4xxResponse } from "../http/httpResponses";
import logger from "../log/logger";

/**
 * This file provides permission middleware for express:
 *
 * - checkUserPermission: check if user is allowed to view the endpoint
 * - checkTherapistPermission: check if authUser is a therapist
 * - checkPatientPermission: check if authUser is a patient
 */

/**
 * Middleware that checks if a user is allowed to view the requested endpoint.
 * Some endpoints can only be viewed by the user who owns the endpoint.
 * e.g.:User can only edit himself.
 *
 * Unexpected behavior may occur if the middleware is applied to endpoints where
 * there is no user id as a path variable, but an id for another resource
 *
 * params:
 * - id: id of the user
 *
 * @param req request
 * @param res response
 * @param next next middleware
 */
export function checkUserPermission(req: Request, res: Response, next: any) {
    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkUserPermission")}`);

    const authUser = res.locals.user;

    if (Number(req.params.id) === authUser.id) {
        return next();
    }

    logger.debug(`${loggerString("", "", "", __filename)} ` +
        `User with ${authUser.id} is not allowed to view the endpoint "${getRequestUrl(req)}" ` +
        `of user with id ${req.params.id}!`);

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], HTTPStatusCode.FORBIDDEN);
}

/**
 * Middleware that guarantees only therapists access the requested endpoint.
 *
 * @param req request
 * @param res response
 * @param next next middleware
 */
export function checkTherapistPermission(req: Request, res: Response, next: any) {
    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistPermission")}`);

    const authUser = res.locals.user;

    if (authUser instanceof Therapist) { // user is therapist
        return next();
    }

    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistPermission")} ` +
        `User with ${req.params.id} is not allowed to view the endpoint "${getRequestUrl(req)}", ` +
        `because he/she is no therapist!`);

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], HTTPStatusCode.FORBIDDEN);
}

/**
 * Middleware that guarantees only patients access the requested endpoint.
 *
 * @param req request
 * @param res response
 * @param next next middleware
 */
export function checkPatientPermission(req: Request, res: Response, next: any) {
    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkPatientPermission")}`);

    const authUser = res.locals.user;

    if (authUser instanceof Patient) { // user is therapist
        return next();
    }

    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkPatientPermission")} ` +
        `User with id ${authUser.id} is not allowed to view the endpoint "${getRequestUrl(req)}", ` +
        `because he/she is no patient!`);

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], HTTPStatusCode.FORBIDDEN);
}

/**
 * Middleware that guarantees only admin therapists access the requested endpoint.
 *
 * @param req request
 * @param res response
 * @param next next middleware
 */
export function checkTherapistAdminPermission(req: Request, res: Response, next: any) {
    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistAdminPermission")}`);

    const authUser = res.locals.user;

    if (authUser instanceof Therapist && authUser.role === Roles.ADMIN) { // user is therapist & admin
        return next();
    }

    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistAdminPermission")} ` +
        `User with id ${authUser.id} is not allowed to view the endpoint "${getRequestUrl(req)}", ` +
        `because he/she is no therapist or admin!`);

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], HTTPStatusCode.FORBIDDEN);
}
