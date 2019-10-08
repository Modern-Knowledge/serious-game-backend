import { Strategy, ExtractJwt, StrategyOptions, JwtFromRequestFunction } from "passport-jwt";
import { UserFacade } from "../../db/entity/user/UserFacade";
import logger from "../log/logger";
import { loggerString } from "../Helper";

const options: StrategyOptions = {
    secretOrKey: process.env.SECRET_KEY,
    jwtFromRequest:  ExtractJwt.fromAuthHeaderAsBearerToken()
};

/**
 * https://github.com/mikenicholson/passport-jwt
 *
 * passport for verifying jwt token in request header
 */
export const jwtStrategy =  new Strategy(options, (payload, done) => {
    const userFacade = new UserFacade();
    const id = payload.id;

    userFacade.getById(id).then(user => {
        if (!user) { // user not found
            logger.debug(`${loggerString("", "", "", __filename)} Token for user with id ${user.id} was not correct!`);
            return done(undefined, false);
        }

        logger.debug(`${loggerString("", "", "", __filename)} Token for user with id ${user.id} was correct!`);

        // token verified
        return done(undefined, user, {message: "Token ist gültig!"});
    }).catch(done);
});

