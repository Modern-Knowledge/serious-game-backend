
import { Logger, LoggerOptions, transports } from "winston";
import "winston-daily-rotate-file";
import { loggerString } from "../Helper";

const logDir = "logs/";
const logLevel = process.env.LOG_LEVEL || "error";
const applicationName = "Serious Game Backend";

const options: LoggerOptions = {
    exceptionHandlers: [
        new transports.File({ filename: logDir + "exceptions.log" })
    ],

    level: logLevel,

    transports: [
        new transports.Console({
            colorize: "all",
            handleExceptions: true,
            label: applicationName,
            level: logLevel,
            name: "console",
            prettyPrint: true,
            showLevel: true
        }),
        new transports.DailyRotateFile({
            dirname: logDir,
            filename: "info-%DATE%.log",
            frequency: "24h",
            json: true,
            label: applicationName,
            level: logLevel,
            maxsize: "20m",
            name: "info logger",
            showLevel: true
        }),
        new transports.File({
            colorize: "all",
            dirname: logDir,
            filename: "error.log",
            json: true,
            label: applicationName,
            level: "error",
            name: "error logger",
            prettyPrint: true,
            showLevel: true,

        })
    ]
};

const logger = new Logger(options);

logger.info(`${loggerString(__dirname, "", "", __filename)} Logging initialized at ${logLevel} level`);

export default logger;
