import express, {Request, Response} from "express";
import {check} from "express-validator";

import {Errortext} from "serious-game-library/dist/models/Errortext";
import {ErrortextStatistic} from "serious-game-library/dist/models/ErrortextStatistic";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "serious-game-library/dist/utils/http/HttpResponse";
import {HTTPStatusCode} from "serious-game-library/dist/utils/httpStatusCode";
import {StatisticFacade} from "../db/entity/game/StatisticFacade";
import {ErrortextFacade} from "../db/entity/helptext/ErrortextFacade";
import {ErrortextStatisticFacade} from "../db/entity/helptext/ErrortextStatisticFacade";
import {SQLComparisonOperator} from "../db/sql/enums/SQLComparisonOperator";
import {failedValidation400Response, http4xxResponse} from "../util/http/httpResponses";
import {logEndpoint} from "../util/log/endpointLogger";
import {checkAuthentication, checkAuthenticationToken} from "../util/middleware/authenticationMiddleware";
import {checkRouteValidation} from "../util/validation/validationHelper";
import {rVM} from "../util/validation/validationMessages";

const router = express.Router();

const controllerName = "ErrortextController";

const authenticationMiddleware = [
    checkAuthenticationToken,
    checkAuthentication
];

/**
 * GET /
 *
 * Get all errortexts.
 *
 * response:
 * - errortexts: all errortexts of the application
 * - token: authentication token
 */
router.get(
    "/",
    authenticationMiddleware,
    async (req: Request, res: Response, next: any) => {
        const errorTextFacade = new ErrortextFacade();

        try {
            const errortexts = await errorTextFacade.get();

            logEndpoint(controllerName, `Return all errortexts!`, req);

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        {errortexts, token: res.locals.authorizationToken},
                        [
                            new HttpResponseMessage(
                                HttpResponseMessageSeverity.SUCCESS,
                                `Alle Fehlertexte erfolgreich geladen!`
                            )
                        ]
                    )
                );
        } catch (e) {
            return next(e);
        }
    }
);

/**
 * GET /:id
 *
 * Get a errortext by id.
 *
 * params:
 * - id: id of the errortext
 *
 * response:
 * - errortext: loaded errortext
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
        const errortextFacade = new ErrortextFacade();

        try {
            const errortext = await errortextFacade.getById(id);

            if (!errortext) {
                logEndpoint(controllerName, `Errortext with id ${id} not found!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(
                        HttpResponseMessageSeverity.DANGER,
                        `Der Fehlertext wurde nicht gefunden!`
                    )
                ]);
            }

            logEndpoint(
                controllerName,
                `Errortext with id ${id} was successfully loaded!`,
                req
            );

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        {errortext, token: res.locals.authorizationToken},
                        [
                            new HttpResponseMessage(
                                HttpResponseMessageSeverity.SUCCESS,
                                `Der Fehlertext wurde erfolgreich gefunden!`
                            )
                        ]
                    )
                );
        } catch (e) {
            return next(e);
        }
    }
);

/**
 * POST /
 *
 * Inserts an errortext.
 *
 * - errortext: {
 *   - createdAt:
 *   - severity {
 *     - createdAt:
 *     - id
 *     - modifiedAt:
 *     - severity:
 *   }
 *   - id: id of the error-text
 *   - modifiedAt:
 *   - name:
 *   - text:
 *   - severityId
 * }
 * - session: {
 *   - createdAt:
 *   - game: {
 *     - createdAt:
 *     - helptexts:
 *     - gameSettings:
 *   }
 *   - gameSetting: {
 *     - createdAt:
 *     - difficulty: {
 *     - createdAt:
 *     }
 *   }
 *   - statistic {
 *     - createdAt:
 *     - errortexts:
 *     - startTime:
 *     - endTime:
 *     - id: id of the statistic
 *  }
 *  - gameId:
 *  - patientId:
 *  - gameSettingId:
 *  - elapsedTime:
 *  - date:
 *  - statisticId:
 *  - id:
 * }
 *
 * response:
 * - errortext: the created errortext
 * - token: authentication token
 */
