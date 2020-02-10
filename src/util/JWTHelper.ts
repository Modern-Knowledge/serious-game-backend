
import * as jwt from "jsonwebtoken";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import {Roles} from "../lib/enums/Roles";
import { User } from "../lib/models/User";

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
     */
    public async generateJWT(user: User): Promise<string> {
        const therapistFacade = new TherapistFacade();
        const therapist = await therapistFacade.getById(user.id);
        const isTherapist = therapist !== undefined;
        const isAdmin = therapist !== undefined && therapist.role === Roles.ADMIN;

        return jwt.sign(
            { id: user.id, email: user.email, therapist: isTherapist, admin: isAdmin},
            this._secretKey,
            {
                expiresIn: this._expiresIn
            }
        );
    }
}
