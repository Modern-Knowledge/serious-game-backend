/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express, { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { UserFacade } from "../db/entity/user/UserFacade";
import { JWTHelper } from "../util/JWTHelper";
import { check } from "express-validator";
import { retrieveValidationMessage } from "../util/validation/validationMessages";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { User } from "../lib/models/User";
import moment from "moment";
import { formatDateTime } from "../lib/utils/dateFormatter";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { logEndpoint } from "../util/log/endpointLogger";
import { http4xxResponse } from "../util/http/httpResponses";

const router = express.Router();

const controllerName = "LoginController";

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

    check("password")
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(retrieveValidationMessage("password", "length")),

    check("email").normalizeEmail()
        .isEmail().withMessage(retrieveValidationMessage("email", "invalid")),

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const userFacade = new UserFacade();

    const {email, password} = req.body;

    const filter = userFacade.filter;
    filter.addFilterCondition("email", email);

    try {
        const user: User = await userFacade.getOne();

        if (!user) {
            logEndpoint(controllerName, `User with e-mail ${email} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ein Konto mit der E-Mail Adresse "${email}" wurde nicht gefunden!`)
            ]);
        }

        // check if user is allowed to login
        if (user.loginCoolDown && moment().isBefore(user.loginCoolDown)) {
            logEndpoint(controllerName, `The account of the user with the id ${user.id} is locked until ${formatDateTime(user.loginCoolDown)}!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.WARNING, `Sie können sich nicht einloggen, da Ihr Account aufgrund vieler fehlgeschlagener Loginversuche gesperrt ist. Ihr Account ist ab ${formatDateTime(user.loginCoolDown)} wieder freigeschalten.`)
            ], 400);
        }

        const valid = bcrypt.compareSync(password, user.password);

        if (!valid) {
            logEndpoint(controllerName, `The user with the id ${user.id} has entered an invalid password!`, req);

            const additionalMessages: HttpResponseMessage[] = [];
            user.failedLoginAttempts = user.failedLoginAttempts + 1; // increase failed login attempts

            const maxFailedLoginAttempts = Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS) || 10;

            // lock user if failed login attempts higher > process.env.MAX_FAILED_LOGIN_ATTEMPTS
            if (user.failedLoginAttempts > maxFailedLoginAttempts) {
                user.loginCoolDown = moment().add((Number(process.env.LOGIN_COOLDOWN_TIME_HOURS) || 1) * maxFailedLoginAttempts / 3, "hours").toDate();

                logEndpoint(controllerName, `The user with the id ${user.id} has more failed login attempts than allowed and is now locked until ${formatDateTime(user.loginCoolDown)}`, req);

                additionalMessages.push(
                    new HttpResponseMessage(HttpResponseMessageSeverity.WARNING,
                    `Sie haben zu viele fehlgeschlagene Login-Versuche (${user.failedLoginAttempts}) seit dem letzten erfolgreichen Login. Ihr Account ist bis zum ${formatDateTime(user.loginCoolDown)} gesperrt!`)
                );
            }

            userFacade.updateUser(user);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihre E-Mail oder Ihr Kennwort ist nicht korrekt!`),
                ...additionalMessages
            ], 401);
        }

        const jwtHelper: JWTHelper = new JWTHelper();
        const token = await jwtHelper.signToken(user);

        user.lastLogin = new Date();
        user.failedLoginAttempts = 0;
        user.loginCoolDown = undefined;

        // async update user
        userFacade.updateUser(user);

        logEndpoint(controllerName, `The user with the id ${user.id} has logged in successfully!`, req);

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