router.post("/", authenticationMiddleware, [
        check("errortext._id").isNumeric().withMessage(rVM("errortext", "errortext_id")),

        check("session._statisticId").isNumeric().withMessage(rVM("errortext", "statistic_id"))
    ], async (req: Request, res: Response, next: any) => {
        if (!checkRouteValidation(controllerName, req, res)) {
            return failedValidation400Response(req, res);
        }

        const errortextData = req.body;
        const errortextStatisticFacade = new ErrortextStatisticFacade();

        const errortextFacade = new ErrortextFacade();
        const statisticFacacde = new StatisticFacade();

        const errortextId = errortextData.errortext._id;
        const statisticId = errortextData.session._statisticId;

        try {
            const foundErrortext = await errortextFacade.getById(errortextId);
            logEndpoint(controllerName, `Errortext ${errortextId} was not found!`, req);

            if (!foundErrortext) {
                return http4xxResponse(res, [
                    new HttpResponseMessage(
                        HttpResponseMessageSeverity.DANGER,
                        `Fehlertext ${errortextId} wurde nicht gefunden!`
                    )
                ]);
            }

            const foundStatistic = await statisticFacacde.getById(statisticId);
            if (!foundStatistic) {
                logEndpoint(controllerName, `Statistic ${statisticId} was not found!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(
                        HttpResponseMessageSeverity.DANGER,
                        `Statistik ${statisticId} wurde nicht gefunden!`
                    )
                ]);
            }

            const errorTextStatistic = new ErrortextStatistic();
            errorTextStatistic.errortextId = errortextId;
            errorTextStatistic.statisticId = statisticId;
            const errortext = await errortextStatisticFacade.insert(
                errorTextStatistic
            );

            logEndpoint(controllerName, `Errortext was successfully created!`, req);

            return res
                .status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(
                        HttpResponseStatus.SUCCESS,
                        {errortext, token: res.locals.authorizationToken},
                        [
                            new HttpResponseMessage(
                                HttpResponseMessageSeverity.SUCCESS,
                                `Der Fehlertext wurde erfolgreich erstellt!`
                            )
                        ]
                    )
                );
        } catch (e) {
            return next(e);
        }
    }
);

/**
 * POST /bulk
 *
 * Insert multiple errortexts at once.
 *
 * body:
 * - errortexts: [{
 *   - createdAt:
 *   - severity {
 *     - createdAt:
 *     - id
 *     - modifiedAt:
 *     - severity:
 *   }
 *   - id:
 *   - modifiedAt:
 *   - name:
 *   - text:
 *   - severityId
 * }]
 * - session: {
 *   - createdAt:
 *   - game: {
 *     - createdAt:
 *     - helptexts:
 *     - gameSettings:
 *   }
 *   - gameSetting: {
 *     - createdAt:
 *     - difficulty: {
 *     - createdAt:
 *     }
 *   }
 *   - statistic {
 *     - createdAt:
 *     - errortexts:
 *     - startTime:
 *     - endTime:
 *     - id:
 *  }
 *  - gameId:
 *  - patientId:
 *  - gameSettingId:
 *  - elapsedTime:
 *  - date:
 *  - statisticId:
 *  - id:
 * }
 *
 * response:
 * - errortexts: the created errortexts
 * - token: authentication token
 */
router.post("/bulk", authenticationMiddleware, [
        check("errortexts.*._id").isNumeric().withMessage(rVM("errortext", "errortext_id")),

        check("session._statisticId").isNumeric().withMessage(rVM("errortext", "statistic_id"))

    ], async (req: Request, res: Response, next: any) => {
        if (!checkRouteValidation(controllerName, req, res)) {
            return failedValidation400Response(req, res);
        }

        const errortextsData: any[] = req.body.errortexts;

        if (!errortextsData) {
            return http4xxResponse(res, [
                new HttpResponseMessage(
                    HttpResponseMessageSeverity.DANGER,
                    `Keine Fehlertexte übergeben!`
                )
            ], HTTPStatusCode.BAD_REQUEST);
        }

        const errortextStatisticFacade = new ErrortextStatisticFacade();

        const errortextFacade = new ErrortextFacade();
        const statisticFacacde = new StatisticFacade();

        const statisticId = req.body.session._statisticId;

        try {
            const foundStatistic = await statisticFacacde.getById(statisticId);
            if (!foundStatistic) {
                logEndpoint(controllerName, `Statistic ${statisticId} was not found!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(
                        HttpResponseMessageSeverity.DANGER,
                        `Statistik ${statisticId} wurde nicht gefunden!`
                    )
                ]);
            }

            const errorTextStatistic = new ErrortextStatistic();
            const errortexts = [];

            // remove duplicate error-texts
            const searchIds = errortextsData
                .map((value) => value._id)
                .filter((v, i: number, arr) => arr.indexOf(v) === i);

            if (searchIds.length > 0) {
                errortextFacade.filter.addFilterCondition("error_id", searchIds, SQLComparisonOperator.IN);
            }

            const foundErrortexts = await errortextFacade.get();

            const foundIds = foundErrortexts.map((value: Errortext) => value.id);
            const falseIds: number[] = [];
            const valid = searchIds.every((value: number) => {
                if (foundIds.includes(value)) {
                    return true;
                }

                falseIds.push(value);

                return false;
            });

            if (!valid) {
                logEndpoint(controllerName, `Errortexts ${falseIds.join(", ")} were not found!`, req);

                return http4xxResponse(res, [
                    new HttpResponseMessage(
                        HttpResponseMessageSeverity.DANGER,
                        `Fehlertexte ${falseIds.join(", ")} wurde nicht gefunden!`
                    )
                ]);
            }

            for (const errortextData of errortextsData) {
                errorTextStatistic.errortextId = errortextData._id;
                errorTextStatistic.statisticId = statisticId;
                errortexts.push(errorTextStatistic);
            }

            if (errortexts.length > 0) {
                await errortextStatisticFacade.insertBatch(errortexts);
            }
            logEndpoint(controllerName, `Errortexts were successfully created!`, req);

            return res.status(HTTPStatusCode.OK)
                .json(
                    new HttpResponse(HttpResponseStatus.SUCCESS,
                        {errortexts, token: res.locals.authorizationToken},
                        [
                            new HttpResponseMessage(
                                HttpResponseMessageSeverity.SUCCESS,
                                `Die Fehlertexte wurden erfolgreich erstellt!`
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
