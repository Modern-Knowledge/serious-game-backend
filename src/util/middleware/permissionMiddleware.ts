

import { Therapist } from "../../lib/models/Therapist";
import { Request, Response } from "express";
import { http4xxResponse } from "../http/httpResponses";
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../../lib/utils/http/HttpResponse";
import { Patient } from "../../lib/models/Patient";
import logger from "../log/logger";
import { getRequestUrl, loggerString, skipPermissionCheck } from "../Helper";
import { Roles } from '../../lib/enums/Roles'

/**
 * This file provides permission middleware for express
 *
 * - checkUserPermission: check if user is allowed to view the endpoint
 * - checkTherapistPermission: check if authUser is a therapist
 * - checkPatientPermission: check if authUser is a patient
 */

/**
 * Middleware that checks if a user is allowed to view the requested endpoint
 * Some endpoints can only be viewed by the user who owns the endpoint
 *
 * Execution of middleware is skipped, if res.locals.user is undefined
 * Execution of middleware is skipped if no user id is present as path variable
 *
 * Unexpected behavior may occur if the middleware is applied to endpoints where
 * there is no user id as a path variable, but an id for another resource
 *
 * params:
 * - id: id of the user
 *
 * @param req
 * @param res
 * @param next
 */
export function checkUserPermission(req: Request, res: Response, next: any) {
    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkUserPermission")}`);

    if (skipPermissionCheck()) {
        logger.warn(`${loggerString(__dirname, "permissionMiddleware", "checkUserPermission")} Checking user permission is skipped!`);
        return next();
    }

    const authUser = res.locals.user;

    if (!authUser) {
        return next();
    }

    if (!req.params.id) {
        return next();
    }

    if (Number(req.params.id) === authUser.id) {
        return next();
    }

    logger.debug(`${loggerString("", "", "", __filename)} User with ${authUser.id} is not allowed to view the endpoint "${getRequestUrl(req)}" of user with id ${req.params.id}!`);

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], 403);
}

/**
 * Middleware that checks if a therapist is allowed to request an endpoint.
 * Execution of middleware is skipped, if res.locals.user is undefined
 *
 * therapists can access specific patients endpoints
 *
 * @param req
 * @param res
 * @param next
 */
export function checkTherapistPermission(req: Request, res: Response, next: any) {
    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistPermission")}`);

    if (skipPermissionCheck()) {
        logger.warn(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistPermission")} Checking therapist permission is skipped!`);
        return next();
    }

    const authUser = res.locals.user;

    if (!authUser) {
       return next();
    }

    if (authUser instanceof Therapist) { // user is therapist
        return next();
    }

    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistPermission")} User with ${req.params.id} is not allowed to view the endpoint "${getRequestUrl(req)}", because he/she is no therapist!`);

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], 403);
}

/**
 * Middleware that checks if a patient is allowed to request an endpoint
 * Execution of middleware is skipped, if res.locals.user is undefined
 *
 * therapists can access specific patients endpoints
 *
 * @param req
 * @param res
 * @param next
 */
export function checkPatientPermission(req: Request, res: Response, next: any) {
    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkPatientPermission")}`);

    if (skipPermissionCheck()) {
        logger.warn(`${loggerString(__dirname, "permissionMiddleware", "checkPatientPermission")} Checking patient permission is skipped!`);
        return next();
    }

    const authUser = res.locals.user;

    if (!authUser) {
        return next();
    }

    if (authUser instanceof Patient) { // user is therapist
        return next();
    }

    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkPatientPermission")} User with id ${authUser.id} is not allowed to view the endpoint "${getRequestUrl(req)}", because he/she is no patient!`);

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], 403);
}

/**
 * Middleware that checks if a therapist is allowed to request an endpoint and if the therapist is an admin.
 * Execution of middleware is skipped, if res.locals.user is undefined
 *
 * admins can access special endpoints
 *
 * @param req
 * @param res
 * @param next
 */
export function checkTherapistAdminPermission(req: Request, res: Response, next: any) {
    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistAdminPermission")}`);

    if (skipPermissionCheck()) {
        logger.warn(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistAdminPermission")} Checking therapist admin permission is skipped!`);
        return next();
    }

    const authUser = res.locals.user;

    if (!authUser) {
        return next();
    }

    console.log(authUser);

    if (authUser instanceof Therapist && authUser.role === Roles.ADMIN) { // user is therapist & admin
        return next();
    }

    logger.debug(`${loggerString(__dirname, "permissionMiddleware", "checkTherapistAdminPermission")} User with id ${authUser.id} is not allowed to view the endpoint "${getRequestUrl(req)}", because he/she is no therapist or admin!`);

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], 403);
}