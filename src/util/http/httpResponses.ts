/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseStatus
} from "../../lib/utils/http/HttpResponse";
import { Response } from "express";

/**
 * stores predefined http responses
 */

export function http4xxResponse(res: Response, messages?: HttpResponseMessage[], code: number = 400, data?: any): Response {
    return res.status(code).json(
        new HttpResponse(HttpResponseStatus.FAIL,
            data,
            messages
        ));
}