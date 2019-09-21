/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import passport from "passport";
import * as dotenv from "dotenv";
import { DotenvConfigOutput } from "dotenv";
import logger from "./util/logger";
import { Helper } from "./util/Helper";
import moment from "moment";
import morgan from "morgan";
import { accessLogStream } from "./util/morgan";
import cors from "cors";

// Controllers (route handlers)
import HomeController from "./controllers/HomeController";
import LoginController from "./controllers/LoginController";
import GameController from "./controllers/GameController";
import VersionController from "./controllers/VersionController";
import RegisterController from "./controllers/RegisterController";
import UserController from "./controllers/UserController";
import LoggingController from "./controllers/LoggingController";
import ImageController from "./controllers/ImageController";
import {Mail} from "./util/mail/Mail";
import {Recipient} from "./util/mail/Recipient";
import {MailTransport} from "./util/mail/MailTransport";


process.env.TZ = "Europe/Vienna";
moment.locale("de");

const config: DotenvConfigOutput = dotenv.config({path: ".env", debug: process.env.NODE_ENV !== "production"});
if (config.error) { // .env not found
  const message: string = `${Helper.loggerString(__dirname, "", "", __filename)} .env couldn't be loaded!`;
  logger.error(message);
  throw new Error(message);
}
logger.info(`${Helper.loggerString(__dirname, "", "", __filename)} .env successfully loaded!`);


// check env variables
(() => {
  /**
   * throw an error if these env variables are not present
   */
  const unsetRequiredVars: string[] = Helper.checkEnvVariables([
    "DB_HOST", "DB_USER", "DB_PASS", "DB_DATABASE"
  ]);

  if (unsetRequiredVars.length > 0) {
    const errorStr = `${Helper.loggerString(__dirname, "", "", __filename)} Some required ENV variables are not set: [${unsetRequiredVars.join(", ")}]!`;
    logger.error(errorStr);
    throw new Error(errorStr);
  }

  /**
   * print an warning, if these env variables are not present
   */
  const unsetOptionalVars: string[] = Helper.checkEnvVariables([
    "PORT", "LOG_LEVEL", "WARN_ONE_TO_MANY_JOINS", "WARN_EXECUTION_TIME", "MAX_EXECUTION_TIME", "SEND_MAILS"
  ]);

  if (unsetOptionalVars.length > 0) {
    logger.warn(`${Helper.loggerString(__dirname, "", "", __filename)} Some optional ENV variables are not set: [${unsetOptionalVars.join(", ")}]!`);
  }

  const unsetMailVariables: string[] = Helper.checkEnvVariables(
      ["MAIL_HOST", "MAIL_PORT", "MAIL_SECURE", "MAIL_USER", "MAIL_PASS"]
  );

  if (unsetMailVariables.length > 0) {
    process.env.SEND_MAILS = "0";
    logger.warn(`${Helper.loggerString(__dirname, "", "", __filename)} Some mail ENV variables are not set: [${unsetMailVariables.join(", ")}]!`);
  }
})();

const m = new Mail([new Recipient("Sandra Albrecht", "sandra.albrecht@aon.at")], "test", "test", "<h1>test</h1>");
MailTransport.getInstance().sendMail(m);


// Create Express server
const app = express();
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(morgan("combined", { stream: accessLogStream }));

// Express configuration
app.set("port", process.env.PORT || 3000);

// options for cors middleware
const options: cors.CorsOptions = {}; // TODO: set cors options correct

app.use(cors(options));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

/**
 * Primary app routes.
 */
app.use("/home", HomeController);
app.use("/", LoginController);
app.use("/game", GameController);
app.use("/version", VersionController);
app.use("/register", RegisterController);
app.use("/users", UserController);
app.use("/logging", LoggingController);
app.use("/images", ImageController);


export default app;
