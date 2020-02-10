import express, {Request, Response} from "express";
import fs from "fs";
import {EOL} from "os";
import path from "path";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import {loggerString} from "../util/Helper";
import {logEndpoint} from "../util/log/endpointLogger";
import logger from "../util/log/logger";
import {checkAuthentication, checkAuthenticationToken} from "../util/middleware/authenticationMiddleware";
import {checkTherapistAdminPermission} from "../util/middleware/permissionMiddleware";

const router = express.Router();

const controllerName = "LogController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication, checkTherapistAdminPermission];

/**
 * GET /
 *
 * Retrieve all log.files
 *
 * response:
 * - logs: Retrieves content of the log folder
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    const filePath = path.join("logs");

    try {
        const files = fs.readdirSync(filePath).map((value: string) => value.split(".")[0]);

        logEndpoint(controllerName, `All logs-files loaded successfully!`, req);

        return res.status(HTTPStatusCode.OK).json(files);
    } catch (error) {
        return res.status(HTTPStatusCode.OK).json({});
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
 * - logs: contents of the selected file
 */
router.get("/:name", authenticationMiddleware, async (req: Request, res: Response) => {
    const name = req.params.name + ".log";
    const filePath = path.join("logs", name);

    try {
        const file = fs.readFileSync(filePath);

        logEndpoint(controllerName, `Log ${name} loaded successfully!`, req);
        let fileContent;

        try {
            fileContent = JSON.parse("[" + file.toString()
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
            fileContent = {};
        }

        return res.status(HTTPStatusCode.OK).json(fileContent);
    } catch (error) {
        logger.error(`${loggerString(__dirname, "", "", __filename)} ${error.message}`);
        res.contentType("application/json");
        return res.status(HTTPStatusCode.OK).json({});
    }
});

export default router;
