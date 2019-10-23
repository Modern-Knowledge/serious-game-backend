

import express from "express";
import { Request, Response } from "express";
import {
    HttpResponse, HttpResponseMessage, HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkTherapistPermission } from "../util/middleware/permissionMiddleware";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { UserFacade } from "../db/entity/user/UserFacade";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import * as bcrypt from "bcryptjs";
import { Mail } from "../util/mail/Mail";
import { passwordResettet } from "../mail-texts/passwordResettet";
import { formatDateTime } from "../lib/utils/dateFormatter";
import { mailTransport } from "../util/mail/mailTransport";

const router = express.Router();

const controllerName = "UserController";

router.use(checkAuthenticationToken);
router.use(checkAuthentication);
router.use(checkTherapistPermission);

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /related
 *
 * Get the user belonging to the sent JWT.
 *
 * response:
 * - user: therapist or patient
 * - token: authentication token
 */
router.get("/related", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    try {
        logEndpoint(controllerName, `Retrieved related user with id ${res.locals.user.id}`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {user: res.locals.user, token: res.locals.authorizationToken}, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, "Benutzer/in erfolgreich geladen!")
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

/**
 * todo validation
 *
 * PUT /change-password/:id
 *
 * params:
 * - id
 *
 * body:
 * - oldPassword
 * - newPassword
 * - newPasswordConfirmation
 *
 * response:
 * - token: authentication token
 */
router.put("/change-password/:id", authenticationMiddleware, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const { oldPassword, newPassword } = req.body;

    const userFacade = new UserFacade();
    userFacade.filter.addFilterCondition("id", id);

    try {
        const user = await userFacade.getById(id);

        if (!user) { // user does not exist
            logEndpoint(controllerName, `User with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `BenutzerIn mit ID ${id} wurde nicht gefunden!`)
            ]);
        }

        // check if new password matches old password
        const validPassword = bcrypt.compareSync(oldPassword, user.password);

        if (!validPassword) { // invalid password
            logEndpoint(controllerName, `The user with id ${id} has entered invalid credentials!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihr altes Kennwort ist nicht korrekt!`),
            ], 401);
        }

        logEndpoint(controllerName, `The user with the id ${id} provided the correct password for changing the password!`, req);

        user.password = bcrypt.hashSync(newPassword, 12); // set new password
        userFacade.updateUser(user);

        logEndpoint(controllerName, `The new password for user with id ${user.id} has been set!`, req);

        const m = new Mail([user.recipient], passwordResettet, [user.fullNameWithSirOrMadam, formatDateTime(), process.env.SUPPORT_MAIL || ""]);
        mailTransport.sendMail(m);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {token: res.locals.authorizationToken},
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
