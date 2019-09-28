/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */
import {Request, Response} from "express";
import {Stopwatch} from "./Stopwatch";
import logger from "./logger";
import {ExecutionTimeAnalyser} from "./ExecutionTimeAnalyser";


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
    logger.info(`${req.method} "${req.protocol}://${req.hostname}${req.path}" ${stopwatch.timeElapsed}`);
    new ExecutionTimeAnalyser().analyse(stopwatch.measuredTime);
    next();
}

/**
 * log information about the request
 * @param req
 * @param res
 * @param next
 */
export function logRequest(req: Request, res: Response, next: any) {
    logger.info(`${req.method} ${req.protocol}://${req.hostname}${req.path} called!  ${JSON.stringify(req.body)}`);
    next();
}