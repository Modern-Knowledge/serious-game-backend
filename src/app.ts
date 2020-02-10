/*
 * watch the order of the imports.
 * .env must be load before environment variables are used in loaded modules
 */

import bodyParser from "body-parser";
import compression from "compression"; // compresses requests
import cors from "cors";
import { DotenvConfigOutput } from "dotenv";
import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import fs from "fs";
import helmet from "helmet";
import lusca from "lusca";
import methodOverride from "method-override";
import moment from "moment";
import morgan from "morgan";
import passport from "passport";
import path from "path";
import swaggerUi from "swagger-ui-express";
import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "./lib/utils/http/HttpResponse";
import {HTTPStatusCode} from "./lib/utils/httpStatusCode";
import { specs } from "./util/documentation/swaggerSpecs";
import { getRequestUrl, inProduction, inTestMode, loggerString } from "./util/Helper";

process.env.TZ = "Europe/Vienna";
moment.locale("de");

const config: DotenvConfigOutput = dotenv.config({ path: ".env" });
if (config.error) {
    // .env not found
    const message = `${loggerString(
        __dirname,
        "",
        "",
        __filename
    )} .env couldn't be loaded!`;
    throw new Error(message);
}

import { migrate } from "./migrationHelper";
import { checkEnvFunction } from "./util/analysis/checkEnvVariables";
import { jwtStrategy } from "./util/authentication/jwtStrategy";
import logger from "./util/log/logger";
import { accessLogStream } from "./util/log/morgan";
import { logLimitSlowDown, logRequest, measureRequestTime } from "./util/middleware/middleware";

logger.info(`${loggerString(__dirname, "", "", __filename)} .env successfully loaded!`);
checkEnvFunction();

if (!inTestMode()) {
    migrate().then(() => {
        logger.info(`${loggerString(__dirname, "", "", __filename)} ` +
            `Successfully migrated!`);
    }).catch((error) => {
        logger.error(`Running migrations failed! (${error.message})`);
    });
}

// Create Express server
const app = express();
app.use(helmet());

// set morgan logger
app.use(morgan(inProduction() ? "combined" : "dev"));
app.use(morgan("combined", { stream: accessLogStream }));

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("env", inProduction() ? "production" : "development");

// options for cors middleware
const options: cors.CorsOptions = {};

// init middleware
app.use(cors(options));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

// set passport authentication
app.use(passport.initialize());
passport.use(jwtStrategy);

app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

/**
 * max 500 requests per ip in 10 minutes
 */
const limiter = rateLimit({
    max: Number(process.env.RATE_LIMITER_MAX) || 500,
    // @ts-ignore
    message: (new HttpResponse(HttpResponseStatus.FAIL,
        undefined, [
            new HttpResponseMessage(
                HttpResponseMessageSeverity.DANGER,
                "Zu viele Anfragen, probieren Sie es später nochmal")
        ])),
    windowMs: Number(process.env.RATE_LIMITER_DURATION) || 10 * 60 * 1000
});

/**
 * allow 200 requests in 5 minutes, before adding a 500ms delay per request above 200 requests
 */
const speedLimiter = slowDown({
    delayAfter: Number(process.env.SPEED_LIMIT_REQUEST_AFTER) || 200,
    delayMs:  Number(process.env.SPEED_LIMIT_DELAY_MS) || 500,
    windowMs:  Number(process.env.SPEED_LIMIT_DURATION) || 5 * 60 * 1000
});

// Controllers (route handlers)
import DifficultyController from "./controllers/DifficultyController";
import ErrortextController from "./controllers/ErrortextController";
import FoodCategoryController from "./controllers/FoodCategoryController";
import GameController from "./controllers/GameController";
import GameSettingController from "./controllers/GameSettingController";
import HelptextController from "./controllers/HelptextController";
import ImageController from "./controllers/ImageController";
import IngredientController from "./controllers/IngredientController";
import LogController from "./controllers/LogController";
import LoggingController from "./controllers/LoggingController";
import LoginController from "./controllers/LoginController";
import MealtimesController from "./controllers/MealtimesController";
import PasswordResetController from "./controllers/PasswordResetController";
import PatientController from "./controllers/PatientController";
import PatientSettingController from "./controllers/PatientSettingController";
import RecipeController from "./controllers/RecipeController";
import SessionController from "./controllers/SessionController";
import SmtpLoggingController from "./controllers/SmtpLoggingController";
import StatisticController from "./controllers/StatisticController";
import TherapistController from "./controllers/TherapistController";
import UserController from "./controllers/UserController";
import UtilController from "./controllers/UtilController";
import VersionController from "./controllers/VersionController";
import WordController from "./controllers/WordController";
import { supportMail } from "./mail-texts/supportMail";
import { Mail } from "./util/mail/Mail";
import { mailTransport } from "./util/mail/mailTransport";
import { Recipient } from "./util/mail/Recipient";

/**
 * limit requests
 */
app.use(limiter);

/**
 * delay requests
 */
app.use(speedLimiter);

/**
 * measure response time
 */
app.use(measureRequestTime);

/**
 * logs request with winston
 */
app.use(logRequest);

/**
 * logs information about slow-down and rate-limiter
 */
app.use(logLimitSlowDown);

/**
 * Primary app routes.
 */
app.use("/", LoginController);
app.use("/version", VersionController);
app.use("/users", UserController);
app.use("/logging", LoggingController);
app.use("/images", ImageController);
app.use("/therapists", TherapistController);
app.use("/patients", PatientController);
app.use("/password", PasswordResetController);
app.use("/recipes", RecipeController);
app.use("/words", WordController);
app.use("/sessions", SessionController);
app.use("/statistics", StatisticController);
app.use("/games", GameController);
app.use("/helptexts", HelptextController);
app.use("/ingredients", IngredientController);
app.use("/errortexts", ErrortextController);
app.use("/food-categories", FoodCategoryController);
app.use("/game-settings", GameSettingController);
app.use("/smtp-logs", SmtpLoggingController);
app.use("/patient-settings", PatientSettingController);
app.use("/util", UtilController);
app.use("/difficulties", DifficultyController);
app.use("/mealtimes", MealtimesController);
app.use("/logs", LogController);

app.use("/", async (req: Request, res: Response) => {
    const file = fs.readFileSync("Changelog.md");
    res.contentType("text/plain");
    return res.send(file.toString());
});

/**
 * swagger api routes
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// take care of 404 errors
// matches all routes
// only execute if nothing is sent before -> 404 route not found
app.use((req: Request, res: Response, next: any) => {
    if (!res.headersSent) {
        const error: Error = new Error("Route not found " + `"${req.method} ${getRequestUrl(req)}"`);
        res.locals.status = HTTPStatusCode.NOT_FOUND;
        next(error);
    }
});

// development error handler
// will print stacktrace
app.use((err: Error, req: Request, res: Response, next: any) => {
    if (res.headersSent) {
        return next(err);
    }

    let data;

    if (!inProduction()) {
        data = err.stack;
    }

    const httpResponse = new HttpResponse(HttpResponseStatus.ERROR, data, []);

    // send mail with error to support
    const m = new Mail([new Recipient("Support", process.env.SUPPORT_MAIL)],
        supportMail, [err.name, err.message, "<code>" + err.stack + "</code>"]);

    if (!inTestMode()) {
        mailTransport.sendMail(m);
    }

    logger.error(`${loggerString(__dirname, "", "", __filename)} ${err.message}`);

    return res.status(res.locals.status || HTTPStatusCode.INTERNAL_SERVER_ERROR).send(httpResponse);
});

export default app;
