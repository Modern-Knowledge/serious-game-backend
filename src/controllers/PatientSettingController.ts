import express from "express";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { Request, Response } from "express";
import { logEndpoint } from "../util/log/endpointLogger";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { PatientSettingFacade } from "../db/entity/settings/PatientSettingFacade";
import { checkPatientPermission, checkUserPermission } from "../util/middleware/permissionMiddleware";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { failedValidation400Response, forbidden403Response, http4xxResponse } from "../util/http/httpResponses";
import { validatePermission } from "../util/permission/permissionGuard";

const router = express.Router();

const controllerName = "PatientSettingController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication, checkPatientPermission];

/**
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

        if (!validatePermission(res.locals.authorizationToken, patientSettings)) {
            return forbidden403Response(res);
        }

        return res.status(200).json(new HttpResponse(HttpResponseStatus.SUCCESS,
            {patientSettings: patientSettings, token: res.locals.authorizationToken},
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
router.get("/:id", authenticationMiddleware, checkUserPermission, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const patientSettingFacade = new PatientSettingFacade();

    try {
        const patientSetting = await patientSettingFacade.getById(id);

        if (!validatePermission(res.locals.authorizationToken, [patientSetting])) {
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
            {patientSetting: patientSetting, token: res.locals.authorizationToken},
            [
                new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Das Patienten-Einstellung wurde erfolgreich gefunden.`)
            ]
        ));
    } catch (e) {
        return next(e);
    }
});

export default router;
