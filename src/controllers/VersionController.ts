
import express from "express";
import { Request, Response } from "express";
import os from "os";
import {
    HttpResponse, HttpResponseMessage, HttpResponseMessageSeverity,
    HttpResponseStatus
} from "serious-game-library/dist/utils/http/HttpResponse";
import {HTTPStatusCode} from "serious-game-library/dist/utils/httpStatusCode";
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
 * - commit: last commit hash
 * - lastBuildDate: last date when the application was built
 * - mysql: mysql version
 * - nodejs: node.js version
 * - os: information about the os, the application is currently running
 * - uptime: time since the application started
 * - version: application version
 */
router.get("/", async (req: Request, res: Response, next: any) => {
    logEndpoint(controllerName, `Version requested!`, req);

    try {
        const runtime = process.uptime();
        const r = (runtime % 3600);
        const hours = Math.floor(runtime / 3600);
        const minutes = Math.floor(r / 60);
        const seconds = Math.floor(r % 60);

        const duration =
            (hours < 10 ? "0" + hours : hours) + ":" +
            (minutes < 10 ? "0" + minutes : minutes) + ":" +
            (seconds < 10 ? "0" + seconds : seconds);

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
                    database: process.env.DB_HOST,
                    lastBuildDate: process.env.LAST_APP_BUILD_DATE,
                    mailServer: process.env.MAIL_HOST,
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
    } catch (e) {
        return next(e);
    }
});

export default router;
