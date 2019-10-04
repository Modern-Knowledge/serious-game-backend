/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */
import { Request, Response } from "express";
import { Stopwatch } from "./analysis/Stopwatch";
import logger from "./log/logger";
import { ExecutionTimeAnalyser } from "./analysis/ExecutionTimeAnalyser";
import { getRequestUrl, loggerString } from "./Helper";

/**
 * This file provides request middleware for express
 */

/**
 * Middleware that measures the response time and prints it to the console.
 * The response time is analyzed and warnings/errors are printed to the console
 *
 * @param req
 * @param res
 * @param next
 */
export function measureRequestTime(req: Request, res: Response, next: any) {
    const stopwatch = new Stopwatch("Request Time"); // start stopwatch

    const url: string = getRequestUrl(req);

    res.on("finish", () => {
        logger.info(`${loggerString()} ${req.method} "${url}" ${stopwatch.timeElapsed}`);
        new ExecutionTimeAnalyser().analyse(stopwatch.measuredTime, getRequestUrl(req));
    });

    next();
}

/**
 * logs information about the request and the passed parameters
 * e.g.: [DATETIME] (GET|PUT|POST|DELETE) http://localhost/images/
 *
 * @param req
 * @param res
 * @param next
 */
export function logRequest(req: Request, res: Response, next: any) {
    logger.info(`${loggerString()} ${req.method} "${getRequestUrl(req)}" called! ${JSON.stringify(req.body)}`);
    next();
}