import { Therapist } from "../../lib/models/Therapist";
import { Request, Response } from "express";
import { http4xxResponse } from "../http/httpResponses";
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../../lib/utils/http/HttpResponse";
import { Patient } from "../../lib/models/Patient";

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
 * middleware is skipped if no user id is present as path variable
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
    const authUser = res.locals.user;

    if (!req.params.id) {
        return next();
    }
    if (req.params.id === authUser.id) {
        return next();
    }

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], 400);
}

/**
 * Middleware that checks if a therapist is allowed to request an endpoint
 *
 * therapists can access specific patients endpoints
 *
 * @param req
 * @param res
 * @param next
 */
export function checkTherapistPermission(req: Request, res: Response, next: any) {
    const authUser = res.locals.user;

    if (authUser instanceof Therapist) { // user is therapist
        return next();
    }

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], 400);
}

/**
 * Middleware that checks if a patient is allowed to request an endpoint
 *
 * @param req
 * @param res
 * @param next
 */
export function checkPatientPermission(req: Request, res: Response, next: any) {
    const authUser = res.locals.user;

    if (authUser instanceof Patient) { // user is therapist
        return next();
    }

    return http4xxResponse(res, [
        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Sie dürfen diese Aktion nicht durchführen!`)
    ], 400);
}