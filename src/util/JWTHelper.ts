/**
 * Helper for using jwt functions
 */

import * as jwt from "jsonwebtoken";
import { TherapistFacade } from '../db/entity/user/TherapistFacade';
import logger from './logger';
export class JWTHelper {

  private readonly _secretKey: string = process.env.SECRET_KEY;
  private _expiresIn: number = 3600; // expires in 1 hour

  public async signToken(data: any){
    const therapistFacade = new TherapistFacade();
    const isTherapist = await therapistFacade.isTherapist(data.id);
    const token = jwt.sign(
        { id: data.id, email: data.email, therapist: isTherapist},
        this._secretKey,
        {
          expiresIn: this._expiresIn 
        }
      );
    return token;
  }
  public async verifyToken(token: string, cb: jwt.VerifyCallback){
    return jwt.verify(token, this._secretKey, async function(err, decoded){
      return cb(err, decoded);
    });
  }
}
