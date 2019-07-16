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

const config: DotenvConfigOutput = dotenv.config({path: ".env"});
if (config.error) { // .env not found
  throw new Error("Config couldn't be loaded");
}

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
