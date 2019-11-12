import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import { PatientCompositeFacade } from "../../db/composite/PatientCompositeFacade";
import { TherapistCompositeFacade } from "../../db/composite/TherapistCompositeFacade";
import { loggerString } from "../Helper";
import logger from "../log/logger";

const options: StrategyOptions = {
    jwtFromRequest:  ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY
};

/**
 * https://github.com/mikenicholson/passport-jwt
 *
 * passport for verifying jwt token in request header
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
