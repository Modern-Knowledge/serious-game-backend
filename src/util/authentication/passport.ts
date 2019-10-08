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
            return done(undefined, false, Error("dkfslkdjf"));
        }

        // user was found
        return done(undefined, user);
    }).catch(done);
}));

