/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express, { Request, Response } from "express";
import { LogFacade } from "../db/entity/log/LogFacade";
import { Log } from "../lib/models/Log";
import { SQLOrder } from "../db/sql/SQLOrder";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import moment from "moment";
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";
import { SmtpLogFacade } from "../db/entity/log/SmtpLogFacade";
import { SQLOperator } from "../db/sql/enums/SQLOperator";

const router = express.Router();

const controllerName = "LoggingController";

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
 * - smtp-logs: all smtp-logs of the application
 */
router.get("/", [
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
                logs,
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
 * - amount of deleted smtp-logs
 */
router.delete("/", [], async (req: Request, res: Response, next: any) => {
    const facade: SmtpLogFacade = new SmtpLogFacade();

    // date 3 months in the past
    const date = moment().subtract(3, "months").toDate();
    facade.filter.addFilterCondition("created_at", date, SQLComparisonOperator.LESS_THAN);

    try {
        const affectedRows = await facade.deleteSmtpLogs();

        logEndpoint(controllerName, `${affectedRows} smtp-logs were deleted!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                affectedRows,
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
