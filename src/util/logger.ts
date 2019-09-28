/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Logger, LoggerOptions, transports } from "winston";
import "winston-daily-rotate-file";
import { inProduction } from "./Helper";

const logDir = "logs/";

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL || "error",

  transports: [
    new transports.Console({
      name: "console",
      level: inProduction() ? "error" : "debug",
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
      level: inProduction() ? "info" : "debug",
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

if (!inProduction()) {
  logger.debug("Logging initialized at debug level");
}

export default logger;
