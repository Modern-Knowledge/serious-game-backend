

import express, { Request, Response } from "express";
import { LogFacade } from "../db/entity/log/LogFacade";
import { Log } from "../lib/models/Log";
import { SQLOrder } from "../db/sql/enums/SQLOrder";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import moment from "moment";
import { SQLComparisonOperator } from "../db/sql/enums/SQLComparisonOperator";
import { SmtpLogFacade } from "../db/entity/log/SmtpLogFacade";
import { SQLOperator } from "../db/sql/enums/SQLOperator";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkTherapistAdminPermission } from "../util/middleware/permissionMiddleware";

const router = express.Router();

const controllerName = "SmtpLoggingController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 *
 * Get all smtp-logs.
 *
 * body:
 * - simulated: load only simulated mails (optional)
 * - sent: load only sent mails (optional)
 *
 * response:
 * - logs: all smtp-logs of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, checkTherapistAdminPermission, [
    // todo: validation if needed
], async (req: Request, res: Response, next: any) => {
    const facade: SmtpLogFacade = new SmtpLogFacade();

    if (req.body.simulated) {
        facade.filter.addFilterCondition("simulated", Number(req.body.simulated));
    }

    if (req.body.sent) {
        if (!facade.filter.isEmpty) {
            facade.filter.addOperator(SQLOperator.AND);
        }

        facade.filter.addFilterCondition("sent", Number(req.body.sent));
    }

    facade.addOrderBy("id", SQLOrder.ASC);

    try {
        const logs = await facade.get();

        logEndpoint(controllerName, `All smtp-logs loaded successfully!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {logs: logs, token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `SMTP-Logs erfolgreich geladen!`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

/**
 * DELETE /
 *
 * deletes smtp-logs older than 3 months
 *
 * response:
 * - affectedRows: amount of deleted smtp-logs
 * - token: authentication token
 */
router.delete("/", authenticationMiddleware, checkTherapistAdminPermission, async (req: Request, res: Response, next: any) => {
    const facade: SmtpLogFacade = new SmtpLogFacade();

    // date 3 months in the past
    const date = moment().subtract(3, "months").toDate();
    facade.filter.addFilterCondition("created_at", date, SQLComparisonOperator.LESS_THAN);

    try {
        const affectedRows = await facade.deleteSmtpLogs();

        logEndpoint(controllerName, `${affectedRows} smtp-logs were deleted!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {affectedRows: affectedRows, token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `${affectedRows} SMTP-Logs wurden erfolgreich gelöscht!`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});


export default router;
