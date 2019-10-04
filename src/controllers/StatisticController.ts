/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import { PatientFacade } from "../db/entity/user/PatientFacade";
import logger from "../util/log/logger";
import { loggerString } from "../util/Helper";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { check, validationResult } from "express-validator";
import { retrieveValidationMessage } from "../util/validation/validationMessages";
import { StatisticFacade } from "../db/entity/game/StatisticFacade";
import { Statistic } from "../lib/models/Statistic";
import { StatisticCompositeFacade } from "../db/composite/StatisticCompositeFacade";
import moment from "moment";
import { checkRouteValidation, sendDefault400Response } from "../util/validation/validationHelper";

const router = express.Router();

const controllerName = "StatisticController";

/**
 * GET /:id
 *
 * retrieve statistic by id
 *
 * params:
 * - id: id of the statistic
 *
 * response:
 * - statistic: loaded statistic
 */
router.get("/:id", [
    check("id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return sendDefault400Response(req, res);
    }

    const id = Number(req.params.id);
    const statisticFacade = new StatisticCompositeFacade();

    try {
        const statistic = await statisticFacade.getById(id);

        logger.debug(`${loggerString()} GET SessionController/:id: Statistic with id ${id} was successfully loaded!`);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                statistic,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Statistik wurde erolgreich geladen!`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

/**
 * PUT /
 *
 * updates the given statistic
 *
 * body:
 * - _id: id of statistic
 * - _startTime: begin of statistic
 * - _endTime: end of statistic
 *
 * response:
 * - statistic: updated statistic
 */
router.put("/", [
    check("_id").isNumeric().withMessage(retrieveValidationMessage("id", "numeric")),

    check("_startTime")
        .isISO8601().withMessage(retrieveValidationMessage("date", "invalid"))
        .custom((value, { req }) => moment(value).isBefore(req.body._endTime, "minutes")).withMessage(retrieveValidationMessage("date", "wrong_order")),

    check("_endTime")
        .isISO8601().withMessage(retrieveValidationMessage("date", "invalid"))

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return sendDefault400Response(req, res);
    }

    const statistic = new Statistic().deserialize(req.body);

    const statisticFacade = new StatisticFacade();
    statisticFacade.filter.addFilterCondition("id", statistic.id);

    try {
        // update statistics
        const affectedRows = await statisticFacade.updateStatistic(statistic);

        if (affectedRows <= 0) { // check amount of affected rows
            logger.debug(`${loggerString()} PUT SessionController/: Statistic with id ${statistic.id} couldn't be updated!`);

            return res.status(404).json(
                new HttpResponse(HttpResponseStatus.FAIL,
                    undefined,
                    [
                        new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Statistik konnte nicht aktualisiert werden!`)
                    ]
                )
            );
        }

        logger.debug(`${loggerString()} PUT SessionController/: Statistic with id ${statistic.id} was successfully updated!`);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                statistic,
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, `Statistik wurde erfolgreich aktualisiert!`)
                ]
            )
        );
    }
    catch (error) {
        return next(error);
    }
});

export default router;
