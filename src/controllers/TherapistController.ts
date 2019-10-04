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
import logger from "../util/log/logger";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { check, validationResult } from "express-validator";
import { retrieveValidationMessage } from "../util/validation/validationMessages";
import { emailValidator } from "../util/validation/validators/emailValidator";
import { passwordValidator } from "../util/validation/validators/passwordValidator";
import { loggerString } from "../util/Helper";
import { TherapistCompositeFacade } from "../db/composite/TherapistCompositeFacade";
import { checkRouteValidation, sendDefault400Response } from "../util/validation/validationHelper";

const router = express.Router();

const controllerName = "TherapistController";


/**
 * GET /
 * Get a therapist by id.
 *
 * todo: needed?
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

    check("therapist").equals("true").withMessage(retrieveValidationMessage("therapist", "value_true"))

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation("TherapistController/", req, res)) {
        return sendDefault400Response(req, res);
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
 * todo: maybe new name for route
 *
 * PUT /:id
 *
 * Update a therapist by id.
 * removes all old patients from therapist
 * add all new patients to therapist
 *
 * params:
 * - id:
 *
 * body:
 * - id:
 * - patients: array of patients
 *
 * response:
 * - therapist: updated therapist
 */
router.put("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation("TherapistController/:id", req, res)) {
        return sendDefault400Response(req, res);
    }

    const therapistFacade = new TherapistFacade();
    const therapistPatientsFacade = new TherapistsPatientsFacade();

    const therapist = new Therapist().deserialize(req.body);
    try {
        const therapistPatient = new TherapistPatient();
        therapistPatient.therapistId = therapist.id;

        // remove all patients from therapist
        await therapistPatientsFacade.syncPatients(therapistPatient);

        logger.debug(`${loggerString()} PUT TherapistController/:id: All patients from therapist with id ${therapist.id} were removed!`);

        // reassign patients
        for (const patient of therapist.patients) {
            therapistPatient.patientId = patient.id;
            await therapistPatientsFacade.insertTherapistPatient(therapistPatient);
        }

        logger.debug(`${loggerString()} PUT TherapistController/:id: Reassigned all patients to the therapist with id ${therapist.id}!`);

        const filter = therapistFacade.filter;
        filter.addFilterCondition("therapist_id", therapist.id);

        await therapistFacade.updateTherapist(therapist);

        logger.debug(`${loggerString()} PUT TherapistController/:id: Updated therapist with id ${therapist.id}`);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                therapist,
                [
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
 */
router.delete("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation("TherapistController/:id", req, res)) {
        return sendDefault400Response(req, res);
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
            logger.debug(`${loggerString()} DELETE TherapistController/:id: Therapist with id ${id} was not found!`);

            return res.status(404).json(
                new HttpResponse(HttpResponseStatus.FAIL,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `TherapeutIn mit ID ${id} wurde nicht gefunden!`)
                    ]
                )
            );
        }

        await therapistCompositeFacade.deleteTherapistComposite();

        logger.debug(`${loggerString()} DELETE TherapistController/:id: Therapist with id ${id} was successfully deleted!`);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `TherapeutIn mit ID ${id} wurde erfolgreich gelöscht!`)
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

export default router;
