
import express from "express";
import { Request, Response } from "express";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";

import os from "os";
import {
    HttpResponse, HttpResponseMessage, HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import {databaseConnection} from "../util/db/databaseConnection";
import { logEndpoint } from "../util/log/endpointLogger";

const router = express.Router();

const controllerName = "VersionController";

/**
 * GET /
 *
 * Retrieve information about the current version.
 *
 * response:
 * - authors: authors of the application
 * - version: version string
 */
router.get("/", async (req: Request, res: Response) => {
    // @ts-ignore
    momentDurationFormatSetup(moment);

    logEndpoint(controllerName, `Version requested!`, req);

    const versionArr = await databaseConnection.query("SELECT VERSION() as version;");
    const mysqlVer = versionArr.length === 1 ? versionArr[0].version : "Not found!";

    const duration = moment.duration(process.uptime(), "seconds").format("hh:mm:ss");

    const revision = require("child_process")
        .execSync("git rev-parse HEAD")
        .toString().trim();

    return res.status(HTTPStatusCode.OK).json(
        new HttpResponse(HttpResponseStatus.SUCCESS,
            {
                authors: [
                    {name: "Daniel Kaufmann"},
                    {name: "Florian Mold"},
                ],
                commit: revision,
                lastBuildDate: process.env.LAST_APP_BUILD_DATE,
                mysql: mysqlVer,
                nodejs: process.version,
                os: `${os.type} ${os.arch()} ${os.release()}`,
                uptime: duration,
                version: process.env.VERSION,
            }, [
                new HttpResponseMessage(
                    HttpResponseMessageSeverity.SUCCESS,
                    `Versionsinformationen erfolgreich geladen!`
                )
            ]
        )
    );
});

export default router;
