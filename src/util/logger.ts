import { Logger, LoggerOptions, transports } from "winston";
import "winston-daily-rotate-file";

const logDir = "logs/";

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL || "error",


  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === "production" ? "error" : "debug"
    }),
    new transports.DailyRotateFile({
        frequency: "24h",
        filename: logDir + "info-%DATE%.log",
        maxsize: "20m",
        level: "debug",
        json: true,
        showLevel: true,
        label: "Serious Game Backend",
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: logDir + "exceptions.log" })
  ]

};

const logger = new Logger(options);

if (process.env.NODE_ENV !== "production") {
  logger.debug("Logging initialized at debug level");
}

export default logger;
