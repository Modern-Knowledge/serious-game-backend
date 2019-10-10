import { User } from "../../lib/models/User";
import { Response } from "express";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../../lib/utils/http/HttpResponse";
import { UserInterface } from "../../lib/interfaces/UserInterface";

/**
 * functions to check permissions in routes
 */

/**
 * checks if the authUser is allowed to view/edit the specified resources
 * retrieves the user id from the resource and compare it the the auth user
 *
 * @param authUser
 * @param resources
 */
export function validatePermission(authUser: User, ...resources: UserInterface[]): boolean {
    for (const item of resources) { // checks every resource
        if (item.getUserId && authUser.id !== item.getUserId()) { // check if user id is the same as the resources user id
            return false;
        }
    }

    return true;
}

/**
 * todo: move httpresponses.ts
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