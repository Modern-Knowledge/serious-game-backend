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
import cors from "cors";
import helmet from "helmet";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "./util/http/HttpResponse";

process.env.TZ = "Europe/Vienna";
moment.locale("de");

const config: DotenvConfigOutput = dotenv.config({path: ".env"});
if (config.error) { // .env not found
    const message: string = `${loggerString(__dirname, "", "", __filename)} .env couldn't be loaded!`;
    throw new Error(message);
}

import { logRequest, startMeasureRequestTime, stopMeasureRequestTime } from "./util/middleware";
import logger from "./util/log/logger";
import { accessLogStream } from "./util/log/morgan";
import { checkEnvFunction } from "./util/analysis/checkEnvVariables";

logger.info(`${loggerString(__dirname, "", "", __filename)} .env successfully loaded!`);
checkEnvFunction();

// Create Express server
const app = express();
app.use(helmet());

// set morgan logger
app.use(morgan(inProduction() ? "combined" : "dev"));
app.use(morgan("combined", {stream: accessLogStream}));

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("env", inProduction() ? "production" : "development");

// options for cors middleware
const options: cors.CorsOptions = {}; // TODO: set cors options correct

app.use(cors(options));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
import PasswordResetController from "./controllers/PasswordResetController";

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
app.use("/password", PasswordResetController);

// last middleware that is executed in a correct route
// gets skipped if error occurs in any route
app.use(stopMeasureRequestTime);

// take care of 404 errors
// matches all routes
// only execute if nothing is sent before -> 404 route not found
app.use((req: Request, res: Response, next: any) => {
    if (!res.headersSent) {
        const error: Error = new Error("Route not found");
        res.locals.status = 404;
        next(error);
    }
});

// development error handler
// will print stacktrace
app.use((err: Error, req: Request, res: Response, next: any) => {
    const message = new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, err.message);
    let data;

    if (!inProduction()) {
        data = err.stack;
    }
    const httpResponse = new HttpResponse(HttpResponseStatus.ERROR, data, [message]);
    logger.error(`${loggerString(__dirname, "", "", __filename)} ${err}`);

    res.status(res.locals.status || 500).send(httpResponse);
});


export default app;
