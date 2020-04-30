import express, {Request, Response} from "express";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "serious-game-library/dist/utils/http/HttpResponse";
import {HTTPStatusCode} from "serious-game-library/dist/utils/httpStatusCode";
import {DifficultyFacade} from "../db/entity/enum/DifficultyFacade";
import {logEndpoint} from "../util/log/endpointLogger";
import {checkAuthentication, checkAuthenticationToken} from "../util/middleware/authenticationMiddleware";

const router = express.Router();

const controllerName = "DifficultyController";

const authenticationMiddleware = [
    checkAuthenticationToken,
    checkAuthentication
];

/**
 * GET /
 *
 * Get all difficulties.
 *
 * response:
 * - difficulties: all difficulties of the application
 * - token: authentication token
 */
router.get("/", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
        const difficultyFacade = new DifficultyFacade();

        try {
            const difficulties = await difficultyFacade.get();

            logEndpoint(controllerName, `Return all difficulties!`, req);

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        {difficulties, token: res.locals.authorizationToken},
                        [
                            new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS,
                                `Alle Schwierigkeiten erfolgreich geladen!`
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
