import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import passport from "passport";
import * as dotenv from "dotenv";
import { DotenvConfigOutput } from "dotenv";
import { UserDaoImpl } from "./dao/UserDaoImpl";
import { UserFilter } from "./filter/UserFilter";
import logger from "./util/logger";
import { DatabaseConnection } from "./util/DatabaseConnection";
import { Helper } from "./util/Helper";
import moment from "moment";

process.env.TZ = "Europe/Vienna";
moment.locale("de");

const config: DotenvConfigOutput = dotenv.config({path: ".env"});
if (config.error) { // .env not found
  const message: string = `${Helper.loggerString(__dirname, "", "", __filename)} .env couldn't be loaded`;
  logger.error(message);
  throw new Error(message);
}
logger.info(`${Helper.loggerString(__dirname, "", "", __filename)} .env successfully loaded`);

DatabaseConnection.getInstance();

// Controllers (route handlers)
import * as homeController from "./controllers/home";

const dao: UserDaoImpl = new UserDaoImpl();
const filter: UserFilter = new UserFilter();

// const user: User[] = dao.all(filter);

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
// app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

/**
 * Primary app routes.
 */
app.all("/", homeController.index);

export default app;
