
import { Request } from "express";
import * as fs from "fs";
import * as path from "path";
import { AbstractModel } from "../lib/models/AbstractModel";
import { formatDateTime } from "../lib/utils/dateFormatter";

/**
 * Creates a string for logging that can be used in the winston logger.
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
    let file = "";
    if (fileName) {
        file = fileName.split("dist/")[1];
    }

    return `[${formatDateTime()}] ${((dir[1]) ? dir[1] + "/" : "") + className}${methodName ? "." : ""}` +
        `${methodName ? methodName : ""}${file}:`;
}

/**
 * Searches for a key in a values-array.
 *
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
 *
 * @param filename image filename to read
 */
export function getImage(filename: string): Promise<Buffer> {
    const appDir = path.dirname(require.main.filename);
    const filePath = appDir + "/" + "images/" + filename;

    return new Promise<Buffer>((resolve, reject) => {
        fs.readFile(filePath, (err, data: Buffer) => {
            if (err) {
                reject(err);
            }

            resolve(data);
        });
    });
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
 * returns the current request url + parameters formatted as string
 * e.g.: http://localhost/home
 * @param req request
 */
export function getRequestUrl(req: Request): string {
    return `${req.protocol}://${req.hostname}${req.path}`;
}
