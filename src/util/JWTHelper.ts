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
     * @deprecated
     * signs the jwt token
     * @param data data to sing
     */
    public async signToken(data: any) {
        const therapistFacade = new TherapistFacade();
        const isTherapist = await therapistFacade.isTherapist(data.id);
        return jwt.sign(
            { id: data.id, email: data.email, therapist: isTherapist},
            this._secretKey,
            {
                expiresIn: this._expiresIn
            }
        );
    }

    /**
     * @deprecated
     * validates token}
     * @param token token to verify
     * @param cb callback to get the decoded token on
     */
    public async verifyToken(token: string, cb: jwt.VerifyCallback) {
        return jwt.verify(token, this._secretKey, async function(err, decoded) {
            return cb(err, decoded);
        });
    }

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
