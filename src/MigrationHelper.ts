/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

const marv = require("marv/api/promise"); // <-- Promise API
const driver = require("marv-mysql-driver");
import * as path from "path";
import { inTestMode } from "./util/Helper";
import logger from "./util/log/logger";
import { databaseConnection } from "./util/db/databaseConnection";

/**
 * clear migrations table
 */
async function clearMigrationsTable() {
    await databaseConnection.query("DELETE FROM migrations");
    logger.info("Cleared migrations!");
}


/**
 * run migration in Database
 */
export async function runMigrations(): Promise<void> {
    await clearMigrationsTable();

    const directory = path.resolve("migrations");

    logger.info("Running migrations!");

    const options = {

        table: "migrations",

        connection: {
            host: !inTestMode() ? process.env.DB_HOST : process.env.TEST_DB_HOST,
            port: 3306,
            database: !inTestMode() ? process.env.DB_DATABASE : process.env.TEST_DB_DATABASE,
            user: !inTestMode() ? process.env.DB_USER : process.env.TEST_DB_USER,
            password: !inTestMode() ? process.env.DB_PASS : process.env.TEST_DB_PASS
        }
    };

    const migrations = await marv.scan(directory);
    await marv.migrate(migrations, driver(options));

    logger.info("Completed running migrations!");
}
