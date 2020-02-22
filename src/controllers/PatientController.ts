import * as bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import { check } from "express-validator";

import { PatientCompositeFacade } from "../db/composite/PatientCompositeFacade";
import { PatientSettingFacade } from "../db/entity/settings/PatientSettingFacade";
import { PatientFacade } from "../db/entity/user/PatientFacade";
import {UserFacade} from "../db/entity/user/UserFacade";
import { Status } from "../lib/enums/Status";
import { PatientDto } from "../lib/models/Dto/PatientDto";
import { Patient } from "../lib/models/Patient";
import { PatientSetting } from "../lib/models/PatientSetting";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus,
} from "../lib/utils/http/HttpResponse";
import { HTTPStatusCode } from "../lib/utils/httpStatusCode";
import { register } from "../mail-texts/register";
import { failedValidation400Response, http4xxResponse } from "../util/http/httpResponses";
import { JWTHelper } from "../util/JWTHelper";
import { logEndpoint } from "../util/log/endpointLogger";
import { Mail } from "../util/mail/Mail";
import { mailTransport } from "../util/mail/mailTransport";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkPatientPermission, checkUserPermission } from "../util/middleware/permissionMiddleware";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { rVM } from "../util/validation/validationMessages";
import { emailValidator } from "../util/validation/validators/emailValidator";
import { passwordValidator } from "../util/validation/validators/passwordValidator";

const router = express.Router();

const controllerName = "PatientController";

const authenticationMiddleware = [
    checkAuthenticationToken,
    checkAuthentication
];

/**
 * GET /
 *
 * Get all patients.
 *
 * response:
 * - patients: all patients of the application
 * - token: authentication token
 */
router.get(
    "/",
    authenticationMiddleware,
    async (req: Request, res: Response, next: any) => {
        const patientFacade = new PatientFacade();

        try {
            const patients = await patientFacade.get();

            logEndpoint(controllerName, `Return all patients!`, req);

            const patientsDto = patients.map(
                (value: Patient) => new PatientDto(value)
            );

            return res.status(HTTPStatusCode.OK).json(
                new HttpResponse(
                    HttpResponseStatus.SUCCESS,
                    {
                        patients: patientsDto,
                        token: res.locals.authorizationToken
                    },
                    [
                        new HttpResponseMessage(
                            HttpResponseMessageSeverity.SUCCESS,
                            `Alle PatientInnen wurden erfolgreich geladen!`
                        )
                    ]
                )
            );
        } catch (error) {
            return next(error);
        }
    }
);

/**
 * POST /
 *
 * Inserts a patient and inserts patient-settings.
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
router.post(
    "/",
    [
        check("_email")
            .normalizeEmail()
            .not()
            .isEmpty()
            .withMessage(rVM("email", "empty"))
            .isEmail()
            .withMessage(rVM("email", "invalid"))
            .custom(emailValidator),

        check("_forename")
            .escape()
            .trim()
            .not()
            .isEmpty()
            .withMessage(rVM("forename", "empty")),

        check("_lastname")
            .escape()
            .trim()
            .not()
            .isEmpty()
            .withMessage(rVM("lastname", "empty")),

        check("_password")
            .trim()
            .isLength({ min: Number(process.env.PASSWORD_LENGTH) })
            .withMessage(rVM("password", "length"))
            .custom(passwordValidator)
            .withMessage(rVM("password", "not_matching")),

        check("password_confirmation")
            .trim()
            .isLength({ min: Number(process.env.PASSWORD_LENGTH) })
            .withMessage(rVM("password", "length")),

        check("therapist")
            .equals("false")
            .withMessage(rVM("therapist", "value_false"))
    ],
    async (req: Request, res: Response, next: any) => {
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
            const createdPatient = await patientFacade.insert(patient);

            patientSetting.patientId = createdPatient.id;

            // insert patient settings
            const createdPatientSetting = await patientSettingFacade.insert(
                patientSetting
            );

            createdPatient.patientSetting = createdPatientSetting;

            const jwtHelper: JWTHelper = new JWTHelper();
            const token = await jwtHelper.generateJWT(createdPatient);

            const m = new Mail([createdPatient.recipient], register, [
                createdPatient.fullNameWithSirOrMadam
            ]);
            mailTransport.sendMail(m);

            logEndpoint(
                controllerName,
                `Patient with id ${createdPatient.id} was successfully created!`,
                req
            );

            return res.status(HTTPStatusCode.CREATED).json(
                new HttpResponse(
                    HttpResponseStatus.SUCCESS,
                    {
                        patient_setting: createdPatientSetting,
                        token,
                        user: new PatientDto(createdPatient)
                    },
                    [
                        new HttpResponseMessage(
                            HttpResponseMessageSeverity.SUCCESS,
                            `Account wurde erfolgreich angelegt!`,
                            true
                        )
                    ]
                )
            );
        } catch (error) {
            return next(error);
        }
    }
);

/**
 *
 * DELETE /:id
 *
 * Deletes the given patient, the user, the sessions, patient_settings and the connection to the therapists.
 *
 * params:
 * - id: id of the patient
 *
 * response:
 * - token: authentication token
 */
