import express, {Request, Response} from "express";
import fs from "fs";
import {EOL} from "os";
import path from "path";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import {loggerString} from "../util/Helper";
import {logEndpoint} from "../util/log/endpointLogger";
import logger from "../util/log/logger";
import {checkAuthentication, checkAuthenticationToken} from "../util/middleware/authenticationMiddleware";
import {checkTherapistAdminPermission} from "../util/middleware/permissionMiddleware";
import {check} from "express-validator";
import {rVM} from "../util/validation/validationMessages";

const router = express.Router();

const controllerName = "LogController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication, checkTherapistAdminPermission];

/**
 * GET /
 *
 * Retrieve all log-files
 *
 * response:
 * - files: Retrieves content of the log folder
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const filePath = path.join("logs");

    try {
        const files = fs.readdirSync(filePath)
            .map((value: string) => value.split(".")[0])
            .filter((value: string) => !value.includes("request"));

        logEndpoint(controllerName, `All logs-files loaded successfully!`, req);

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {files, token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Log Dateien erfolgreich geladen!`)
                ]
            )
        );
    } catch (error) {
        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS, {token: res.locals.authorizationToken}, []
            )
        );
    }
});

/**
 * DELETE /:name
 *
 * Delete the log-file with the specified name.
 *
 * response:
 *  - token: authentication token
 */
router.delete("/:name", authenticationMiddleware, [
    check("name").escape().trim().not().isEmpty(),
], async (req: Request, res: Response, next: any) => {
    const filePath = path.join("logs", req.params.name + ".log");

    try {
        fs.truncateSync(filePath, 1);

        logEndpoint(controllerName, `Log file ${req.params.name} was deleted!`, req);

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(
                        HttpResponseMessageSeverity.SUCCESS,
                        `Log Datei "${req.params.name}" wurde geleert!`,
                        true)
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

/**
 * GET /:name
 *
 * Retrieve specified log-file.
 *
 * params:
 * - name: name of the file to receive
 *
 * query:
 * - level: level of the log
 *
 * response:
 * - content: contents of the selected file
 */
router.get("/:name", authenticationMiddleware, async (req: Request, res: Response) => {
    const name = req.params.name + ".log";
    const filePath = path.join("logs", name);

    try {
        const file = fs.readFileSync(filePath);

        logEndpoint(controllerName, `Log ${name} loaded successfully!`, req);
        let content;

        try {
            content = JSON.parse("[" + file.toString()
                .split(EOL)
                .filter((value: string) => value.length > 0)
                .join(",") + "]")
                .filter((value: any) => {
                    if (req.query.level) {
                        return value.level === req.query.level;
                    }

                    return true;
                });
        } catch (e) {
            content = {};
        }

        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {content, token: res.locals.authorizationToken},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Log Dateien erfolgreich geladen!`)
                ]
            )
        );
    } catch (error) {
        logger.error(`${loggerString(__dirname, "", "", __filename)} ${error.message}`);
        res.contentType("application/json");
        return res.status(HTTPStatusCode.OK).json(
            new HttpResponse(HttpResponseStatus.SUCCESS, {token: res.locals.authorizationToken}, []
            )
        );
    }
});

export default router;
