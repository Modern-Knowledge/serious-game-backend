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

const router = express.Router();

/**
 * POST /reset
 * checks if the passed email exists
 * generates reset token
 * send mail with token to user
 */
router.post("/reset", async (req: Request, res: Response, next: any) => {
    const { email } = req.body;

    const userFacade = new UserFacade();
    userFacade.filter.addFilterCondition("email", email);

    try {
        const users = await userFacade.get();

        let user;
        if (users.length === 0) {
            res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL, undefined, [new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Die E-Mail Adresse ${email} wurde nicht gefunden!`)]));
        }
        user = users[0];

        // check if token exists
        if (user.resetcode && user.resetcodeValidUntil && !(moment().isAfter(user.resetcodeValidUntil))) {
            logger.info(`${loggerString(__dirname, "PasswordResetController/reset", "")} No password reset token for ${user.email} was generated, because the current token is still valid!`);
        } else {
            // generate token for reset
            setPasswordResetToken(user);

            // async update user with new token
            userFacade.updateUser(user);
        }

        const m = new Mail([user.recipient], passwordReset, [user.fullNameWithSirOrMadam, user.resetcode.toString(), user.resetcodeValidUntil.toDateString()]);
        mailTransport.sendMail(m);

        res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {
                    reset_code: {
                        valid_until: user.resetcodeValidUntil
                    }
                },
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Der Code wurde erfolgreich an ${user.email} gesendet. Geben Sie nun den erhaltenen Code ein!`)]
            )
        );
        next();
    } catch (e) {
        next(e);
    }
});


export default router;
