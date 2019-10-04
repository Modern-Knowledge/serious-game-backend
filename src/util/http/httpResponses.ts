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

/**
 * returns a default http 4xx response. Response status is set to HttpResponseStatus.FAIL
 * default status code: 404
 *
 * @param res http response that is returned
 * @param messages messages that are appended to the http response
 * @param code http response status code
 * @param data data that is appended to the response
 */
export function http4xxResponse(res: Response, messages?: HttpResponseMessage[], code: number = 404, data?: any): Response {
    return res.status(code).json(
        new HttpResponse(HttpResponseStatus.FAIL,
            data,
            messages
        ));
}