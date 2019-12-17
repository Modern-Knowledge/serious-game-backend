
import express from "express";
import { Request, Response } from "express";
import {
    HttpResponse,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
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
router.get("/", (req: Request, res: Response) => {
    logEndpoint(controllerName, `Version requested!`, req);

    return res.status(HTTPStatusCode.OK).json(
        new HttpResponse(HttpResponseStatus.SUCCESS,
            {
                authors: [
                    {name: "Daniel Kaufmann"},
                    {name: "Florian Mold"},
                ],
                version: process.env.VERSION,
            }
        )
    );
});

export default router;
