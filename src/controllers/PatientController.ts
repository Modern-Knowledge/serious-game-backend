

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
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { passwordValidator } from "../util/validation/validators/passwordValidator";
import { emailValidator } from "../util/validation/validators/emailValidator";
import { PatientCompositeFacade } from "../db/composite/PatientCompositeFacade";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { logEndpoint } from "../util/log/endpointLogger";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { PatientSettingFacade } from "../db/entity/settings/PatientSettingFacade";
import { PatientSetting } from "../lib/models/PatientSetting";
import * as bcrypt from "bcryptjs";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkPatientPermission, checkUserPermission } from "../util/middleware/permissionMiddleware";

const router = express.Router();

const controllerName = "PatientController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 * Get all patients.
 *
 * response:
 * - patients: all patients of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const patientFacade = new PatientFacade();

    try {
        const patients = await patientFacade.get();

        logEndpoint(controllerName, `Return all patients!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {patients: patients, token: res.locals.authorizationToken} ,
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
 *
 * Inserts a patient and inserts patient settings
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
 * - token: generated authentication token
 * - user: generated therapist
 * - patient_setting: patient settings
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
        .isLength({min: Number(process.env.PASSWORD_LENGTH)}).withMessage(rVM("password", "length")),

    check("therapist").equals("false").withMessage(rVM("therapist", "value_false"))

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const patientFacade = new PatientFacade();
    const patient = new Patient().deserialize(req.body);
    patient.status = Status.ACTIVE;
    patient.failedLoginAttempts = 0;
    patient.password = bcrypt.hashSync(patient.password, 12);


    const patientSettingFacade = new PatientSettingFacade();
    const patientSetting = new PatientSetting();

    try {
        const createdPatient = await patientFacade.insertPatient(patient);

        patientSetting.patientId = createdPatient.id;

        // insert patient settings
        const createdPatientSetting = await patientSettingFacade.insertPatientSetting(patientSetting);

        const jwtHelper: JWTHelper = new JWTHelper();
        const token = await jwtHelper.generateJWT(createdPatient);

        logEndpoint(controllerName, `Patient with id ${createdPatient.id} was successfully created!`, req);

        return res.status(201).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                { token: token, user: createdPatient, patient_setting: createdPatientSetting },
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
 * - token: authentication token
 */
router.delete("/:id", authenticationMiddleware, checkUserPermission, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
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

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `PatientIn mit ID ${id} wurde nicht gefunden!`)
            ]);
        }

        await patientCompositeFacade.deletePatientComposite();

        logEndpoint(controllerName, `Patient with id ${id} was successfully deleted!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `PatientIn mit ID ${id} wurde erfolgreich gelöscht!`)
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
 * PUT :/id
 *
 * Update a patient by id
 *
 * params:
 * - id: id of the patient
 *
 * body:
 * - email: email of the patient
 * - forename: forename of the patient
 * - lastname: lastname of the patient
 * - info: info about the patient
 *
 * response:
 * - patient: updated patient
 * - token: authentication token
 */
router.put("/:id", authenticationMiddleware, checkPatientPermission, [
    check("id").isNumeric().withMessage(rVM("id", "numeric")),

    check("_email").normalizeEmail()
        .not().isEmpty().withMessage(rVM("email", "empty"))
        .isEmail().withMessage(rVM("email", "invalid"))
        .custom(emailValidator),

    check("_forename").escape().trim()
        .not().isEmpty().withMessage(rVM("forename", "empty")),

    check("_lastname").escape().trim()
        .not().isEmpty().withMessage(rVM("lastname", "empty")),

    check("_info").escape().trim()
        .not().isEmpty().withMessage(rVM("info", "empty")),

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);

    const patientFacade = new PatientFacade();
    patientFacade.filter.addFilterCondition("id", id);

    const patient = new Patient().deserialize(req.body);
    try {
        const dbPatient = await patientFacade.isPatient(id);

        if (!dbPatient) {
            logEndpoint(controllerName, `Patient with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `PatientIn mit ID ${id} wurde nicht gefunden!`)
            ]);
        }

        const affectedRows = await patientFacade.updateUserPatient(patient);

        if (affectedRows <= 0) { // no rows were updated
            logEndpoint(controllerName, `Patient with id ${id} couldn't be updated`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `PatientIn mit ID ${id} konnte nicht aktualisiert werden!`)
            ], 400);
        }

        logEndpoint(controllerName, `Patient with id ${id} was successfully updated!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {patient: patient, token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `PatientIn mit ID ${id} wurde erfolgreich aktualisiert!`)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }
});



export default router;
