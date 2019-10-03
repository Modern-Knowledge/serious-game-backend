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
import { Patient } from "../lib/models/Patient";
import logger from "../util/log/logger";
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";
import { loggerString } from "../util/Helper";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../util/http/HttpResponse";
import { check, validationResult } from "express-validator";
import {
    logValidatorErrors,
    retrieveValidationMessage,
    toHttpResponseMessage
} from "../util/validation/validationMessages";
import { emailValidator } from "../util/validation/validators/emailValidator";
import { passwordValidator } from "../util/validation/validators/passwordValidator";
const router = express.Router();

/**
 * GET /
 * Get a therapist by id.
 *
 * todo
 */
router.get("/:id", async (req: Request, res: Response) => {
    res.jsonp("UserController");
});

/**
 * GET /
 * Get all therapists.
 *
 * response:
 * - patients: returns all patients
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const therapistFacade = new TherapistFacade();

    try {
        const therapists = await therapistFacade.get();

        logger.debug(`${loggerString()} GET TherapistController/: Return all therapists!`);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                therapists,
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
 * - auth: is the user authenticated
 * - token: generated jwt token
 * - user: generated therapist
 */
router.post("/", [
    check("email").normalizeEmail()
        .not().isEmpty().withMessage(retrieveValidationMessage("email", "empty"))
        .isEmail().withMessage(retrieveValidationMessage("email", "invalid"))
        .custom(emailValidator),

    check("forename").escape().trim()
        .not().isEmpty().withMessage(retrieveValidationMessage("forename", "empty"))
        .isAlpha().withMessage(retrieveValidationMessage("forename", "non_alpha")),

    check("lastname").escape().trim()
        .not().isEmpty().withMessage(retrieveValidationMessage("lastname", "empty"))
        .isAlpha().withMessage(retrieveValidationMessage("lastname", "non_alpha")),

    check("password").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(retrieveValidationMessage("password", "length"))
        .custom(passwordValidator).withMessage(retrieveValidationMessage("password", "not_matching")),

    check("password_confirmation").trim()
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(retrieveValidationMessage("password", "length")),

    check("therapist").equals("true").withMessage(retrieveValidationMessage("therapist", "value_true"))

], async (req: Request, res: Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logValidatorErrors("POST TherapistController/", errors.array());

        return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL,
            undefined,
            [
                ...toHttpResponseMessage(errors.array())
            ]
        ));
    }

    const therapistFacade = new TherapistFacade();
    const therapist = new Therapist().deserialize(req.body);
    therapist.status = Status.ACTIVE;
    therapist.failedLoginAttempts = 0;

    try {
        const response = await therapistFacade.insertTherapist(therapist);
        const jwtHelper: JWTHelper = new JWTHelper();
        const token = await jwtHelper.signToken(response);

        logger.debug(`${loggerString()} POST TherapistController/: Therapist with id ${response.id} was successfully created!`);

        return res.status(201).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                { auth: true, token: token, user: response },
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
 * PUT /
 * Update a therapist by id.
 */
router.put("/:id", async (req: Request, res: Response) => {
    const therapistFacade = new TherapistFacade();
    const therapistPatientsFacade = new TherapistsPatientsFacade();

    const therapist = new Therapist().deserialize(req.body);
    try {
        const therapistPatient = new TherapistPatient();
        therapistPatient.therapistId = therapist.id;
        await therapistPatientsFacade.syncPatients(therapistPatient);

        for (const patient of therapist.patients) {
            therapistPatient.patientId = patient.id;
            await therapistPatientsFacade.insertTherapistPatient(therapistPatient);
        }
        const filter = therapistFacade.filter;
        filter.addFilterCondition(
            "therapist_id",
            therapist.id,
            SQLComparisonOperator.EQUAL
        );
        await therapistFacade.updateTherapist(therapist);
        return res.status(200).jsonp(therapist);
    } catch (error) {
        return res.status(500).jsonp(error);
    }
});

export default router;
