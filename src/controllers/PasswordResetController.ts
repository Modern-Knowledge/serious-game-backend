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
} from "../util/http/HttpResponse";
import { setPasswordResetToken } from "../util/password/passwordHelper";
import { Mail } from "../util/mail/Mail";
import { passwordReset } from "../mail-texts/passwordReset";
import { mailTransport } from "../util/mail/mailTransport";
import moment from "moment";
import logger from "../util/logger";
import { loggerString } from "../util/Helper";
import { formatDate, formatDateTime } from "../lib/utils/dateFormatter";
import { passwordResettet } from "../mail-texts/passwordResettet";
import {body, check, validationResult} from "express-validator";

const router = express.Router();

/**
 * POST /reset
 * checks if the passed email exists
 * generates reset token
 * send mail with token to user
 */
router.post("/reset", [
    check("email").normalizeEmail().isEmail()
], async (req: Request, res: Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL, {errors: errors.array()}, [new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Übergebene Parameter sind nicht valide!`)]));
    }

    const {email} = req.body;

    const userFacade = new UserFacade();
    userFacade.filter.addFilterCondition("email", email);

    try {
        const user = await userFacade.getOne();

        if (!user) {
            return res.status(404).json(new HttpResponse(HttpResponseStatus.FAIL, undefined, [new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Die E-Mail Adresse ${email} wurde nicht gefunden!`)]));
        }

        // check if token exists
        if (user.resetcode && user.resetcodeValidUntil && !(moment().isAfter(user.resetcodeValidUntil))) {
            logger.info(`${loggerString(__dirname, "PasswordResetController/reset", "")} No password reset token for ${user.email} was generated, because the current token is still valid!`);
        } else {
            // generate token for reset
            setPasswordResetToken(user);

            // async update user with new token
            userFacade.updateUser(user);
        }

        const m = new Mail([user.recipient], passwordReset, [user.fullNameWithSirOrMadam, user.resetcode.toString(), formatDate(user.resetcodeValidUntil)]);
        mailTransport.sendMail(m);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {
                    email: user.email,
                    reset_code: {
                        valid_until: user.resetcodeValidUntil
                    }
                },
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Der Code wurde erfolgreich an ${user.email} gesendet. Geben Sie nun den erhaltenen Code ein!`)]
            )
        );
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /reset-password
 * checks if the passed user exists
 * validates reset token
 * resets passwords
 * sends email to user that password his/her was resettet
 */
router.post("/reset-password",  [
    check("password").isLength({min: 6}),
    check("email").normalizeEmail().isEmail(),
    check("token").isNumeric().isLength({min: 8})
], async (req: Request, res: Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL, {errors: errors.array()}, [new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Übergebene Parameter sind nicht valide!`)]));
    }
    
    const {password, email, token} = req.body;

    const userFacade = new UserFacade();
    userFacade.filter.addFilterCondition("email", email);

    try {
        const user = await userFacade.getOne(email);

        if (!user) {
            return res.status(404).json(new HttpResponse(HttpResponseStatus.FAIL, undefined, [new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Die E-Mail Adresse "${email}" wurde nicht gefunden!`)]));
        }

        // check if token is valid
        if (user.resetcode && user.resetcodeValidUntil) {
            if (user.resetcode !== Number(token)) {
                return res.status(400).json(
                    new HttpResponse(HttpResponseStatus.FAIL,
                        undefined,
                        [
                            new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Der eingegebene Code "${token}" ist nicht korrekt!`)
                        ]
                    )
                );
            } else if (moment().isAfter(user.resetcodeValidUntil)) {
                return res.status(400).json(
                    new HttpResponse(HttpResponseStatus.FAIL,
                        undefined,
                        [
                            new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Der Code "${token}" ist nicht mehr gültig! Fordern Sie einen neuen Code an!`)
                        ]
                    )
                );
            }
        } else {
            return res.status(400).json(
                new HttpResponse(HttpResponseStatus.ERROR,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Für den Account wurde keine Passwort Rücketzung angefordert!`)
                    ]
                )
            );
        }

        user.password = password;
        user.resetcode = undefined;
        user.resetcodeValidUntil = undefined;

        await userFacade.updateUser(user);

        const m = new Mail([user.recipient], passwordResettet, [user.fullNameWithSirOrMadam, formatDateTime(), process.env.SUPPORT_MAIL || ""]);
        mailTransport.sendMail(m);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS, undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Ihr Password wurde erfolgreich geändert!`)]
            )
        );
    } catch (e) {
        return next(e);
    }
});


export default router;
