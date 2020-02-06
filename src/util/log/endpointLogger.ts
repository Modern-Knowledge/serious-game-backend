
import { Request } from "express";
import { loggerString } from "../Helper";
import logger from "./logger";

/**
 * Logs debug messages about an endpoint. Includes http-request method and path
 * variables.
 *
 * e.g.: [DATETIME] (GET|PUT|POST|DELETE) (endpoint): message
 *
 * @param endpoint name of the endpoint
 * @param message message to log
 * @param req request
 */
export function logEndpoint(endpoint: string, message: string, req: Request): void {
    logger.debug(`${loggerString()} ${req.method + " " + endpoint + req.path}: ${message}`);
}
