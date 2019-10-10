/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import {
    HttpResponse, HttpResponseMessage, HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";
import { checkAuthentication, checkAuthenticationToken } from "../util/middleware/authenticationMiddleware";
import { checkTherapistPermission } from "../util/middleware/permissionMiddleware";

const router = express.Router();

const controllerName = "UserController";

router.use(checkAuthenticationToken);
router.use(checkAuthentication);
router.use(checkTherapistPermission);

const authenticationMiddleware = [checkAuthenticationToken, checkAuthentication];

/**
 * GET /
 *
 * Get the user belonging to the sent JWT.
 *
 * response:
 * - user: therapist or patient
 */
router.get("/related", authenticationMiddleware, async (req: Request, res: Response, next: any) => {
    try {
        logEndpoint(controllerName, `Retrieved related user with id ${res.locals.user.id}`, req);

        return res.status(200).json(
            new HttpResponse(HttpResponseStatus.SUCCESS,
                {user: res.locals.user, token: res.locals.authorizationToken}, [
                    new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, "Benutzer/in erfolgreich geladen!")
                ]
            )
        );
    } catch (error) {
        return next(error);
    }
});

export default router;
