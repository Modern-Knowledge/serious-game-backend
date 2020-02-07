import express, {Request, Response} from "express";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import {logEndpoint} from "../util/log/endpointLogger";
import {checkAuthentication, checkAuthenticationToken} from "../util/middleware/authenticationMiddleware";
import {Mealtimes} from "../lib/enums/Mealtimes";

const router = express.Router();

const controllerName = "MealtimesController";

const authenticationMiddleware = [
    checkAuthenticationToken,
    checkAuthentication
];

/**
 * GET /
 *
 * Get all mealtimes.
 *
 * response:
 * - mealtimes: all mealtimes of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
        try {
            const mealtimes = [Mealtimes.BREAKFAST, Mealtimes.LUNCH, Mealtimes.DINNER];

            logEndpoint(controllerName, `Return all mealtimes!`, req);

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        {mealtimes, token: res.locals.authorizationToken},
                        [
                            new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                                `Alle Zeiten erfolgreich geladen!`
                            )
                        ]
                    )
                );
        } catch (e) {
            return next(e);
        }
    }
);

export default router;
