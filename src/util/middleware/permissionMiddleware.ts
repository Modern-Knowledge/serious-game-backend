import { User } from "../../lib/models/User";
import { TherapistFacade } from "../../db/entity/user/TherapistFacade";
import { Therapist } from "../../lib/models/Therapist";

/**
 * Middleware that checks if the user is allowed to view the requested endpoint
 * user can only view/edit his personal endpoints
 *
 * @param req
 * @param res
 * @param next
 */
export function checkUserPermission(req: Request, res: Response, next: any) {

    // todo replace with real values
    const requestingUser = new User();
    requestingUser.id = 1;
    const authenicatedUser = new User();
    authenicatedUser.id = 1;

    if (requestingUser.id == authenicatedUser.id) {
        return next();
    }

    const error = new Error("Operation is not permitted!");
    return next(error);
}

/**
 * Middleware that checks if the therapist is allowed to request the endpoint
 * therapists can access patients endpoints
 *
 * @param req
 * @param res
 * @param next
 */
export function checkTherapistPermission(req: Request, res: Response, next: any) {

    // todo replace with real values
    const requestingUser = new Therapist();
    requestingUser.id = 1;
    const authenicatedUser = new Therapist();
    authenicatedUser.id = 1;

    const therapistFacade = new TherapistFacade();

    therapistFacade.isTherapist(requestingUser.id).then(value => {
        if (value) {
            return next();
        }

        const error = new Error("Operation is not permitted!");
        return next(error);

    }).catch(next);
}