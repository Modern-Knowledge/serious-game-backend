import { Logger, LoggerOptions, transports } from "winston";
import "winston-daily-rotate-file";

const logDir = "logs/";

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL || "error",

  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === "production" ? "error" : "debug",
      colorize: "all",
      prettyPrint: true,
      showLevel: true,
      label: "Serious Game Backend",
      handleExceptions: true
    }),
    new transports.DailyRotateFile({
      frequency: "24h",
      filename: "info-%DATE%.log",
      maxsize: "20m",
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      json: true,
      showLevel: true,
      dirname: logDir,
      label: "Serious Game Backend"
    }),
    new transports.File({
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

if (process.env.NODE_ENV !== "production") {
  logger.debug("Logging initialized at debug level");
}

export default logger;
