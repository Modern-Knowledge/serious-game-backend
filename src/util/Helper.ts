/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { AbstractModel } from "../lib/models/AbstractModel";


/**
 * creates a string for logging that can be used in the winston logger
 *
 * @param directory directory where the method is located
 * @param className class where the method is located
 * @param methodName method which is executed
 * @param fileName file where the method is executed (only if not in class)
 */
export function loggerString(directory: string, className: string, methodName: string, fileName?: string): string {
    const dir: string[] = directory.split("dist/");
    let file: string = "";
    if (fileName) {
        file = fileName.split("dist/")[1];
    }

    return `${((dir[1] !== undefined) ? dir[1] : "") + "/" + className}${methodName !== "" ? "." : ""}${methodName}${file}:`;
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



