
import * as bcrypt from "bcryptjs";
import { Request, Response } from "express";
import express from "express";
import { check } from "express-validator";
import { TherapistCompositeFacade } from "../db/composite/TherapistCompositeFacade";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { TherapistsPatientsFacade } from "../db/entity/user/TherapistsPatientsFacade";
import {UserFacade} from "../db/entity/user/UserFacade";
import {Roles} from "../lib/enums/Roles";
import { Status } from "../lib/enums/Status";
import {TherapistDto} from "../lib/models/Dto/TherapistDto";
import { Therapist } from "../lib/models/Therapist";
import { TherapistPatient } from "../lib/models/TherapistPatient";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import {register} from "../mail-texts/register";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { JWTHelper } from "../util/JWTHelper";
import { logEndpoint } from "../util/log/endpointLogger";
import {Mail} from "../util/mail/Mail";
import {mailTransport} from "../util/mail/mailTransport";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import {
    checkTherapistAdminPermission,
    checkTherapistPermission,
    checkUserPermission
} from "../util/middleware/permissionMiddleware";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { rVM } from "../util/validation/validationMessages";
import { emailValidator } from "../util/validation/validators/emailValidator";
import { passwordValidator } from "../util/validation/validators/passwordValidator";

const router = express.Router();

const controllerName = "TherapistController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication, checkTherapistPermission];

/**
 * GET /
 *
 * Get all therapists.
 *
 * response:
 * - therapists: returns all therapists
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const therapistFacade = new TherapistFacade();

    try {
        const therapists = await therapistFacade.get();

        logEndpoint(controllerName, `Return all therapists!`, req);

        const therapistsDto = therapists.map((value: Therapist) => new TherapistDto(value));

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {therapists: therapistsDto, token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `Alle TherapeutInnen wurden erfolgreich geladen!`)
                ]
            )
        );
    } catch (error) {
       return next(error);
    }
});

/**
 * POST /
 *
 * Insert a therapist.
 *
 * body:
 * - email
 * - gender
 * - forename
 * - lastname
 * - password
 * - password_confirmation
 * - therapist: true
 *
 * response:
 * - token: generated authentication token
 * - user: generated therapist
 */
