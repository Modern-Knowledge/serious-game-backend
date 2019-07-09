import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import passport from "passport";
import * as dotenv from "dotenv";
import { DatabaseConnection } from "./util/DatabaseConnection";


// TODO: check if loaded
dotenv.config({path: ".env"});


// Controllers (route handlers)
import * as homeController from "./controllers/home";

const databaseConnection = DatabaseConnection.getInstance();
// databaseConnection.query("SELECT * FROM USER");

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
app.get("/", homeController.index);

export default app;
