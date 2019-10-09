/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import * as jwt from "jsonwebtoken";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { User } from "../lib/models/User";

/**
 * Helper for using jwt functions
 */
export class JWTHelper {

    private readonly _secretKey: string = process.env.SECRET_KEY;
    private _expiresIn: number = 3600; // expires in 1 hour

    /**
     * creates jwt token for user
     *
     * @param user
     */
    public async generateJWT(user: User): Promise<string> {
        const therapistFacade = new TherapistFacade();
        const isTherapist = await therapistFacade.isTherapist(user.id);

        return jwt.sign(
            { id: user.id, email: user.email, therapist: isTherapist},
            this._secretKey,
            {
                expiresIn: this._expiresIn
            }
        );
    }
}
