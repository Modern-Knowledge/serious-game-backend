import * as jwt from "jsonwebtoken";

import {Roles} from "serious-game-library/dist/enums/Roles";
import {User} from "serious-game-library/dist/models/User";
import {TherapistFacade} from "../db/entity/user/TherapistFacade";

/**
 * Helper for jwt-functions.
 */
export class JWTHelper {

    private readonly _secretKey: string = process.env.SECRET_KEY;
    private _expiresIn: number = Number(process.env.TOKEN_EXPIRE_TIME) || 3600;

    /**
     * Creates the jwt-token for the given user. Checks if the user is a therapist.
     *
     * @param user user that should be authenticated
     * @param loggedIn signals that the user wants to stay signed in
     */
    public async generateJWT(user: User, loggedIn: boolean = false): Promise<string> {
        const therapistFacade = new TherapistFacade();
        const therapist = await therapistFacade.getById(user.id);
        const isTherapist = therapist !== undefined;
        const isAdmin = therapist !== undefined && therapist.role === Roles.ADMIN;

        const expiresIn = loggedIn ? 31536000 : this._expiresIn;

        return jwt.sign(
            {id: user.id, email: user.email, therapist: isTherapist, admin: isAdmin},
            this._secretKey,
            {
                expiresIn
            }
        );
    }
}
