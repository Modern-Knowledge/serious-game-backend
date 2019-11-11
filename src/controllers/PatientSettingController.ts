import express from "express";
import { Request, Response } from "express";
import { check } from "express-validator";
import { PatientSettingFacade } from "../db/entity/settings/PatientSettingFacade";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { failedValidation400Response, forbidden403Response, http4xxResponse } from "../util/http/httpResponses";
import { logEndpoint } from "../util/log/endpointLogger";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkPatientPermission } from "../util/middleware/permissionMiddleware";
import { validatePermission } from "../util/permission/permissionGuard";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { rVM } from "../util/validation/validationMessages";

const router = express.Router();

const controllerName = "PatientSettingController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication, checkPatientPermission];

/**
 * todo: do we need this endpoint
 * GET /
 *
 * Get all patient-settings.
 *
 * response:
 * - patientSettings: all patient-settings of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const patientSettingFacade = new PatientSettingFacade();

    try {
        const patientSettings = await patientSettingFacade.get();

        logEndpoint(controllerName, `Return all patient-settings!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {patientSettings, token: res.locals.authorizationToken},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, "Alle Patienten-Einstellungen erfolgreich geladen!")
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /:id
 *
 * Get a patient-setting by id.
 *
 * params:
 * - id: id of the patient-setting
 *
 * response:
 * - patientSetting: patient-setting that was loaded
 * - token: authentication token
 */
router.get("/:id", authenticationMiddleware, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const patientSettingFacade = new PatientSettingFacade();

    try {
        const patientSetting = await patientSettingFacade.getById(id);

        if (!validatePermission(res.locals.user, [patientSetting])) {
            return forbidden403Response(res);
        }

        if (!patientSetting) {
            logEndpoint(controllerName, `Patient-Setting with id ${id} was not found!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Die Patienten-Einstellung konnte nicht gefunden werden.`)
            ]);
        }

        logEndpoint(controllerName, `Patient-Setting with id ${id} was successfully loaded!`, req);

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {patientSetting, token: res.locals.authorizationToken},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Patienten-Einstellung wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
