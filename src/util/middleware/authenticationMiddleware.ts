import * as jwt from "jsonwebtoken";
import { User } from "../../lib/models/User";
import { JWTHelper } from "../JWTHelper";
import logger from "../log/logger";
import { loggerString } from "../Helper";
import { ExtractJwt } from "passport-jwt";
import { Request, Response } from "express";
import { formatDateTime } from "../../lib/utils/dateFormatter";
import passport from "passport";
import {
    HttpResponseMessage,
    HttpResponseMessageSeverity,
} from "../../lib/utils/http/HttpResponse";
import { http4xxResponse } from "../http/httpResponses";

/**
 * This file provides authentication middleware for express
 * - checkAuthentication: validates jwt token
 * - checkAuthenticationToken: checks token and refreshes it, if needed
 */


/**
 * Middleware that validates the authorization (checks if user is logged in)
 * returns 401 if authentication is erroneous
 * continues request handling if request is valid
 *
 * @param req
 * @param res
 * @param next
 */
export async function checkAuthentication(req: Request, res: Response, next: any): Promise<void> {
    logger.debug(`${loggerString(__dirname, "authenticationMiddleware", "checkAuthentication")}`);

    passport.authenticate("jwt", { session: false}, (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) { // user does not exist
            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `Verifzierung der Authentifikation ist fehlgeschlagen`)
            ], 401);
        }

        res.locals.user = user;

        return next();
    })(req, req, next);
}

/**
 * Middleware that retrieves the authorization token and refreshes it, if it expires in less than 15 minutes
 * Token gets not refreshed if it is already expired
 * add authorizationToken to request variables
 *
 * @param req
 * @param res
 * @param next
 */
export async function checkAuthenticationToken(req: Request, res: Response, next: any): Promise<void> {
    logger.debug(`${loggerString(__dirname, "authenticationMiddleware", "checkAuthenticationToken")}`);

    const orgToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req); // retrieve token

    if (orgToken) { // check if token exists
        const refreshedToken = await refreshToken(orgToken);

        if (!refreshedToken) {
            return next();
        }

        if (orgToken !== refreshedToken) { // token has changed -> change authorization header
            req.headers["authorization"] = "Bearer " + refreshedToken;
        }

        res.locals.authorizationToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    }

    return next();
}



/**
 * checks is passed jwt-token is valid
 * if token is already expired -> if expired return passed token
 * if token expires in less than 15 minutes -> refresh token for another hour
 * if token expires in more than 15 minutes -> return passed token
 */
export async function refreshToken(token: string): Promise<string> {
    const decodedToken = jwt.decode(token, {complete: true});
    console.log(decodedToken);
    if (!decodedToken) { // token is invalid
        return undefined;
    }
    // @ts-ignore
    const payload = decodedToken.payload;

    const expireTime = payload.exp;
    const currentTime = Math.trunc(Date.now() / 1000);

    if (currentTime > expireTime) { // token expired -> return old token
        logger.debug(`${loggerString("", "", "", __filename)} Token for user with id ${payload.id} has expired at ${formatDateTime(new Date(expireTime * 1000))}!`);

        return token;
    }

    const interval = 60 * 15; // 15 minutes

    // if token expires in less than 15 minutes -> extend expire-time for one hour
    if (Math.abs(expireTime - currentTime) < interval) {
        logger.debug(`${loggerString("", "", "", __filename)} Token for user with id ${payload.id} expires at ${formatDateTime(new Date(expireTime * 1000))}. Token gets refreshed for another hour!`);

        const user = new User();
        user.id = payload.id;
        user.email = payload.email;

        const jwtHelper = new JWTHelper();

        return await jwtHelper.generateJWT(user);
    }

    logger.debug(`${loggerString("", "", "", __filename)} Token for user with id ${payload.id} is valid until ${formatDateTime(new Date(expireTime * 1000))}`);

    return token;
}