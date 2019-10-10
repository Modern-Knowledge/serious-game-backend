/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

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
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";

const router = express.Router();

const controllerName = "LoggingController";

/**
 * GET /
 *
 * Get all logs.
 *
 * response:
 * - logs: all logs of the application
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const facade: LogFacade = new LogFacade();
    facade.addOrderBy("id", SQLOrder.ASC);

    try {
        const logs = await facade.get();

        logEndpoint(controllerName, `All logs loaded successfully!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                logs
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

/**
 * POST /create
 *
 * Insert a log message.
 *
 * body:
 * - todo
 */
router.post("/create", async (req: Request, res: Response, next: any) => {
    const facade: LogFacade = new LogFacade();
    try {
        for (const item of req.body) {
            const log: Log = new Log();

            const messages: string[] = item.message;
            const method = messages.shift();
            const message = messages.shift();

            log.logger = item.logger;
            log.level = item.level;
            log.method = method;
            log.message = message;
            log.params = item.message.length === 0 ? [] : item.message;

            facade.insertLog(log);
        }

        logEndpoint(controllerName, `${req.body.length} logs successfully created!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Log erfolgreich angelegt!`)
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
 * deletes logs older than 3 months
 *
 * response:
 * - amount of deleted logs
 */
router.delete("/", [], async (req: Request, res: Response, next: any) => {
    const facade: LogFacade = new LogFacade();

    // date 3 months in the past
    const date = moment().subtract(3, "months").toDate();
    facade.filter.addFilterCondition("created_at", date, SQLComparisonOperator.LESS_THAN);

    try {
        const affectedRows = await facade.deleteLogs();

        logEndpoint(controllerName, `${affectedRows} logs were deleted!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                affectedRows,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `${affectedRows} Logs wurden erfolgreich gelöscht!`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});


export default router;
