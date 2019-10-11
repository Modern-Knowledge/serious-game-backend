/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { AbstractModel } from "../lib/models/AbstractModel";
import { Request } from "express";
import { formatDateTime } from "../lib/utils/dateFormatter";


/**
 * creates a string for logging that can be used in the winston logger
 *
 * @param directory directory where the method is located
 * @param className class where the method is located
 * @param methodName method which is executed
 * @param fileName file where the method is executed (only if not in class)
 */
export function loggerString(directory?: string, className?: string, methodName?: string, fileName?: string): string {
    if (!directory && !className && !methodName && !fileName) {
        return `[${formatDateTime()}]`;
    }

    const dir: string[] = directory.split("dist/");
    let file: string = "";
    if (fileName) {
        file = fileName.split("dist/")[1];
    }

    return `[${formatDateTime()}] ${((dir[1]) ? dir[1] + "/" : "") + className}${methodName ? "." : ""}${methodName ? methodName : ""}${file}:`;
}

/**
 * searches for key in values-array
 * @param search model to search for
 * @param values array to search in
 */
export function arrayContainsModel<T extends AbstractModel<T>>(search: T, values: T[]): boolean {
    if (!search) { // value is undefined
        return false;
    }

    for (const item of values) {
        if (search.id === item.id) {
            return true;
        }
    }

    return false;
}

/**
 * returns if app is in production mode
 */
export function inProduction(): boolean {
    return process.env.NODE_ENV === "production";
}

/**
 * returns if app runs in test mode
 */
export function inTestMode(): boolean {
    return process.env.NODE_ENV === "test";
}

/**
 * checks if the authentication token is checked or skipped
 */
export function skipAuthentication(): boolean {
    const value = Number(process.env.SKIP_AUTHENTICATION) || 0;
    return value === 1;
}

/**
 * checks if permissions are checked or skipped
 */
export function skipPermissionCheck(): boolean {
    const value = Number(process.env.SKIP_PERMISSION_CHECK) || 0;
    return value === 1;
}

/**
 * returns the current request url + parameters formatted as string
 * e.g.: http://localhost/home
 * @param req
 */
export function getRequestUrl(req: Request): string {
    return `${req.protocol}://${req.hostname}${req.path}`;
}


