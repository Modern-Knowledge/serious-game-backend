/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import errorHandler from "errorhandler";

import app from "./app";
import logger from "./util/log/logger";
import { inProduction, loggerString } from "./util/Helper";

/**
 * Error Handler. Provides full stack - remove for production
 */
if (!inProduction()) {
  app.use(errorHandler());
}

/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
  logger.info(`${loggerString(__dirname, "", "", __filename)} App is running at http://localhost:${app.get("port")} in ${app.get("env")} mode`);
  logger.info(`${loggerString(__dirname, "", "", __filename)} Press CTRL-C to stop`);
});

export default server;
