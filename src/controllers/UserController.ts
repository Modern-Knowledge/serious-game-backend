import * as bcrypt from "bcryptjs";
import express, {Request, Response} from "express";
import {check} from "express-validator";
import {PatientCompositeFacade} from "../db/composite/PatientCompositeFacade";
import {TherapistFacade} from "../db/entity/user/TherapistFacade";
import {UserFacade} from "../db/entity/user/UserFacade";
import {UserDto} from "../lib/models/Dto/UserDto";
import {Patient} from "../lib/models/Patient";
import {User} from "../lib/models/User";
import {formatDateTime} from "../lib/utils/dateFormatter";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import {passwordResettet} from "../mail-texts/passwordResettet";
import {failedValidation400Response, http4xxResponse} from "../util/http/httpResponses";
import {logEndpoint} from "../util/log/endpointLogger";
import {Mail} from "../util/mail/Mail";
import {mailTransport} from "../util/mail/mailTransport";
import {checkAuthentication, checkAuthenticationToken} from "../util/middleware/authenticationMiddleware";
import {checkUserPermission} from "../util/middleware/permissionMiddleware";
import {checkRouteValidation} from "../util/validation/validationHelper";
import {rVM} from "../util/validation/validationMessages";
import {PatientDto} from "../lib/models/Dto/PatientDto";
import {TherapistDto} from "../lib/models/Dto/TherapistDto";

const router = express.Router();

const controllerName = "UserController";

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

        const patient = res.locals.user instanceof Patient;
        let user;

        let facade;
        if (patient === true) {
            facade = new PatientCompositeFacade();
            facade.withSessionCompositeJoin = false;
            user = new PatientDto(await facade.getById(res.locals.user.id));
        } else {
            facade = new TherapistFacade();
            user = new TherapistDto(await facade.getById(res.locals.user.id));
        }

        console.log(user)

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {user, token: res.locals.authorizationToken}, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, "Benutzer/in erfolgreich geladen!")
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

/**
 * PUT /change-password/:id
 *
 * Changes the password of the user.
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
router.put("/change-password/:id", authenticationMiddleware, checkUserPermission, [
    check("id").isNumeric().withMessage(rVM("id", "numeric")),

    check("oldPassword").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(rVM("password", "old_length")),

    check("newPassword").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(rVM("password", "length")),

    check("newPasswordConfirmation").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(rVM("password", "new_length"))

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const {oldPassword, newPassword, newPasswordConfirmation} = req.body;

    if (newPasswordConfirmation !== newPassword) { // compares passwords
        logEndpoint(controllerName, `New Password and Password confirmation do not match!`, req);

        return http4xxResponse(res, [
            rVM("password", "not_matching")
        ], HTTPStatusCode.BAD_REQUEST);
    }

    const userFacade = new UserFacade();

    try {
        const user = await userFacade.getById(id);

        // check if new password matches old password
        const validPassword = bcrypt.compareSync(oldPassword, user.password);

        if (!validPassword) { // invalid password
            logEndpoint(controllerName, `The user with id ${id} has entered invalid credentials!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Ihr altes Kennwort ist nicht korrekt!`),
            ], HTTPStatusCode.BAD_REQUEST);
        }

        logEndpoint(
            controllerName,
            `The user with the id ${id} provided the correct password for changing the password!`,
            req);

        user.password = bcrypt.hashSync(newPassword, 12); // set new password
        userFacade.filter.addFilterCondition("id", user.id);
        await userFacade.update(user);

        logEndpoint(controllerName, `The new password for user with id ${user.id} has been set!`, req);

        const m = new Mail(
            [user.recipient],
            passwordResettet,
            [user.fullNameWithSirOrMadam, formatDateTime(), process.env.SUPPORT_MAIL || ""]);

        mailTransport.sendMail(m);

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `Ihr Passwort wurde erfolgreich geändert!`, true)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }
});

/**
 * PUT /:id
 *
 * Update a user by id.
 * Updates attributes that therapists and patients have in common.
 *
 * params:
 * - id: user id
 *
 * body:
 * - email: email of the user
 * - forename: forename of user
 * - lastname: lastname of user
 *
 * response:
 * - user: updated user
 * - token: authentication token
 */
router.put("/:id", authenticationMiddleware, checkUserPermission, [
    check("id").isNumeric().withMessage(rVM("id", "numeric")),

    check("_email").normalizeEmail()
        .not().isEmpty().withMessage(rVM("email", "empty"))
        .isEmail().withMessage(rVM("email", "invalid")),

    check("_forename").escape().trim()
        .not().isEmpty().withMessage(rVM("forename", "empty")),

    check("_lastname").escape().trim()
        .not().isEmpty().withMessage(rVM("lastname", "empty")),

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const userFacade = new UserFacade();
    const user = new User().deserialize(req.body);
    user.id = req.params.id;
    userFacade.filter.addFilterCondition("id", user.id);

    const userFacade1 = new UserFacade();
    userFacade1.filter.addFilterCondition("email", user.email);
    const fUser = await userFacade1.getOne();

    if (fUser && fUser.email !== res.locals.user.email) {
        return http4xxResponse(res, [rVM("email", "duplicate")]);
    }

    try {
        const affectedRows = await userFacade.update(user);

        if (affectedRows <= 0) {
            logEndpoint(controllerName, `User with id ${user.id} couldn't be updated!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `BenutzerIn konnte nicht aktualisiert werden!`)
            ]);
        }

        logEndpoint(controllerName, `Updated user with id ${user.id}!`, req);

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {user: new UserDto(user), token: res.locals.authorizationToken}, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `BenutzerIn wurde erfolgreich aktualisiert!`, true)
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

export default router;
