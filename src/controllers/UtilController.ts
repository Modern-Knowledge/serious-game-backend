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

const router = express.Router();

const controllerName = "UtilController";

/**
 * GET /mail
 *
 * Returns if the
 *
 * response:
 * - connectable: Returns true, if the mail-server is reachable
 */
router.get("/mail-server", async (req: Request, res: Response) => {
    logEndpoint(controllerName, `Check if the mail-server is reachable!`, req);

    mailTransport.transporter.verify((error: Error | null, success: true) => {
        if (error) {
            return res.status(HTTPStatusCode.INTERNAL_SERVER_ERROR).json(
                new HttpResponse(HttpResponseStatus.SUCCESS,
                    {connectable: false},
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                            `Mail-Server konnte nicht erreicht werden!`)
                    ]
                )
            );
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
 * Checks if the database is reachable
 *
 * response:
 * - connectable: Returns true, if the database is reachable
 */
router.get("/database", async (req: Request, res: Response, next: any) => {
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
        return res.status(HTTPStatusCode.INTERNAL_SERVER_ERROR).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {connectable: false},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                        `Datenbank konnte nicht erreicht werden!`)
                ]
            )
        );
    }
});

export default router;
