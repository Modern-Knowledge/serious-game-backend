/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { JWTHelper } from "../util/JWTHelper";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { Therapist } from "../lib/models/Therapist";
import { TherapistsPatientsFacade } from "../db/entity/user/TherapistsPatientsFacade";
import { Status } from "../lib/enums/Status";
import { TherapistPatient } from "../lib/models/TherapistPatient";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { emailValidator } from "../util/validation/validators/emailValidator";
import { passwordValidator } from "../util/validation/validators/passwordValidator";
import { TherapistCompositeFacade } from "../db/composite/TherapistCompositeFacade";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { logEndpoint } from "../util/log/endpointLogger";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import * as bcrypt from "bcryptjs";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import {
    checkTherapistAdminPermission,
    checkTherapistPermission,
    checkUserPermission
} from "../util/middleware/permissionMiddleware";

const router = express.Router();

const controllerName = "TherapistController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication, checkTherapistPermission];

/**
 * GET /
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

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {therapists: therapists, token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Alle TherapeutInnen wurden erfolgreich geladen!`)
                ]
            )
        );
    } catch (error) {
       return next(error);
    }
});

/**
 * POST /
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

    try {
        const response = await therapistFacade.insertTherapist(therapist);

        const jwtHelper: JWTHelper = new JWTHelper();
        const token = await jwtHelper.generateJWT(response);

        logEndpoint(controllerName, `Therapist with id ${response.id} was successfully created!`, req);

        return res.status(201).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                { user: response, token: token},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Account wurde erfolgreich angelegt!`)
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

/**
 * todo: validation
 *
 * PUT /:id
 *
 * Update a therapist by id.
 * removes all old patients from therapist
 * add all new patients to therapist
 *
 * params:
 * - id: therapist id
 *
 * body:
 * - id: therapist id
 * - patients: array of patients
 *
 * response:
 * - therapist: updated therapist
 * - token: authentication token
 */
router.put("/:id", authenticationMiddleware, checkUserPermission, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const therapistFacade = new TherapistFacade();
    const therapistPatientsFacade = new TherapistsPatientsFacade();

    const therapist = new Therapist().deserialize(req.body);
    try {
        const therapistPatient = new TherapistPatient();
        therapistPatient.therapistId = therapist.id;

        // remove all patients from therapist
        await therapistPatientsFacade.syncPatients(therapistPatient);

        logEndpoint(controllerName, `All patients from therapist with id ${therapist.id} were removed!`, req);

        // reassign patients
        for (const patient of therapist.patients) {
            therapistPatient.patientId = patient.id;
            await therapistPatientsFacade.insertTherapistPatient(therapistPatient);
        }

        logEndpoint(controllerName, `Reassigned all patients to the therapist with id ${therapist.id}!`, req);

        const filter = therapistFacade.filter;
        filter.addFilterCondition("therapist_id", therapist.id);

        await therapistFacade.updateTherapist(therapist);

        logEndpoint(controllerName, `Updated therapist with id ${therapist.id}!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {therapist: therapist, token: res.locals.authorizationToken}, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `TherapeutIn wurde erfolgreich aktualisiert!`)
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
 * deletes the given therapist, the user and removes the connection to the patients
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

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);

    const therapistCompositeFacade = new TherapistCompositeFacade();
    therapistCompositeFacade.filter.addFilterCondition("therapist_id", id);
    therapistCompositeFacade.therapistUserFacadeFilter.addFilterCondition("id", id);
    therapistCompositeFacade.therapistPatientFacadeFilter.addFilterCondition("therapist_id", id);

    const therapistFacade = new TherapistFacade();

    try {
        const therapist = await therapistFacade.isTherapist(id);

        // check if user is therapist
        if (!therapist) {
            logEndpoint(controllerName, `Therapist with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `TherapeutIn mit ID ${id} wurde nicht gefunden!`)
            ]);
        }

        await therapistCompositeFacade.deleteTherapistComposite();

        logEndpoint(controllerName, `Therapist with id ${id} was successfully deleted!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `TherapeutIn mit ID ${id} wurde erfolgreich gelöscht!`)
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
 * accepts / disallows therapist
 * therapist needs to be accepted before the login is allowed
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
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `TherapeutIn mit ID ${id} wurde nicht gefunden!`)
            ]);
        }

        // toggle therapist accepted
        therapist.accepted = !therapist.accepted;

        const affectedRows = await therapistFacade.updateTherapist(therapist);
        // no rows were updated
        if (affectedRows <= 0) {
           return next(new Error("TherapeutIn konnte nicht aktualisiert werden"));
        }

        logEndpoint(controllerName, `Therapist with id ${id} was ${therapist.accepted ? "accepted" : "not accepted"}`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `TherapeutIn mit ID ${id} wurde ${therapist.accepted ? "akzeptiert" : "abgelehnt"}!`)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }

});

export default router;
