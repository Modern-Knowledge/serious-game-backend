import express from "express";
import {Request, Response} from "express";
import {
    HttpResponse, HttpResponseMessage, HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import {databaseConnection} from "../util/db/databaseConnection";
import {logEndpoint} from "../util/log/endpointLogger";
import {mailTransport} from "../util/mail/mailTransport";
import {checkAuthentication, checkAuthenticationToken} from "../util/middleware/authenticationMiddleware";

const router = express.Router();

const controllerName = "UtilController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /mail-server
 *
 * Returns true if the mail-server is reachable.
 *
 * response:
 * - connectable: Returns true, if the mail-server is reachable
 */
router.get("/mail-server", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    logEndpoint(controllerName, `Check if the mail-server is reachable!`, req);

    mailTransport.transporter.verify((error: Error | null) => {
        if (error) {
            return next(error);
        } else {
            return res.status(HTTPStatusCode.OK).json(
                new HttpResponse(HttpResponseStatus.SUCCESS,
                    {connectable: true},
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                            `Mail-Server konnte erreicht werden!`)
                    ]
                )
            );
        }
    });
});

/**
 * GET /database
 *
 * Checks if the database is reachable.
 *
 * response:
 * - connectable: Returns true, if the database is reachable
 */
router.get("/database", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    logEndpoint(controllerName, `Check if the database is reachable!`, req);

    try {
        const connectable = await databaseConnection.ping();

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {connectable},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `Datenbank konnte erreicht werden!`)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /database-version
 *
 * Returns the database version, if the server is reachable.
 *
 * response:
 * - version: database version
 */
router.get("/database-version", authenticationMiddleware,  async (req: Request, res: Response, next: any) => {
    logEndpoint(controllerName, `Return mysql-version`, req);

    try {
        const versionArr = await databaseConnection.query("SELECT VERSION() as version;");
        const mysqlVer = versionArr.length === 1 ? versionArr[0].version : "Not found!";

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {version: mysqlVer},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `Version der Datenbank erfolgreich geladen!`)
                ]
            )
        );
    } catch (e) {
        return next(e);
    }
});

export default router;
