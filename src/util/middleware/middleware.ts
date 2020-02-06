
import { Request, Response } from "express";
import { ExecutionTimeAnalyser } from "../analysis/ExecutionTimeAnalyser";
import { Stopwatch } from "../analysis/Stopwatch";
import { getRequestUrl, loggerString } from "../Helper";
import logger from "../log/logger";

/**
 * Middleware that measures the response time and prints it to the console.
 * The response time is analyzed and warnings/errors are printed to the console
 * if the time exceeds certain limits.
 *
 * @param req request
 * @param res response
 * @param next next middleware
 */
export function measureRequestTime(req: Request, res: Response, next: any): void {
    const stopwatch = new Stopwatch("Request Time"); // start stopwatch

    const url: string = getRequestUrl(req);

    res.on("finish", () => {
        logger.info(`${loggerString()} ${req.method} "${url}" ${stopwatch.timeElapsed}`);
        new ExecutionTimeAnalyser().analyse(stopwatch.measuredTime, url);
    });

    return next();
}

/**
 * Logs information about the request and the passed query-parameters.
 * e.g.: [DATETIME] (GET|PUT|POST|DELETE) http://localhost/images/
 *
 * @param req request
 * @param res response
 * @param next next middleware
 */
export function logRequest(req: Request, res: Response, next: any): void {
    logger.info(`${loggerString()} ${req.method} "${getRequestUrl(req)}" called! ${JSON.stringify(req.body)}`);
    return next();
}

/**
 * Logs rateLimit {limit, current, remaining number of requests} property that is added to the request by req.rateLimit.
 * Logs slowDown {limit, current, remaining, resetTime, delay} property that is added to the request by req.slowDown.
 *
 * @param req request
 * @param res response
 * @param next next middleware
 */
export function logLimitSlowDown(req: Request, res: Response, next: any): void {
    logger.debug(`${loggerString()} ${req.method} "${getRequestUrl(req)}" ` +
        // @ts-ignore
        `Rate-Limit: ${JSON.stringify(req.rateLimit)}`);
    // @ts-ignore
    logger.debug(`${loggerString()} ${req.method} "${getRequestUrl(req)}" Slow-Down: ${JSON.stringify(req.slowDown)}`);
    return next();
}
