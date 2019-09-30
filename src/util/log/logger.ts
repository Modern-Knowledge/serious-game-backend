/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Logger, LoggerOptions, transports } from "winston";
import "winston-daily-rotate-file";
import { inProduction, loggerString } from "../Helper";

const logDir = "logs/";

const logLevel = process.env.LOG_LEVEL || "error";

const options: LoggerOptions = {
    level: logLevel,

    transports: [
        new transports.Console({
            name: "console",
            level: logLevel,
            colorize: "all",
            prettyPrint: true,
            showLevel: true,
            label: "Serious Game Backend",
            handleExceptions: true
        }),
        new transports.DailyRotateFile({
            name: "info logger",
            frequency: "24h",
            filename: "info-%DATE%.log",
            maxsize: "20m",
            level: logLevel,
            json: true,
            showLevel: true,
            dirname: logDir,
            label: "Serious Game Backend"
        }),
        new transports.File({
            name: "error logger",
            json: true,
            colorize: "all",
            prettyPrint: true,
            label: "Serious Game Backend",
            showLevel: true,
            level: "error",
            dirname: logDir,
            filename: "error.log"
        })
    ],
    exceptionHandlers: [
        new transports.File({ filename: logDir + "exceptions.log" })
    ]
};

const logger = new Logger(options);

logger.info(`${loggerString(__dirname, "", "", __filename)} Logging initialized at ${logLevel} level`);

export default logger;
