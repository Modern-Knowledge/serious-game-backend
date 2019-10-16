/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express, { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { UserFacade } from "../db/entity/user/UserFacade";
import { JWTHelper } from "../util/JWTHelper";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { User } from "../lib/models/User";
import moment from "moment";
import { formatDateTime } from "../lib/utils/dateFormatter";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { logEndpoint } from "../util/log/endpointLogger";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";

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
 *
 * response:
 * - user: authenticated user
 * - token: jwt token
 */
router.post("/login", [

    check("password")
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(rVM("password", "length")),

    check("email").normalizeEmail()
        .isEmail().withMessage(rVM("email", "invalid")),

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const userFacade = new UserFacade();
    const jwtHelper = new JWTHelper();

    const {email, password} = req.body;

    const filter = userFacade.filter;
    filter.addFilterCondition("email", email);

    try {
        const reqUser: User = await userFacade.getOne();

        if (!reqUser) { // user not found
            logEndpoint(controllerName, `User with e-mail ${email} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `E-Mail Adresse oder Passwort falsch!`)
            ]);
        }

        // check if user is a therapist -> therapist is allowed to login (accepted == true)
        const therapistFacade = new TherapistFacade();
        therapistFacade.withUserJoin = false;
        therapistFacade.filter.addFilterCondition("therapist_id", reqUser.id);

        const therapist = await therapistFacade.getOne();

        if (therapist && !therapist.accepted) {
            logEndpoint(controllerName, `Therapist with id ${reqUser.id} tried to login, but is not accepted!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.WARNING, `Ihr TherapeutInnen Account wurde noch nicht freigeschaltet! Kontaktieren Sie den/die AdministratorIn, damit Sie freigeschaltet werden!`)
            ], 400);
        }

        // check if user is allowed to login (loginCoolDown)
        if (reqUser.loginCoolDown && moment().isBefore(reqUser.loginCoolDown)) {
            logEndpoint(controllerName, `The account of the user with the id ${reqUser.id} is locked until ${formatDateTime(reqUser.loginCoolDown)}!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.WARNING, `Sie können sich nicht einloggen, da Ihr Account aufgrund vieler fehlgeschlagener Loginversuche gesperrt ist. Ihr Account ist ab ${formatDateTime(reqUser.loginCoolDown)} wieder freigeschalten.`)
            ], 400);
        }

        // compare passwords
        const valid = bcrypt.compareSync(password, reqUser.password);

        if (!valid) { // invalid password
            logEndpoint(controllerName, `The user with id ${reqUser.id} has entered invalid credentials!`, req);

            // check failed login attempts
            const additionalMessages: HttpResponseMessage[] = [];
            reqUser.failedLoginAttempts = reqUser.failedLoginAttempts + 1; // increase failed login attempts

            const maxFailedLoginAttempts = Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS) || 10;

            if (reqUser.failedLoginAttempts > maxFailedLoginAttempts) { // lock user
                reqUser.loginCoolDown = moment().add((Number(process.env.LOGIN_COOLDOWN_TIME_HOURS) || 1) * maxFailedLoginAttempts / 3, "hours").toDate();
                logEndpoint(controllerName, `The account of the user with the id ${reqUser.id} has too many failed login attempts and gets locked until ${formatDateTime(reqUser.loginCoolDown)}`, req);

                additionalMessages.push(
                    new HttpResponseMessage(HttpResponseMessageSeverity.WARNING,
                        `Sie haben zu viele fehlgeschlagene Login-Versuche (${reqUser.failedLoginAttempts}) seit dem letzten erfolgreichen Login. Ihr Account ist bis zum ${formatDateTime(reqUser.loginCoolDown)} gesperrt!`)
                );
            }

            userFacade.updateUser(reqUser); // increase failed login attempts

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihre E-Mail oder Ihr Kennwort ist nicht korrekt!`),
                ...additionalMessages
            ], 401);
        }

        logEndpoint(controllerName, `The user with the id ${reqUser.id} has logged in successfully!`, req);

        reqUser.lastLogin = new Date();
        reqUser.failedLoginAttempts = 0;
        reqUser.loginCoolDown = undefined;

        // async update user
        userFacade.updateUser(reqUser);

        const token = await jwtHelper.generateJWT(reqUser);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {user: reqUser, token: token},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Sie haben sich erfolgreich eingeloggt!`)
            ]
        ));

    } catch (error) {
        return next(error);
    }
});


export default router;
