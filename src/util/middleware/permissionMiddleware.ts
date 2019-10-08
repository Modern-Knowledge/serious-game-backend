import { User } from "../../lib/models/User";
import { Therapist } from "../../lib/models/Therapist";
import { Request, Response } from "express";
import { http4xxResponse } from "../http/httpResponses";
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../../lib/utils/http/HttpResponse";


/**
 * Middleware that checks if a user is allowed to view the requested endpoint
 * user can only view/edit his personal endpoints
 *
 * @param req
 * @param res
 * @param next
 */
export function checkUserPermission(req: Request, res: Response, next: any): void {
    const authUser = res.locals.user;

    // todo replace with real values
    const requestingUser = new User();
    requestingUser.id = 1;


    const error = new Error("Operation is not permitted!");
    return next(error);
}

/**
 * Middleware that checks if a therapist is allowed to request the endpoint
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