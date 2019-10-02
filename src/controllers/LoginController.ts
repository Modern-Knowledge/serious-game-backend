/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express, { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { UserFacade } from "../db/entity/user/UserFacade";
import { JWTHelper } from "../util/JWTHelper";
import { check, validationResult } from "express-validator";
import { retrieveValidationMessage, toHttpResponseMessage } from "../util/validation/validationMessages";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../util/http/HttpResponse";
import { User } from "../lib/models/User";

const router = express.Router();

/**
 * POST /login
 *
 * Login with email and password.
 *
 * body:
 * - email: email of the user
 * - password: password of the user
 */
router.post("/login", [
    check("password").isLength({min: 6}).withMessage(retrieveValidationMessage("password", "invalid")),
    check("email").normalizeEmail().isEmail().withMessage(retrieveValidationMessage("email", "invalid")),
], async (req: Request, res: Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL,
            undefined,
            [
                ...toHttpResponseMessage(errors.array())
            ]
        ));
    }

    const userFacade = new UserFacade();

    const {email, password} = req.body;

    const filter = userFacade.filter;
    filter.addFilterCondition("email", email);

    try {
        const user: User = await userFacade.getOne();

        if (!user) {
            return res.status(404).json(new HttpResponse(HttpResponseStatus.FAIL,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihre E-Mail Adresse "${email}" wurde nicht gefunden!`)
                ]
            ));
        }

        const valid = bcrypt.compareSync(password, user.password);

        if (!valid) {
            user.failedLoginAttempts = user.failedLoginAttempts + 1; // increase failed login attempts
            userFacade.updateUser(user);



            return res.status(401).json(new HttpResponse(HttpResponseStatus.FAIL,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihre E-Mail oder Ihr Kennwort ist nicht korrekt!`)
                ]
            ));
        }

        const jwtHelper: JWTHelper = new JWTHelper();
        const token = await jwtHelper.signToken(user);

        user.lastLogin = new Date();
        user.failedLoginAttempts = 0;
        user.loginCoolDown = undefined;

        // async update user
        userFacade.updateUser(user);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {auth: true, token: token},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihre E-Mail oder Ihr Kennwort ist nicht korrekt!`)
            ]
        ));
    } catch (error) {
        return next(error);
    }
});

export default router;
