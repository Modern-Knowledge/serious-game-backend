/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { PatientFacade } from "../db/entity/user/PatientFacade";
import { Patient } from "../lib/models/Patient";
import { Status } from "../lib/enums/Status";
import { JWTHelper } from "../util/JWTHelper";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import logger from "../util/log/logger";
import { loggerString } from "../util/Helper";
import { check, validationResult } from "express-validator";
import { retrieveValidationMessage } from "../util/validation/validationMessages";
import { passwordValidator } from "../util/validation/validators/passwordValidator";
import { emailValidator } from "../util/validation/validators/emailValidator";
import { PatientCompositeFacade } from "../db/composite/PatientCompositeFacade";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { logEndpoint } from "../util/log/endpointLogger";

const router = express.Router();

const controllerName = "PatientController";

/**
 * GET /
 * Get patient by id.
 *
 * todo
 */
router.get("/:id", async (req: Request, res: Response) => {
    res.jsonp("UserController");
});

/**
 * GET /
 * Get all patients.
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const patientFacade = new PatientFacade();

    try {
        const patients = await patientFacade.get();

        logEndpoint(controllerName, `Return all patients!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                patients,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Alle PatientInnen wurden erfolgreich geladen!`)
                ]
            )
        );
    }
    catch (error) {
       return next(error);
    }

});

/**
 * POST /
 * Inserts a patient.
 *
 * body:
 * - email
 * - gender
 * - forename
 * - lastname
 * - password
 * - password_confirmation
 * - therapist: false
 *
 * response:
 * - auth: is the user authenticated
 * - token: generated jwt token
 * - user: generated therapist
 */
router.post("/", [
    check("_email").normalizeEmail()
        .not().isEmpty().withMessage(retrieveValidationMessage("email", "empty"))
        .isEmail().withMessage(retrieveValidationMessage("email", "invalid"))
        .custom(emailValidator),

    check("_forename").escape().trim()
        .not().isEmpty().withMessage(retrieveValidationMessage("forename", "empty"))
        .isAlpha().withMessage(retrieveValidationMessage("forename", "non_alpha")),

    check("_lastname").escape().trim()
        .not().isEmpty().withMessage(retrieveValidationMessage("lastname", "empty"))
        .isAlpha().withMessage(retrieveValidationMessage("lastname", "non_alpha")),

    check("_password").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(retrieveValidationMessage("password", "length"))
        .custom(passwordValidator).withMessage(retrieveValidationMessage("password", "not_matching")),

    check("password_confirmation").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(retrieveValidationMessage("password", "length")),

    check("therapist").equals("false").withMessage(retrieveValidationMessage("therapist", "value_false"))

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const patientFacade = new PatientFacade();
    const patient = new Patient().deserialize(req.body);
    patient.status = Status.ACTIVE;
    patient.failedLoginAttempts = 0;

    try {
        const response = await patientFacade.insertPatient(patient);
        const jwtHelper: JWTHelper = new JWTHelper();
        const token = await jwtHelper.signToken(response);

        logEndpoint(controllerName, `Patient with id ${response.id} was successfully created!`, req);

        return res.status(201).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                { auth: true, token: token, user: response },
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Account wurde erfolgreich angelegt!`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

/**
 *
 * DELETE /:id
 *
 * deletes the given patient, the user, the sessions, patient_settings and the connection to the therapists
 *
 * params:
 * - id: id of the patient
 *
 * response:
 */
router.delete("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);

    const patientCompositeFacade = new PatientCompositeFacade();
    patientCompositeFacade.filter.addFilterCondition("patient_id", id);
    patientCompositeFacade.patientUserFacadeFilter.addFilterCondition("id", id);
    patientCompositeFacade.patientSettingFacadeFilter.addFilterCondition("patient_id", id);
    patientCompositeFacade.sessionFacadeFilter.addFilterCondition("patient_id", id);
    patientCompositeFacade.therapistPatientFacadeFilter.addFilterCondition("patient_id", id);

    const patientFacade = new PatientFacade();

    try {

        const patient = await patientFacade.isPatient(id);
        // check if user is therapist
        if (!patient) {
            logEndpoint(controllerName, `Patient with id ${id} was not found!`, req);

            return res.status(404).json(
                new HttpResponse(HttpResponseStatus.FAIL,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `PatientIn mit ID ${id} wurde nicht gefunden!`)
                    ]
                )
            );
        }

        await patientCompositeFacade.deletePatientComposite();

        logEndpoint(controllerName, `Patient with id ${id} was successfully deleted!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `PatientIn mit ID ${id} wurde erfolgreich gelöscht!`)
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

export default router;
