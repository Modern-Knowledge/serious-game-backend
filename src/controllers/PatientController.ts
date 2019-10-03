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
import {
    logValidatorErrors,
    retrieveValidationMessage,
    toHttpResponseMessage
} from "../util/validation/validationMessages";
import { passwordValidator } from "../util/validation/validators/passwordValidator";
import { emailValidator } from "../util/validation/validators/emailValidator";
const router = express.Router();

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

        logger.debug(`${loggerString()} GET PatientController/: Return all patients!`);

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

    check("therapist").equals("false").withMessage(retrieveValidationMessage("therapist", "value_false"))

], async (req: Request, res: Response, next: any) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logValidatorErrors("POST PatientController/", errors.array());

        return res.status(400).json(new HttpResponse(HttpResponseStatus.FAIL,
            undefined,
            [
                ...toHttpResponseMessage(errors.array())
            ]
        ));
    }

    const patientFacade = new PatientFacade();
    const patient = new Patient().deserialize(req.body);
    patient.status = Status.ACTIVE;
    patient.failedLoginAttempts = 0;

    try {
        const response = await patientFacade.insertPatient(patient);
        const jwtHelper: JWTHelper = new JWTHelper();
        const token = await jwtHelper.signToken(response);

        logger.debug(`${loggerString()} POST PatientController/: Patient with id ${response.id} was successfully created!`);

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

export default router;