router.delete(
    "/:id",
    authenticationMiddleware,
    checkUserPermission,
    [
        check("id")
            .isNumeric()
            .withMessage(rVM("id", "numeric"))
    ],
    async (req: Request, res: Response, next: any) => {
        const id = Number(req.params.id);

        const patientCompositeFacade = new PatientCompositeFacade();
        patientCompositeFacade.filter.addFilterCondition("patient_id", id);
        patientCompositeFacade.patientUserFacadeFilter.addFilterCondition(
            "id",
            id
        );
        patientCompositeFacade.patientSettingFacadeFilter.addFilterCondition(
            "patient_id",
            id
        );
        patientCompositeFacade.sessionFacadeFilter.addFilterCondition(
            "patient_id",
            id
        );
        patientCompositeFacade.therapistPatientFacadeFilter.addFilterCondition(
            "patient_id",
            id
        );

        try {
            await patientCompositeFacade.delete();

            logEndpoint(
                controllerName,
                `Patient with id ${id} was successfully deleted!`,
                req
            );

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        { token: res.locals.authorizationToken },
                        [
                            new HttpResponseMessage(
                                HttpResponseMessageSeverity.SUCCESS,
                                `PatientIn mit ID ${id} wurde erfolgreich gelöscht!`
                            )
                        ]
                    )
                );
        } catch (error) {
            return next(error);
        }
    }
);

/**
 * PUT :/id
 *
 * Update a patient by id.
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
router.put(
    "/:id",
    authenticationMiddleware,
    checkPatientPermission,
    [
        check("id")
            .isNumeric()
            .withMessage(rVM("id", "numeric")),

        check("_email")
            .normalizeEmail()
            .not()
            .isEmpty()
            .withMessage(rVM("email", "empty"))
            .isEmail()
            .withMessage(rVM("email", "invalid")),

        check("_forename")
            .escape()
            .trim()
            .not()
            .isEmpty()
            .withMessage(rVM("forename", "empty")),

        check("_lastname")
            .escape()
            .trim()
            .not()
            .isEmpty()
            .withMessage(rVM("lastname", "empty")),

        check("_birthday")
            .escape()
            .trim()
            .toDate(),

        check("_info")
            .escape()
            .trim()
            .not()
            .isEmpty()
            .withMessage(rVM("info", "empty"))
    ],
    async (req: Request, res: Response, next: any) => {
        if (!checkRouteValidation(controllerName, req, res)) {
            return failedValidation400Response(req, res);
        }

        const id = Number(req.params.id);

        const patientFacade = new PatientFacade();
        const patientSettingFacade = new PatientSettingFacade();
        const patient = new Patient().deserialize(req.body);
        const patientSetting = new PatientSetting().deserialize(
            req.body._patientSetting
        );

        const userFacade1 = new UserFacade();
        userFacade1.filter.addFilterCondition("email", patient.email);
        const fUser = await userFacade1.getOne();

        if (fUser && fUser.email !== res.locals.user.email) {
            return http4xxResponse(res, [rVM("email", "duplicate")], 400);
        }

        try {
            const dbPatient = await patientFacade.isPatient(id);

            if (!dbPatient) {
                logEndpoint(
                    controllerName,
                    `Patient with id ${id} was not found!`,
                    req
                );

                return http4xxResponse(res, [
                    new HttpResponseMessage(
                        HttpResponseMessageSeverity.DANGER,
                        `PatientIn mit ID ${id} wurde nicht gefunden!`
                    )
                ]);
            }

            patient.id = id;

            const filter = patientFacade.filter;
            filter.addFilterCondition("patient_id", patient.id);
            patientFacade.userFacadeFilter.addFilterCondition("id", patient.id);

            patientSettingFacade.filter.addFilterCondition(
                "id",
                patientSetting.id
            );

            await patientFacade.updateUserPatient(patient);

            await patientSettingFacade.update(patientSetting);

            logEndpoint(
                controllerName,
                `Patient with id ${id} was successfully updated!`,
                req
            );
            return res.status(HTTPStatusCode.OK).json(
                new HttpResponse(
                    HttpResponseStatus.SUCCESS,
                    {
                        patient: new PatientDto(patient),
                        token: res.locals.authorizationToken
                    },
                    [
                        new HttpResponseMessage(
                            HttpResponseMessageSeverity.SUCCESS,
                            `PatientIn mit ID ${id} wurde erfolgreich aktualisiert!`
                        )
                    ]
                )
            );
        } catch (e) {
            return next(e);
        }
    }
);

export default router;
