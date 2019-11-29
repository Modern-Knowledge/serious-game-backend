import express from "express";
import { Request, Response } from "express";
import { check } from "express-validator";
import moment from "moment";
import { SessionCompositeFacade } from "../db/composite/SessionCompositeFacade";
import { GameFacade } from "../db/entity/game/GameFacade";
import { SessionFacade } from "../db/entity/game/SessionFacade";
import { StatisticFacade } from "../db/entity/game/StatisticFacade";
import { GameSettingFacade } from "../db/entity/settings/GameSettingFacade";
import { PatientFacade } from "../db/entity/user/PatientFacade";
import { Session } from "../lib/models/Session";
import { Statistic } from "../lib/models/Statistic";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "../lib/utils/httpStatusCode";
import {
    failedValidation400Response,
    http4xxResponse
} from "../util/http/httpResponses";
import { logEndpoint } from "../util/log/endpointLogger";
import {
    checkAuthentication,
    checkAuthenticationToken
} from "../util/middleware/authenticationMiddleware";
import {
    checkTherapistPermission
} from "../util/middleware/permissionMiddleware";
import { checkRouteValidation } from "../util/validation/validationHelper";
import { rVM } from "../util/validation/validationMessages";
const router = express.Router();

const controllerName = "SessionController";

const authenticationMiddleware = [
    checkAuthenticationToken,
    checkAuthentication
];

/**
 * GET /:id
 * retrieve the session by id
 *
 * params:
 * - id: id of the session
 *
 * response:
 * - session: loaded session
 * - token: authentication token
 */
