

import { Request } from "express";
import logger from "./logger";
import { loggerString } from "../Helper";

/**
 * logs debug messages at an endpoint
 * e.g.: [DATETIME] (GET|PUT|POST|DELETE) (endpoint): message
 *
 * @param endpoint name of the controller, where the logging takes place
 * @param message logged message
 * @param req
 */
export function logEndpoint(endpoint: string, message: string, req: Request): void {
    logger.debug(`${loggerString()} ${req.method + " " + endpoint + req.path}: ${message}`);
}
