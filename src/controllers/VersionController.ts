/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import { Request, Response } from "express";
import {
    HttpResponse,
    HttpResponseStatus
} from "../lib/utils/http/HttpResponse";
import { logEndpoint } from "../util/log/endpointLogger";

const router = express.Router();

const controllerName = "VersionController";

router.get("/", (req: Request, res: Response) => {
    logEndpoint(controllerName, `Version requested!`, req);

    return res.status(200).json(
        new HttpResponse(HttpResponseStatus.SUCCESS,
            {
                version: process.env.VERSION,
                authors: [
                    {name: "Daniel Kaufmann"},
                    {name: "Florian Mold"},
                ]
            }
        )
    );
});

export default router;
