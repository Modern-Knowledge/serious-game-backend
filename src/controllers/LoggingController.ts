/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { LogFacade } from "../db/entity/log/LogFacade";
import { Log } from "../lib/models/Log";
import { SQLOrder } from "../db/sql/SQLOrder";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import logger from "../util/log/logger";
import { loggerString } from "../util/Helper";

const router = express.Router();

const controllerName = "LoggingController";

/**
 * GET /
 * Get all logs.
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    const facade: LogFacade = new LogFacade();
    facade.addOrderBy("id", SQLOrder.ASC);

    try {
        const logs = await facade.get();

        logger.debug(`${loggerString()} GET LoggingController/: All logs loaded successfully!`);

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
 * POST /
 * Insert a log message.
 *
 * body:
 *
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

        logger.debug(`${loggerString()} POST LoggingController/create: logs successfully created`);

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


export default router;
