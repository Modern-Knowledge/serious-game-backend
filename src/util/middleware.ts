/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */
import { Request, Response } from "express";
import { Stopwatch } from "./analysis/Stopwatch";
import logger from "./log/logger";
import { ExecutionTimeAnalyser } from "./analysis/ExecutionTimeAnalyser";
import { getRequestUrl } from "./Helper";

/**
 * This file provides request middleware for express
 */

/**
 * Middleware that starts a timer for measuring duration of a request
 * @param req
 * @param res
 * @param next
 */
export function startMeasureRequestTime(req: Request, res: Response, next: any) {
    res.locals.stopwatch = new Stopwatch("Request Time"); // start stopwatch
    next();
}

/**
 * stops the timer started in startMeasureTime and prints the response time
 * @param req
 * @param res
 * @param next
 */
export function stopMeasureRequestTime(req: Request, res: Response, next: any) {
    const stopwatch: Stopwatch = res.locals.stopwatch;
    logger.info(`${req.method} "${getRequestUrl(req)}" ${stopwatch.timeElapsed}`);
    new ExecutionTimeAnalyser().analyse(stopwatch.measuredTime, getRequestUrl(req));
    next();
}

/**
 * log information about the request
 * @param req
 * @param res
 * @param next
 */
export function logRequest(req: Request, res: Response, next: any) {
    logger.info(`${req.method} ${getRequestUrl(req)} called!  ${JSON.stringify(req.body)}`);
    next();
}