
import errorHandler from "errorhandler";

import moment from "moment";
import app from "./app";
import {formatDate} from "./lib/utils/dateFormatter";
import { inProduction, loggerString } from "./util/Helper";
import logger from "./util/log/logger";
moment.locale("de");

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
  logger.info(`${loggerString(__dirname, "", "", __filename)} ` +
      `App (${process.env.VERSION}) build at ${formatDate(moment(process.env.LAST_APP_BUILD_DATE).toDate())} ` +
      `is running at Port ${app.get("port")} in ${app.get("env")} mode`);
  logger.info(`${loggerString(__dirname, "", "", __filename)} Press CTRL-C to stop`);
});

export default server;
