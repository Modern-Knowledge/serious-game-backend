/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express, { Request, Response } from "express";
import { UserFacade } from "../db/entity/user/UserFacade";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { setPasswordResetToken } from "../util/password/passwordHelper";
import { Mail } from "../util/mail/Mail";
import { passwordReset } from "../mail-texts/passwordReset";
import { mailTransport } from "../util/mail/mailTransport";
import moment from "moment";
import logger from "../util/log/logger";
import { loggerString } from "../util/Helper";
import { formatDate, formatDateTime } from "../lib/utils/dateFormatter";
import { passwordResettet } from "../mail-texts/passwordResettet";
import { check, validationResult } from "express-validator";
import { retrieveValidationMessage } from "../util/validation/validationMessages";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { logEndpoint } from "../util/log/endpointLogger";

const router = express.Router();

const controllerName = "PasswordResetController";

/**
 * POST /reset
 *
 * checks if the passed email exists
 * generates reset token
 * send mail with token to user
 *
 * body:
 * - email: email of the user that wants to change his/her password
 */
router.post("/reset", [
    check("email").normalizeEmail().isEmail().withMessage(retrieveValidationMessage("email", "invalid")),
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const {email} = req.body;

    const userFacade = new UserFacade();
    userFacade.filter.addFilterCondition("email", email);

    try {
        const user = await userFacade.getOne();

        if (!user) {
            logEndpoint(controllerName, `User with e-mail ${email} was not found!`, req);

            return res.status(404).json(
                new HttpResponse(HttpResponseStatus.FAIL,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihre E-Mail Adresse ${email} wurde nicht gefunden!`)
                    ]
                ));
        }

        // check if token exists
        if (user.resetcode && user.resetcodeValidUntil && !(moment().isAfter(user.resetcodeValidUntil))) {
            logEndpoint(controllerName, `No password reset token for ${user.email} was generated, because the current token is still valid!`, req);
        } else {
            // generate token for reset
            setPasswordResetToken(user);

            // async update user with new token
            userFacade.updateUser(user);

            logEndpoint(controllerName, `Password reset token for user with id ${user.id} was generated!`, req);
        }

        const m = new Mail([user.recipient], passwordReset, [user.fullNameWithSirOrMadam, user.resetcode.toString(), formatDate(user.resetcodeValidUntil)]);
        mailTransport.sendMail(m);

        logEndpoint(controllerName, `Password reset token was successfully sent to user with id ${user.id}!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {
                    email: user.email,
                    reset_code: {
                        valid_until: user.resetcodeValidUntil
                    }
                },
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Der Code wurde erfolgreich an ${user.email} gesendet. Geben Sie nun den erhaltenen Code ein!`)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /reset-password
 *
 * checks if the passed email exists
 * validates reset token
 * resets passwords
 * sends email to user that his/her password was resettet
 *
 * body:
 * - password: new password for the user
 * - email: email of the user that wants to change his/her password
 * - token: token for resetting the password
 */
router.post("/reset-password",  [
    check("password")
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(retrieveValidationMessage("password", "length")),

    check("email").normalizeEmail()
        .isEmail().withMessage(retrieveValidationMessage("email", "invalid")),

    check("token")
        .isNumeric().withMessage(retrieveValidationMessage("token", "format"))
        .isLength({min: Number(process.env.PASSWORD_TOKEN_LENGTH)}).withMessage(retrieveValidationMessage("token", "length"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const {password, email, token} = req.body;

    const userFacade = new UserFacade();
    userFacade.filter.addFilterCondition("email", email);

    try {
        const user = await userFacade.getOne(email);

        if (!user) {
            logEndpoint(controllerName, `User with e-mail ${email} was not found!`, req);

            return res.status(404).json(new HttpResponse(HttpResponseStatus.FAIL,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihre E-Mail Adresse "${email}" wurde nicht gefunden!`)
                ]
            ));
        }

        // check if token is valid
        if (user.resetcode && user.resetcodeValidUntil) {
            logEndpoint(controllerName, `Validating password reset token for user with id ${user.id}!`, req);

            if (user.resetcode !== Number(token)) {
                logEndpoint(controllerName, `User with id ${user.id} has passed an invalid password reset token!`, req);

                return res.status(400).json(
                    new HttpResponse(HttpResponseStatus.FAIL,
                        undefined,
                        [
                            new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Der eingegebene Code "${token}" ist nicht korrekt!`)
                        ]
                    ));
            } else if (moment().isAfter(user.resetcodeValidUntil)) {
                logEndpoint(controllerName, `The password reset token for the user with ${user.id} is not valid anymore! (expired at ${user.resetcodeValidUntil})`, req);

                return res.status(400).json(
                    new HttpResponse(HttpResponseStatus.FAIL,
                        undefined,
                        [
                            new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Der Code "${token}" ist nicht mehr gültig! Fordern Sie einen neuen Code an!`)
                        ]
                    ));
            }
        } else {
            logEndpoint(controllerName, `User with id ${user.id} has not requested a password token!`, req);

            return res.status(400).json(
                new HttpResponse(HttpResponseStatus.FAIL,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Für ihren Account wurde keine Passwort Rücketzung angefordert!`)
                    ]
                ));
        }

        user.password = password;
        user.resetcode = undefined;
        user.resetcodeValidUntil = undefined;

        await userFacade.updateUser(user);

        logEndpoint(controllerName, `The new Password for user with id ${user.id} has been set!`, req);

        const m = new Mail([user.recipient], passwordResettet, [user.fullNameWithSirOrMadam, formatDateTime(), process.env.SUPPORT_MAIL || ""]);
        mailTransport.sendMail(m);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Ihr Password wurde erfolgreich geändert!`)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }
});


export default router;
