/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import passport from "passport";
import moment from "moment";
import morgan from "morgan";
import * as dotenv from "dotenv";
import { loggerString } from "./util/Helper";
import { DotenvConfigOutput } from "dotenv";
import cors from "cors";

const config: DotenvConfigOutput = dotenv.config({path: ".env", debug: process.env.NODE_ENV !== "production"});
if (config.error) { // .env not found
  const message: string = `${loggerString(__dirname, "", "", __filename)} .env couldn't be loaded!`;
  throw new Error(message);
}

import logger from "./util/logger";
import { accessLogStream } from "./util/morgan";
import { checkEnvFunction } from "./util/checkEnvVariables";

logger.info(`${loggerString(__dirname, "", "", __filename)} .env successfully loaded!`);
checkEnvFunction();

process.env.TZ = "Europe/Vienna";
moment.locale("de");

// Controllers (route handlers)
import HomeController from "./controllers/HomeController";
import LoginController from "./controllers/LoginController";
import GameController from "./controllers/GameController";
import VersionController from "./controllers/VersionController";
import UserController from "./controllers/UserController";
import LoggingController from "./controllers/LoggingController";
import ImageController from "./controllers/ImageController";
import TherapistController from "./controllers/TherapistController";
import PatientController from "./controllers/PatientController";
import RecipeController from "./controllers/RecipeController";

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
app.use("/users", UserController);
app.use("/logging", LoggingController);
app.use("/images", ImageController);
app.use("/therapists", TherapistController);
app.use("/patients", PatientController);
app.use("/recipes", RecipeController);

export default app;
