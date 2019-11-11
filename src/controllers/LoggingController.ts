
import express, { Request, Response } from "express";
import moment from "moment";
import { LogFacade } from "../db/entity/log/LogFacade";
import { SQLComparisonOperator } from "../db/sql/enums/SQLComparisonOperator";
import { SQLOperator } from "../db/sql/enums/SQLOperator";
import { SQLOrder } from "../db/sql/enums/SQLOrder";
import { Log } from "../lib/models/Log";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkTherapistAdminPermission } from "../util/middleware/permissionMiddleware";

const router = express.Router();

const controllerName = "LoggingController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 *
 * Get all logs.
 *
 * body:
 * - level: level of the logs
 * - method: request method of the log
 * - userId: user id that owns the log
 *
 * response:
 * - logs: all logs of the application
 */
router.get("/", authenticationMiddleware, checkTherapistAdminPermission, async (req: Request, res: Response, next: any) => {
    const facade: LogFacade = new LogFacade();
    facade.addOrderBy("id", SQLOrder.ASC);

    if (req.body.level) {
        facade.filter.addFilterCondition("level", req.body.level);
    }

    if (req.body.method) {
        if (!facade.filter.isEmpty) {
            facade.filter.addOperator(SQLOperator.AND);
        }

        facade.filter.addFilterCondition("method", req.body.method);
    }

    if (req.body.userId) {
        if (!facade.filter.isEmpty) {
            facade.filter.addOperator(SQLOperator.AND);
        }

        facade.filter.addFilterCondition("user_id", Number(req.body.userId));
    }

    try {

        const logs = await facade.get();

        logEndpoint(controllerName, `All logs loaded successfully!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {
                    logs,
                    token: res.locals.authorizationToken
                }
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

/**
 *
 * POST /create
 *
 * Insert a log message.
 *
 * body:
 * [
 *  - logger
 *  - level
 *  - message = [method, message, ...params]
 * ]
 *
 */
router.post("/", async (req: Request, res: Response, next: any) => {
    const facade: LogFacade = new LogFacade();
    const insertedLogs = [];

    try {
        for (const item of req.body) {
            const log: Log = new Log();

            const messages: string[] = item.message;

            if (messages && messages.length >= 2) {
                const method = messages.shift();
                const message = messages.shift();

                log.logger = item.logger;
                log.level = item.level;
                log.method = method;
                log.message = message;
                log.params = item.message.length === 0 ? [] : item.message;

                if (item.logger && item.level) {
                    await facade.insertLog(log);
                    insertedLogs.push(log);
                }
            } else {
                logEndpoint(controllerName, `Message was too short for insertion!`, req);
            }
        }

        logEndpoint(controllerName, `${insertedLogs.length} logs successfully created!`, req);

        return res.status(201).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {
                    insertedLogs: insertedLogs.length
                },
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `${insertedLogs.length} Log(s) erfolgreich angelegt!`)
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
router.delete("/", authenticationMiddleware, checkTherapistAdminPermission, async (req: Request, res: Response, next: any) => {
    const facade: LogFacade = new LogFacade();

    // date 3 months in the past
    const date = moment().subtract(3, "months").toDate();
    facade.filter.addFilterCondition("created_at", date, SQLComparisonOperator.LESS_THAN);

    try {
        const affectedRows = await facade.deleteLogs();

        logEndpoint(controllerName, `${affectedRows} logs were deleted!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {affectedRows, token: res.locals.authorizationToken},
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
