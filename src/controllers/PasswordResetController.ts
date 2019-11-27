
import * as bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import { check } from "express-validator";
import moment from "moment";
import { UserFacade } from "../db/entity/user/UserFacade";
import { formatDate, formatDateTime } from "../lib/utils/dateFormatter";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { HTTPStatusCode } from "../lib/utils/httpStatusCode";
import { passwordReset } from "../mail-texts/passwordReset";
import { passwordResettet } from "../mail-texts/passwordResettet";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { logEndpoint } from "../util/log/endpointLogger";
import { Mail } from "../util/mail/Mail";
import { mailTransport } from "../util/mail/mailTransport";
import { setPasswordResetToken } from "../util/password/passwordHelper";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { rVM } from "../util/validation/validationMessages";
import {passwordValidator} from "../util/validation/validators/passwordValidator";

const router = express.Router();

const controllerName = "PasswordResetController";

/**
 * /password/reset:
 *      post:
 *          description: Checks if the requesting email exists.
 *          Generates a new reset token if none is set or the current one has expired.
 *          Sends an email with the token to the user
 *          produces:
 *              - application/json
 *          parameters:
 *              - name: email
 *                description: E-Mail of the user, that wants to reset his/her password
 *                in: formData
 *                type: string
 *          responses:
 *              200:
 *                  description: user
 */
router.post("/reset", [
    check("email").normalizeEmail().isEmail().withMessage(rVM("email", "invalid")),
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

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                    `An Ihre E-Mail Adresse ${email} wurde ein Code zum Zurücksetzen des Passworts gesendet!`)
            ], HTTPStatusCode.OK);
        }

        // check if token exists
        if (user.resetcode && user.resetcodeValidUntil && !(moment().isAfter(user.resetcodeValidUntil))) {
            logEndpoint(controllerName,
                `No password reset token for ${user.email} was generated, because the current token is still valid!`,
                req);
        } else {
            // generate token for reset
            setPasswordResetToken(user);

            await userFacade.updateUser(user);

            logEndpoint(controllerName, `Password reset token for user with id ${user.id} was generated!`, req);
        }

        const m = new Mail(
            [user.recipient],
            passwordReset,
            [user.fullNameWithSirOrMadam, user.resetcode.toString(), formatDate(user.resetcodeValidUntil)]
        );
        mailTransport.sendMail(m);

        logEndpoint(controllerName, `Password reset token was successfully sent to user with id ${user.id}!`, req);

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {
                    email: user.email,
                    reset_code: {
                        valid_until: user.resetcodeValidUntil
                    }
                },
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `Der Code wurde erfolgreich an ${user.email} gesendet. Geben Sie nun den erhaltenen Code ein!`)
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
    check("password").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)})
        .withMessage(rVM("password", "length"))
        .custom(passwordValidator).withMessage(rVM("password", "not_matching")),

    check("passwordConfirmation").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)})
        .withMessage(rVM("password", "confirmation")),

    check("email").normalizeEmail()
        .isEmail().withMessage(rVM("email", "invalid")),

    check("token")
        .isNumeric().withMessage(rVM("token", "format"))
        .isLength({min: Number(process.env.PASSWORD_TOKEN_LENGTH)}).withMessage(rVM("token", "length"))
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

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `Ihre E-Mail Adresse "${email}" wurde nicht gefunden!`)
            ]);
        }

        // check if token is valid
        if (user.resetcode && user.resetcodeValidUntil) {
            logEndpoint(controllerName, `Validating password reset token for user with id ${user.id}!`, req);

            if (user.resetcode !== Number(token)) {
                logEndpoint(controllerName, `User with id ${user.id} has passed an invalid password reset token!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                        `Der eingegebene Code "${token}" ist nicht korrekt!`)
                ], 400);

            } else if (moment().isAfter(user.resetcodeValidUntil)) {

                logEndpoint(controllerName,
                    `The password reset token for the user with ${user.id} is not valid anymore! ` +
                    `(expired at ${user.resetcodeValidUntil})`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                        `Der Code "${token}" ist nicht mehr gültig! Fordern Sie einen neuen Code an!`)
                ], 400);
            }
        } else {
            logEndpoint(controllerName, `User with id ${user.id} has not requested a password token!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `Für ihren Account wurde keine Passwort Rücketzung angefordert!`)
            ], 400);
        }

        user.password = bcrypt.hashSync(password, 12);
        user.resetcode = null;
        user.resetcodeValidUntil = null;

        await userFacade.updateUser(user);

        logEndpoint(controllerName, `The new password for user with id ${user.id} has been set!`, req);

        const m = new Mail(
            [user.recipient],
            passwordResettet,
            [user.fullNameWithSirOrMadam, formatDateTime(), process.env.SUPPORT_MAIL || ""]
        );
        mailTransport.sendMail(m);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `Ihr Password wurde erfolgreich geändert!`)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }
});

export default router;
