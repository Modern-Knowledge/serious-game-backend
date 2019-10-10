/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { check } from "express-validator";
import { rVM } from "../util/validation/validationMessages";
import { StatisticFacade } from "../db/entity/game/StatisticFacade";
import { Statistic } from "../lib/models/Statistic";
import { StatisticCompositeFacade } from "../db/composite/StatisticCompositeFacade";
import moment from "moment";
import { checkRouteValidation, failedValidation400Response } from "../util/validation/validationHelper";
import { logEndpoint } from "../util/log/endpointLogger";
import { http4xxResponse } from "../util/http/httpResponses";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";

const router = express.Router();

const controllerName = "StatisticController";

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

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
 * - token: authentication token
 */
router.get("/:id", authenticationMiddleware, [
    check("id").isNumeric().withMessage(rVM("id", "numeric"))
], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const id = Number(req.params.id);
    const statisticFacade = new StatisticCompositeFacade();

    try {
        const statistic = await statisticFacade.getById(id);

        logEndpoint(controllerName, `Statistic with id ${id} was successfully loaded!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {statistic: statistic, token: res.locals.authorizationToken},
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
 * - token: authentication token
 */
router.put("/", authenticationMiddleware, [
    check("_id").isNumeric().withMessage(rVM("id", "numeric")),

    check("_startTime")
        .isISO8601().withMessage(rVM("date", "invalid"))
        .custom((value, { req }) => moment(value).isBefore(req.body._endTime, "minutes")).withMessage(rVM("date", "wrong_order")),

    check("_endTime")
        .isISO8601().withMessage(rVM("date", "invalid"))

], async (req: Request, res: Response, next: any) => {

    if (!checkRouteValidation(controllerName, req, res)) {
        return failedValidation400Response(req, res);
    }

    const statistic = new Statistic().deserialize(req.body);

    const statisticFacade = new StatisticFacade();
    statisticFacade.filter.addFilterCondition("id", statistic.id);

    try {
        // update statistics
        const affectedRows = await statisticFacade.updateStatistic(statistic);

        if (affectedRows <= 0) { // check amount of affected rows
            logEndpoint(controllerName, `Statistic with id ${statistic.id} couldn't be updated!`, req);

            return http4xxResponse(res, [
                new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Statistik konnte nicht aktualisiert werden!`)
            ], 400);
        }

        logEndpoint(controllerName, `Statistic with id ${statistic.id} was successfully updated!`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {statistic: statistic, token: res.locals.authorizationToken},
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
