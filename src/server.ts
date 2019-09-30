/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import errorHandler from "errorhandler";

import app from "./app";
import logger from "./util/log/logger";
import { inProduction } from "./util/Helper";

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
  logger.info("App is running at http://localhost:%d in %s mode", app.get("port"), app.get("env"));
  logger.info("Press CTRL-C to stop");
});

export default server;
