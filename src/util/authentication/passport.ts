/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import passport from "passport";
import { Strategy } from "passport-local";
import { UserFacade } from "../../db/entity/user/UserFacade";
import * as bcrypt from "bcryptjs";
import { HttpResponseMessage, HttpResponseMessageSeverity } from "../../lib/utils/http/HttpResponse";
import moment from "moment";
import { logEndpoint } from "../log/endpointLogger";
import { formatDateTime } from "../../lib/utils/dateFormatter";
import logger from "../log/logger";

passport.use(new Strategy({
    usernameField: "email",
    passwordField: "password"
}, (email, password, done) => {
    const userFacade = new UserFacade();
    userFacade.filter.addFilterCondition("email", email);

    // find user
    userFacade.getOne().then(user => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return done(undefined, false);
        }

        // user was found

        // check failed login attempts
        const additionalMessages: HttpResponseMessage[] = [];
        user.failedLoginAttempts = user.failedLoginAttempts + 1; // increase failed login attempts

        const maxFailedLoginAttempts = Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS) || 10;

        // lock user if failed login attempts higher > process.env.MAX_FAILED_LOGIN_ATTEMPTS
        if (user.failedLoginAttempts > maxFailedLoginAttempts) {
            user.loginCoolDown = moment().add((Number(process.env.LOGIN_COOLDOWN_TIME_HOURS) || 1) * maxFailedLoginAttempts / 3, "hours").toDate();

            additionalMessages.push(
                new HttpResponseMessage(HttpResponseMessageSeverity.WARNING,
                    `Sie haben zu viele fehlgeschlagene Login-Versuche (${user.failedLoginAttempts}) seit dem letzten erfolgreichen Login. Ihr Account ist bis zum ${formatDateTime(user.loginCoolDown)} gesperrt!`)
            );

            userFacade.updateUser(user);

            return done(undefined, false);
        }

        return done(undefined, user);
    }).catch(done);
}));