router.post("/", [
    check("_email").normalizeEmail()
        .not().isEmpty().withMessage(rVM("email", "empty"))
        .isEmail().withMessage(rVM("email", "invalid"))
        .custom(emailValidator),

    check("_forename").escape().trim()
        .not().isEmpty().withMessage(rVM("forename", "empty")),

    check("_lastname").escape().trim()
        .not().isEmpty().withMessage(rVM("lastname", "empty")),

    check("_password").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(rVM("password", "length"))
        .custom(passwordValidator).withMessage(rVM("password", "not_matching")),

    check("password_confirmation").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(rVM("password", "confirmation")),

    check("therapist").equals("true").withMessage(rVM("therapist", "value_true"))

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const therapistFacade = new TherapistFacade();
    const therapist = new Therapist().deserialize(req.body);
    therapist.status = Status.ACTIVE;
    therapist.failedLoginAttempts = 0;
    therapist.password = bcrypt.hashSync(therapist.password, 12);
    therapist.accepted = false;
    therapist.role = Roles.USER;

    try {
        const response = await therapistFacade.insert(therapist);

        const jwtHelper: JWTHelper = new JWTHelper();
        const token = await jwtHelper.generateJWT(response);

        logEndpoint(controllerName, `Therapist with id ${response.id} was successfully created!`, req);

        const m = new Mail(
            [response.recipient],
            register,
            [response.fullNameWithSirOrMadam]
        );
        mailTransport.sendMail(m);

        return res.status(HTTPStatusCode.CREATED).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                { user: new TherapistDto(response), token},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Account wurde erfolgreich angelegt!`,
                        true)
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

/**
 * PUT /:id
 *
 * Updates a therapist by id.
 * Removes all patients from therapist and adds
 * new patients to therapist.
 *
 * params:
 * - id: therapist id
 *
 * body:
 * - email: email of therapist
 * - forename: forename of therapist
 * - lastname: lastname of therapists
 * - patients: array of patients
 *
 * response:
 * - therapist: updated therapist
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

    check("_patients.*._id")
        .not().isEmpty().withMessage(rVM("patient", "invalid")),

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const therapistFacade = new TherapistFacade();
    const therapistPatientsFacade = new TherapistsPatientsFacade();

    const therapist = new Therapist().deserialize(req.body);

    const userFacade1 = new UserFacade();
    userFacade1.filter.addFilterCondition("email", therapist.email);
    const fUser = await userFacade1.getOne();

    if (fUser && fUser.email !== res.locals.user.email) {
        return http4xxResponse(res, [rVM("email", "duplicate")], 400);
    }

    try {
        therapist.id = req.params.id;

        const therapistPatient = new TherapistPatient();
        therapistPatient.therapistId = therapist.id;

        // remove all patients from therapist
        await therapistPatientsFacade.syncPatients(therapistPatient);

        logEndpoint(controllerName, `All patients from therapist with id ${therapist.id} were removed!`, req);

        // reassign patients
        for (const patient of therapist.patients) {
            therapistPatient.patientId = patient.id;
            await therapistPatientsFacade.insert(therapistPatient);
        }

        logEndpoint(controllerName, `Reassigned all patients to the therapist with id ${therapist.id}!`, req);

        const filter = therapistFacade.filter;
        filter.addFilterCondition("therapist_id", therapist.id);
        therapistFacade.userFacadeFilter.addFilterCondition("id", therapist.id);

        await therapistFacade.updateUserTherapist(therapist);

        logEndpoint(controllerName, `Updated therapist with id ${therapist.id}!`, req);

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {therapist: new TherapistDto(therapist), token: res.locals.authorizationToken}, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `TherapeutIn wurde erfolgreich aktualisiert!`, true)
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

/**
 *
 * DELETE /:id
 *
 * Deletes the given therapist, the user and
 * removes the connection to the patients.
 *
 * params:
 * - id: id of the therapist
 *
 * response:
 * - token: authentication token
 */
router.delete("/:id", authenticationMiddleware, checkUserPermission, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    const id = Number(req.params.id);

    const therapistCompositeFacade = new TherapistCompositeFacade();
    therapistCompositeFacade.filter.addFilterCondition("therapist_id", id);
    therapistCompositeFacade.therapistUserFacadeFilter.addFilterCondition("id", id);
    therapistCompositeFacade.therapistPatientFacadeFilter.addFilterCondition("therapist_id", id);

    try {
        await therapistCompositeFacade.delete();

        logEndpoint(controllerName, `Therapist with id ${id} was successfully deleted!`, req);

        return res.status(HTTPStatusCode.CREATED).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `TherapeutIn mit ID ${id} wurde erfolgreich gelöscht!`)
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

/**
 * PUT /toggle-accepted/:id
 *
 * Accepts / Disallows therapist.
 * Therapists need to be accepted before loggin in is allowed.
 *
 * params:
 * - id: id of the therapist
 *
 * response:
 * - token: authentication token
 */
router.put("/toggle-accepted/:id", authenticationMiddleware, checkTherapistAdminPermission, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);

    const therapistFacade = new TherapistFacade();
    therapistFacade.filter.addFilterCondition("therapist_id", id);

    try {
        const therapist = await therapistFacade.getById(id);

        if (!therapist) {
            logEndpoint(controllerName, `Therapist with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                    `TherapeutIn mit ID ${id} wurde nicht gefunden!`)
            ]);
        }

        // toggle therapist accepted
        therapist.accepted = !therapist.accepted;

        await therapistFacade.update(therapist);

        logEndpoint(
            controllerName,
            `Therapist with id ${id} was ${therapist.accepted ? "accepted" : "not accepted"}`,
            req);

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `TherapeutIn mit ID ${id} wurde ${therapist.accepted ? "akzeptiert" : "abgelehnt"}!`)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }

});

export default router;
