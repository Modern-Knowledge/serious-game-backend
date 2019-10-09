/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Strategy } from "passport-local";
import { UserFacade } from "../../db/entity/user/UserFacade";
import * as bcrypt from "bcryptjs";

export const passportLocalStrategy = new Strategy({
    usernameField: "email",
    passwordField: "password"
}, (email, password, done) => {
    const userFacade = new UserFacade();
    userFacade.filter.addFilterCondition("email", email);

    // find user
    userFacade.getOne().then(user => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return done(undefined, false, {message: "Wrong credentials!"});
        }

        // user was found
        return done(undefined, user);
    }).catch(done);
});