router.get(
    "/:id",
    authenticationMiddleware,
    [
        check("id")
            .isNumeric()
            .withMessage(rVM("id", "numeric"))
    ],
    async (req: Request, res: Response, next: any) => {
        if (!checkRouteValidation(controllerName, req, res)) {
            return failedValidation400Response(req, res);
        }

        const id = Number(req.params.id);
        const sessionCompositeFacade = new SessionCompositeFacade();

        try {
            const session = await sessionCompositeFacade.getById(id);

            if (!session) {
                logEndpoint(controllerName, `Session with id ${id} not found!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(
                        HttpResponseMessageSeverity.DANGER,
                        `Die Spielsitzung wurde nicht gefunden!`
                    )
                ]);
            }

            logEndpoint(
                controllerName,
                `Session with id ${id} was successfully loaded!`,
                req
            );

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        { session, token: res.locals.authorizationToken },
                        [
                            new HttpResponseMessage(
                                HttpResponseMessageSeverity.SUCCESS,
                                `Spielsitzung wurde erfolgreich geladen!`
                            )
                        ]
                    )
                );
        } catch (error) {
            return next(error);
        }
    }
);

/**
 * GET /patient/:id
 *
 * retrieve sessions for given patient
 *
 * params:
 * - id: id of the patient
 *
 * response:
 * - sessions[]: array of sessions by the patient
 * - token: authentication token
 */
router.get(
    "/patient/:id",
    authenticationMiddleware,
    [
        check("id")
            .isNumeric()
            .withMessage(rVM("id", "numeric"))
    ],
    async (req: Request, res: Response, next: any) => {
        if (!checkRouteValidation(controllerName, req, res)) {
            return failedValidation400Response(req, res);
        }

        const id = Number(req.params.id);
        const sessionCompositeFacade = new SessionCompositeFacade();
        sessionCompositeFacade.filter.addFilterCondition("patient_id", id);

        try {
            const sessions: Session[] = await sessionCompositeFacade.get();

            logEndpoint(
                controllerName,
                `Sessions for patient with id ${id} were successfully loaded! (${sessions.length})`,
                req
            );

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        { sessions, token: res.locals.authorizationToken },
                        [
                            new HttpResponseMessage(
                                HttpResponseMessageSeverity.SUCCESS,
                                `Die Spielsitzungen wurden erfolgreich geladen!`
                            )
                        ]
                    )
                );
        } catch (error) {
            return next(error);
        }
    }
);

/**
 * DELETE /:id
 *
 * delete the given session
 *
 * params:
 * - id: id of the session
 *
 * response:
 * - token: authentication token
 */
router.delete(
    "/:id",
    authenticationMiddleware,
    checkTherapistPermission,
    [
        check("id")
            .isNumeric()
            .withMessage(rVM("id", "numeric"))
    ],
    async (req: Request, res: Response, next: any) => {
        if (!checkRouteValidation(controllerName, req, res)) {
            return failedValidation400Response(req, res);
        }

        const id = Number(req.params.id);
        const sessionCompositeFacade = new SessionCompositeFacade();

        try {
            // check if session exists
            const session: Session = await sessionCompositeFacade.getById(id);

            if (!session) {
                logEndpoint(
                    controllerName,
                    `Session with id ${id} was not found!`,
                    req
                );

                return http4xxResponse(res, [
                    new HttpResponseMessage(
                        HttpResponseMessageSeverity.DANGER,
                        `Die Spielsitzung wurde nicht gefunden!`
                    )
                ]);
            }

            sessionCompositeFacade.filter.addFilterCondition("id", session.id);
            sessionCompositeFacade.statisticFacadeFilter.addFilterCondition(
                "id",
                session.statisticId
            );
            sessionCompositeFacade.errortextStatisticFacadeFilter.addFilterCondition(
                "statistic_id",
                session.statisticId
            );

            await sessionCompositeFacade.deleteSessionComposite();

            logEndpoint(
                controllerName,
                `Session with id ${id} was successfully deleted!`,
                req
            );

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        { token: res.locals.authorizationToken },
                        [
                            new HttpResponseMessage(
                                HttpResponseMessageSeverity.SUCCESS,
                                `Spielsitzung wurde erfolgreich gelöscht!`
                            )
                        ]
                    )
                );
        } catch (error) {
            return next(error);
        }
    }
);

/**
 * POST /
 *
 * creates a new session and a statistic
 *
 * session.date is set to [now]
 * statistic.starttime is set to [now]
 *
 * body:
 * - _gameId: id of the patient
 * - _patientId: id of the patient
 * - _gameSettingId: id of the game_setting
 * - _elapsedTime: the time it took to complete the session (in ms)
 *
 * response:
 * - session: created session
 * - token: authentication token
 */
router.post(
    "/",
    authenticationMiddleware,
    [
        check("_gameId")
            .isNumeric()
            .withMessage(rVM("id", "numeric")),

        check("_patientId")
            .isNumeric()
            .withMessage(rVM("id", "numeric")),

        check("_gameSettingId")
            .isNumeric()
            .withMessage(rVM("id", "numeric")),

        check("_elapsedTime")
            .isInt({min: 0})
            .withMessage(rVM("id", "numeric"))

    ],
    async (req: Request, res: Response, next: any) => {
        if (!checkRouteValidation(controllerName, req, res)) {
            return failedValidation400Response(req, res);
        }

        const gameFacade = new GameFacade();
        const patientFacade = new PatientFacade();
        const gameSettingFacade = new GameSettingFacade();

        const sessionFacade = new SessionFacade();
        const session = new Session().deserialize(req.body);
        session.date = new Date();

        const statisticFacade = new StatisticFacade();
        const statistic = new Statistic();
        statistic.startTime = new Date();
        statistic.endTime = moment(statistic.startTime)
            .add("ms", req.body._elapsedTime)
            .toDate();

        try {
            // check if game exists
            const game = await gameFacade.getById(req.body._gameId);
            if (!game) { // game does not exist
                logEndpoint(controllerName, `Game with id ${req.body._gameId} was not found!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                        `Spiel mit ID ${req.body._gameId} wurde nicht gefunden!`)
                ]);
            }

            // check if patient exists
            const patient = await patientFacade.getById(req.body._patientId);
            if (!patient) { // game does not exist
                logEndpoint(controllerName, `Patient with id ${req.body._patientId} was not found!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                        `PatientIm mit ID ${req.body._patientId} wurde nicht gefunden!`)
                ]);
            }

            // check if game setting exists
            const gameSetting = await gameSettingFacade.getById(req.body._gameSettingId);
            if (!gameSetting) { // game does not exist
                logEndpoint(controllerName,
                    `GameSetting with id ${req.body._gameSettingId} was not found!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER,
                        `Spieleinstelung mit ID ${req.body._gameSettingId} wurde nicht gefunden!`)
                ]);
            }

            // insert statistic
            const insertedStatistic = await statisticFacade.insertStatistic(statistic);

            logEndpoint(
                controllerName,
                `Statistic with id ${insertedStatistic.id} for new session was successfully created!`,
                req
            );

            session.statisticId = insertedStatistic.id;
            session.statistic = insertedStatistic;

            // insert statistic
            const insertedSession = await sessionFacade.insertSession(session);

            logEndpoint(
                controllerName,
                `Session with id ${insertedSession.id} was successfully created!`,
                req
            );

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        { session: insertedSession, token: res.locals.authorizationToken },
                        [
                            new HttpResponseMessage(
                                HttpResponseMessageSeverity.SUCCESS,
                                `Spielsitzung wurde erfolgreich erstellt`
                            )
                        ]
                    )
                );
        } catch (error) {
            return next(error);
        }
    }
);

export default router;
