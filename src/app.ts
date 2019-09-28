/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

/*
* watch the order of the imports.
* .env must be load before environment variables are used in loaded modules
*/

import express, { Request, Response } from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import passport from "passport";
import moment from "moment";
import morgan from "morgan";
import * as dotenv from "dotenv";
import { DotenvConfigOutput } from "dotenv";
import { inProduction, loggerString } from "./util/Helper";

import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "./util/http/HttpResponse";

const config: DotenvConfigOutput = dotenv.config({path: ".env"});
if (config.error) { // .env not found
  const message: string = `${loggerString(__dirname, "", "", __filename)} .env couldn't be loaded!`;
  throw new Error(message);
}

import cors from "cors";
import { logRequest, startMeasureRequestTime, stopMeasureRequestTime } from "./util/middleware";
import logger from "./util/logger";
import { accessLogStream } from "./util/morgan";
import { checkEnvFunction } from "./util/checkEnvVariables";

logger.info(`${loggerString(__dirname, "", "", __filename)} .env successfully loaded!`);
checkEnvFunction();

process.env.TZ = "Europe/Vienna";
moment.locale("de");

// Create Express server
const app = express();

// set morgan logger
app.use(morgan(inProduction() ? "combined" : "dev"));
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

app.use(startMeasureRequestTime);

// log request with winston
app.use(logRequest);

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

// last middleware that is executed in a correct route
app.use(stopMeasureRequestTime);

// take care of 404 errors
// matches all routes
app.use((req: Request, res: Response, next: any) => {
    const message: HttpResponseMessage = new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Route not found");
    res.status(404).json(new HttpResponse(HttpResponseStatus.ERROR, undefined, [message]));
});



export default app;
