import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import { PatientCompositeFacade } from "../../db/composite/PatientCompositeFacade";
import { TherapistCompositeFacade } from "../../db/composite/TherapistCompositeFacade";
import { loggerString } from "../Helper";
import logger from "../log/logger";

/**
 * Options for jwt-strategy.
 */
const options: StrategyOptions = {
    jwtFromRequest:  ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY
};

/**
 * Gets the token from the authorization header. Checks if the token is valid.
 * Checks if the user that is contained in the token exists. Returns an error
 * if one of the errors occur.
 *
 * https://github.com/mikenicholson/passport-jwt
 */
export const jwtStrategy =  new Strategy(options, (payload, done) => {
    const userFacade = payload.therapist ? new TherapistCompositeFacade() : new PatientCompositeFacade();
    const id = payload.id;

    // @ts-ignore
    userFacade.getById(id).then((user) => {
        if (!user) { // user not found
            logger.debug(`${loggerString("", "", "", __filename)} Token for user with id ${id} was not correct!`);
            return done(undefined, false);
        }

        logger.debug(`${loggerString("", "", "", __filename)} Token for user with id ${user.id} was correct!`);

        // token verified
        return done(undefined, user, {message: "Token ist gültig!"});
    }).catch(done);
});
