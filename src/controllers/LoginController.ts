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
import moment from "moment";
import { formatDateTime } from "../lib/utils/dateFormatter";

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

        // check if user is allowed to login
        if (user.loginCoolDown && moment().isBefore(user.loginCoolDown)) { // user is not allowed
            return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.WARNING, `Sie können sich nicht einloggen, da Ihr Account bis aufgrund vieler fehlgeschlagener Loginversuche gesperrt ist. Ihr Account ist ab ${formatDateTime()} wieder freigeschalten.`)
                ]
            ));
        }

        const valid = bcrypt.compareSync(password, user.password);

        if (!valid) {
            const additionalMessages: HttpResponseMessage[] = [];
            user.failedLoginAttempts = user.failedLoginAttempts + 1; // increase failed login attempts

            // lock user if failed login attempts higher > process.env.MAX_FAILED_LOGIN_ATTEMPTS
            if (user.failedLoginAttempts > ( process.env.MAX_FAILED_LOGIN_ATTEMPTS || 10)) {
                user.loginCoolDown = moment().add((Number(process.env.LOGIN_COOLDOWN_TIME_HOURS) || 1) / 3, "hours").toDate();
                additionalMessages.push(new HttpResponseMessage(HttpResponseMessageSeverity.WARNING, `Sie haben zu viele fehlgeschlagene Login-Versuche (${user.failedLoginAttempts}) seit dem letzten erfolgreichen Login. Ihr Account ist bis zum ${formatDateTime(user.loginCoolDown)} gesperrt!`));
            }

            userFacade.updateUser(user);

            return res.status(401).json(new HttpResponse(HttpResponseStatus.FAIL,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihre E-Mail oder Ihr Kennwort ist nicht korrekt!`),
                        ...additionalMessages
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
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Sie haben sich erfolgreich eingeloggt!`)
            ]
        ));
    } catch (error) {
        return next(error);
    }
});

export default router;
