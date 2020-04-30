import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import passport from "passport";
import { ExtractJwt } from "passport-jwt";
import { User } from "serious-game-library/dist/models/User";
import { formatDateTime } from "serious-game-library/dist/utils/dateFormatter";
import {
    HttpResponseMessage,
    HttpResponseMessageSeverity,
} from "serious-game-library/dist/utils/http/HttpResponse";
import {HTTPStatusCode} from "serious-game-library/dist/utils/httpStatusCode";
import { loggerString } from "../Helper";
import { http4xxResponse } from "../http/httpResponses";
import { JWTHelper } from "../JWTHelper";
import logger from "../log/logger";

/**
 * This file provides authentication middleware for express:
 *
 * - checkAuthentication: Validates jwt-token.
 * - checkAuthenticationToken: Checks token and refreshes it, if the token expires soon.
 */

/**
 * Middleware that validates the authorization (checks if user is logged in), before requesting an endpoint.
 * Returns 401 if authentication can't be validated.
 *
 * @param req request
 * @param res response
 * @param next next middleware
 */
export async function checkAuthentication(req: Request, res: Response, next: any): Promise<void> {
    logger.debug(`${loggerString(__dirname, "authenticationMiddleware", "checkAuthentication")}`);

    passport.authenticate("jwt", { session: false}, (err, user) => {
        if (err) {
            return next(err);
        }

        if (!user) { // user does not exist
            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `Verifzierung der Authentifikation ist fehlgeschlagen!`)
            ], HTTPStatusCode.UNAUTHORIZED);
        }

        res.locals.user = user;

        return next();
    })(req, req, next);
}

/**
 * Middleware that retrieves the authorization token and refreshes it, if it expires in less than 15 minutes.
 * Token gets not refreshed if it is already expired.
 * Add the authorization-token to the request.
 *
 * @param req request
 * @param res response
 * @param next next middleware
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
            req.headers.authorization = "Bearer " + refreshedToken;
        }

        res.locals.authorizationToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    }

    return next();
}

/**
 * Checks is passed jwt-token is valid.
 * If token is already expired, do not refresh token.
 * If token expires in less than 15 minutes, refresh token for another hour.
 * If token expires in more than 15 minutes, token do not need to be refreshed.
 */
export async function refreshToken(token: string): Promise<string> {
    const decodedToken = jwt.decode(token, {complete: true});

    if (!decodedToken) { // token is invalid
        return undefined;
    }
    // @ts-ignore
    const payload = decodedToken.payload;

    const expireTime = payload.exp;
    const currentTime = Math.trunc(Date.now() / 1000);

    if (currentTime > expireTime) { // token expired -> return old token
        logger.debug(`${loggerString("", "", "", __filename)} ` +
            `Token for user with id ${payload.id} has expired at ${formatDateTime(new Date(expireTime * 1000))}!`);

        return token;
    }

    const interval = 60 * 15; // 15 minutes

    // if token expires in less than 15 minutes -> extend expire-time for one hour
    if (Math.abs(expireTime - currentTime) < interval) {
        logger.debug(`${loggerString("", "", "", __filename)} ` +
            `Token for user with id ${payload.id} expires at ${formatDateTime(new Date(expireTime * 1000))}. ` +
            `Token gets refreshed for another hour!`);

        const user = new User();
        user.id = payload.id;
        user.email = payload.email;

        const jwtHelper = new JWTHelper();

        return await jwtHelper.generateJWT(user);
    }

    logger.debug(`${loggerString("", "", "", __filename)} ` +
        `Token for user with id ${payload.id} is valid until ${formatDateTime(new Date(expireTime * 1000))}`);

    return token;
}
