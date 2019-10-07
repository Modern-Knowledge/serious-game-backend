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
import passport from "passport";
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
    const jwtHelper = new JWTHelper();

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

        // check if user is a therapist -> therapist is allowed to login (accepted == true)
        const therapistFacade = new TherapistFacade();
        therapistFacade.withUserJoin = false;
        const therapist = await therapistFacade.getById(user.id);

        if (therapist && !therapist.accepted) {
            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.WARNING, `Ihr TherapeutInnen Account wurde noch nicht freigeschaltet! Kontaktieren Sie den/die AdministratorIn, damit Sie freigeschaltet werden!`)
            ], 400);
        }

        // check if user is allowed to login (loginCoolDown)
        if (user.loginCoolDown && moment().isBefore(user.loginCoolDown)) {
            logEndpoint(controllerName, `The account of the user with the id ${user.id} is locked until ${formatDateTime(user.loginCoolDown)}!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.WARNING, `Sie können sich nicht einloggen, da Ihr Account aufgrund vieler fehlgeschlagener Loginversuche gesperrt ist. Ihr Account ist ab ${formatDateTime(user.loginCoolDown)} wieder freigeschalten.`)
            ], 400);
        }

        passport.authenticate("local", {session: false}, (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (user) { // user was found
                logEndpoint(controllerName, `The user with the id ${user.id} has logged in successfully!`, req);

                user.lastLogin = new Date();
                user.failedLoginAttempts = 0;
                user.loginCoolDown = undefined;

                // async update user
                userFacade.updateUser(user);

                return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
                    {auth: true, user: jwtHelper.userToAuthJSON(user)},
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Sie haben sich erfolgreich eingeloggt!`)
                    ]
                ));
            } else { // user wasn't found or too many failed Login Attempts
                logEndpoint(controllerName, `The user with the id ${user.id} has entered invalid credentials!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihre E-Mail oder Ihr Kennwort ist nicht korrekt!`),
                    // ...additionalMessages
                ], 400);
            }
        })(req, res, next);
    } catch (error) {
        return next(error);
    }
});

export default router;
