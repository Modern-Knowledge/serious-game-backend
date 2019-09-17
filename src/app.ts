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


process.env.TZ = "Europe/Vienna";
moment.locale("de");

const config: DotenvConfigOutput = dotenv.config({path: ".env", debug: process.env.NODE_ENV !== "production"});
if (config.error) { // .env not found
  const message: string = `${Helper.loggerString(__dirname, "", "", __filename)} .env couldn't be loaded!`;
  logger.error(message);
  throw new Error(message);
}
logger.info(`${Helper.loggerString(__dirname, "", "", __filename)} .env successfully loaded!`);

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
app.use("/user", UserController);
app.use("/logging", LoggingController);
app.use("/images", ImageController);


export default app;
