/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import passport from "passport";
import { Strategy } from "passport-local";
import { UserFacade } from "../../db/entity/user/UserFacade";
import * as bcrypt from "bcryptjs";

passport.use(new Strategy({
    usernameField: "user[email]",
    passwordField: "user[password]"
}, (email, password, done) => {
    const userFacade = new UserFacade();
    userFacade.filter.addFilterCondition("email", email);

    // find user
    userFacade.getOne().then(user => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return done(undefined, false);
        }

        return done(undefined, user);
    }).catch(done);
}));

