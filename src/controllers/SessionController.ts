/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import logger from "../util/log/logger";
import { loggerString } from "../util/Helper";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { SessionCompositeFacade } from "../db/composite/SessionCompositeFacade";
import { check, validationResult } from "express-validator";
import { retrieveValidationMessage } from "../util/validation/validationMessages";
import { Session } from "../lib/models/Session";
import { SessionFacade } from "../db/entity/game/SessionFacade";
import { StatisticFacade } from "../db/entity/game/StatisticFacade";
import { Statistic } from "../lib/models/Statistic";
import { checkRouteValidation, sendDefault400Response } from "../util/validation/validationHelper";

const router = express.Router();

/**
 * GET /:id
 * retrieve the session by id
 *
 * params:
 * - id: id of the session
 *
 * response:
 * - session: loaded session
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation("SessionController/:id", req, res)) {
        return sendDefault400Response(req, res);
    }

    const id = Number(req.params.id);
    const sessionCompositeFacade = new SessionCompositeFacade();

    try {
        const session = await sessionCompositeFacade.getById(id);

        if (!session) {
            logger.debug(`${loggerString()} GET SessionController/:id: Session with id ${id} not found!`);

            return res.status(404).json(
                new HttpResponse(HttpResponseStatus.FAIL,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Die Spielsitzung wurde nicht gefunden!`)
                    ]
                )
            );
        }

        logger.debug(`${loggerString()} GET SessionController/:id: Session with id ${id} was successfully loaded!`);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                session,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Spielsitzung wurde erfolgreich geladen!`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

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
 */
router.get("/patient/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation("SessionController/patient/:id", req, res)) {
        return sendDefault400Response(req, res);
    }

    const id = Number(req.params.id);
    const sessionCompositeFacade = new SessionCompositeFacade();
    sessionCompositeFacade.filter.addFilterCondition("patient_id", id);

    try {
        const sessions: Session[] = await sessionCompositeFacade.get();

        logger.debug(`${loggerString()} GET SessionController/patient/:id: Sessions for patient with id ${id} were successfully loaded! (${sessions.length})`);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                sessions,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Ihre Spielsitzungen wurden erfolgreich geladen!`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

/**
 * DELETE /:id
 *
 * delete the given session
 *
 * params:
 * - id: id of the session
 *
 * response:
 */
router.delete("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation("SessionController/:id", req, res)) {
        return sendDefault400Response(req, res);
    }

    const id = Number(req.params.id);
    const sessionCompositeFacade = new SessionCompositeFacade();

    try {
        // check if session exists
        const session: Session = await sessionCompositeFacade.getById(id);

        if (!session) {
            logger.debug(`${loggerString()} DELETE SessionController/:id: Session with id ${id} was not found!`);

            return res.status(404).json(
                new HttpResponse(HttpResponseStatus.FAIL,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Die Spielsitzung wurde nicht gefunden!`)
                    ]
                )
            );
        }

        sessionCompositeFacade.filter.addFilterCondition("id", session.id);
        sessionCompositeFacade.statisticFacadeFilter.addFilterCondition("id", session.statisticId);
        sessionCompositeFacade.errortextStatisticFacadeFilter.addFilterCondition("statistic_id", session.statisticId);

        await sessionCompositeFacade.deleteSessionComposite();

        logger.debug(`${loggerString()} DELETE SessionController/:id: Session with id ${id} was successfully deleted!`);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                undefined,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Spielsitzung wurde erfolgreich gelöscht!`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

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
 *
 * response:
 * - session: created session
 */
router.post("/", [
    check("_gameId").isNumeric().withMessage(retrieveValidationMessage("id", "numeric")),

    check("_patientId").isNumeric().withMessage(retrieveValidationMessage("id", "numeric")),

    check("_gameSettingId").isNumeric().withMessage(retrieveValidationMessage("id", "numeric")),

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation("SessionController/", req, res)) {
        return sendDefault400Response(req, res);
    }

    const sessionFacade = new SessionFacade();
    const session = new Session().deserialize(req.body);
    session.date = new Date();

    const statisticFacade = new StatisticFacade();
    const statistic = new Statistic();
    statistic.startTime = new Date();

    try {
        // insert statistic
        const insertedStatistic = await statisticFacade.insertStatistic(statistic);

        logger.debug(`${loggerString()} POST SessionController/: Statistic with id ${insertedStatistic.id} for new session was successfully created!`);

        session.statisticId = insertedStatistic.id;
        session.statistic = insertedStatistic;

        // insert statistic
        const insertedSession = await sessionFacade.insertSession(session);

        logger.debug(`${loggerString()} POST SessionController/: Session with id ${insertedSession.id} was successfully created!`);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                insertedSession,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Spielsitzung wurde erfolgreich erstellt`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

export default router;
