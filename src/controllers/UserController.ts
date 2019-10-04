/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import logger from "../util/log/logger";
import { TherapistFacade } from "../db/entity/user/TherapistFacade";
import { PatientFacade } from "../db/entity/user/PatientFacade";
import { SQLComparisonOperator } from "../db/sql/SQLComparisonOperator";
import { JWTHelper } from "../util/JWTHelper";
import { TherapistCompositeFacade } from "../db/composite/TherapistCompositeFacade";
import { PatientCompositeFacade } from "../db/composite/PatientCompositeFacade";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { loggerString } from "../util/Helper";

const router = express.Router();

const controllerName = "UserController";


/**
 * GET /
 * Get the user belonging to the sent JWT.
 *
 * header:
 * x-access-token: jwt token
 *
 * response:
 * - user: therapist or patient
 */
router.get("/related", async (req: Request, res: Response, next: any) => {
    const token = req.headers["x-access-token"].toString();

    if (!token) {
        logger.debug(`${loggerString()} GET UserController/related: No token was provided!`);

        return res.status(401).json(
            new HttpResponse(HttpResponseStatus.FAIL,
                {auth: false, message: "No token provided."},
                [
                    new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Es wurde kein Token übergeben!`)
                ]
            )
        );
    }

    try {
        const jwtHelper: JWTHelper = new JWTHelper();
        return await jwtHelper.verifyToken(token, async (err, decoded) => {
            if (err) {
                logger.debug(`${loggerString()} GET UserController/related: Error when verifying token for user!`);

                return res.status(500).json(
                    new HttpResponse(HttpResponseStatus.FAIL,
                        {auth: false, message: "Failed to authenticate token."},
                        [
                            new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `Token konnte nicht authentifiziert werden!`)
                        ]
                    )
                );
            }

            const data: any = decoded;
            const userFacade = data.therapist ? new TherapistCompositeFacade() : new PatientCompositeFacade();

            const user = await userFacade.getById(data.id);

            if (!user) {
                logger.debug(`${loggerString()} GET UserController/related: User with id ${data.id} was not found!`);

                return res.status(404).json(
                    new HttpResponse(HttpResponseStatus.FAIL,
                        undefined,
                        [
                            new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, `BenutzerIn mit ID ${data.id} konnte nicht gefunden werden!`)
                        ]
                    )
                );
            }

            logger.debug(`${loggerString()} GET UserController/related: Retrieved related user with id ${data.id}`);

            return res.status(200).json(
                new HttpResponse(HttpResponseStatus.SUCCESS,
                    user
                )
            );
        });
    } catch (error) {
        next(error);
    }
});

/**
 * todo: needed?
 *
 * GET /
 * Get a user by id.
 */
router.get("/:id", async (req: Request, res: Response) => {
    logger.debug(req.params.id);
    res.jsonp("UserController");
});

export default router;
