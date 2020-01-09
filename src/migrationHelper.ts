/*
 * Copyright (c) 2020 Florian Mold
 * All rights reserved.
 */

import * as path from "path";

import { DifficultyFacade } from "./db/entity/enum/DifficultyFacade";
import { FoodCategoryFacade } from "./db/entity/enum/FoodCategoryFacade";
import { SeverityFacade } from "./db/entity/enum/SeverityFacade";
import { GameFacade } from "./db/entity/game/GameFacade";
import { SessionFacade } from "./db/entity/game/SessionFacade";
import { StatisticFacade } from "./db/entity/game/StatisticFacade";
import { ErrortextFacade } from "./db/entity/helptext/ErrortextFacade";
import { ErrortextGamesFacade } from "./db/entity/helptext/ErrortextGamesFacade";
import { ErrortextStatisticFacade } from "./db/entity/helptext/ErrortextStatisticFacade";
import { HelptextFacade } from "./db/entity/helptext/HelptextFacade";
import { HelptextsGamesFacade } from "./db/entity/helptext/HelptextsGamesFacade";
import { ImageFacade } from "./db/entity/image/ImageFacade";
import { IngredientFacade } from "./db/entity/kitchen/IngredientFacade";
import { RecipeFacade } from "./db/entity/kitchen/RecipeFacade";
import { RecipeIngredientFacade } from "./db/entity/kitchen/RecipeIngredientFacade";
import { LogFacade } from "./db/entity/log/LogFacade";
import { SmtpLogFacade } from "./db/entity/log/SmtpLogFacade";
import { GameSettingFacade } from "./db/entity/settings/GameSettingFacade";
import { PatientSettingFacade } from "./db/entity/settings/PatientSettingFacade";
import { PatientFacade } from "./db/entity/user/PatientFacade";
import { TherapistFacade } from "./db/entity/user/TherapistFacade";
import { TherapistsPatientsFacade } from "./db/entity/user/TherapistsPatientsFacade";
import { WordFacade } from "./db/entity/word/WordFacade";
import { difficultyEasy, difficultyHard, difficultyMedium } from "./seeds/difficulties";
import {
    fridgeNotCheckedErrorTextGames,
    itemAlreadyInFridgeErrorTextGames,
    mealtimeErrorTextGames,
    shoppingCartErrorTextGames,
    shoppingListErrorTextGames,
} from "./seeds/errortextGames";
import {
    fridgeNotCheckedError,
    itemAlreadyInFridgeError,
    mealtimeError,
    shoppingCartError,
    shoppingListError,
} from "./seeds/errortexts";
import {
    fridgeNotCheckedErrorTextGamesStatistic,
    itemAlreadyInFridgeErrorTextGamesStatistic,
    mealtimeErrorTextGamesStatistic,
    shoppingCartErrorTextGamesStatistic,
    shoppingListErrorTextGamesStatistic,
} from "./seeds/errortextStatistic";
import {
    bread,
    chilledGoods,
    deepFrozen,
    drinks,
    stapleFood,
    sweets,
    vegetables
} from "./seeds/foodCategories";
import { game, game2, game3, game4 } from "./seeds/games";
import { gameSettings, gameSettings1, gameSettings2, gameSettings3 } from "./seeds/gameSettings";
import { helptextGames, helptextGames1 } from "./seeds/helptextGames";
import { helptext, helptext1 } from "./seeds/helptexts";
import { loadImages } from "./seeds/images";
import {
    beef, blackbread, bun,
    cheese, chips, chocolate, dough,
    egg,
    ham, icetea,
    noodle,
    oil, onion, orangejuice,
    paprika, pistachios, pommes,
    porkMeat,
    potato, salad,
    sauerkraut, spaetzle,
    spinach, tomatoSauce, water, wok, zwieback
} from "./seeds/ingredients";
import { debugLog, errorLogWithUser, infoLogWithUser, verboseLogWithUser } from "./seeds/logs";
import { pSettings } from "./seeds/patientSettings";
import {
    recipeIngredient1, recipeIngredient10, recipeIngredient11,
    recipeIngredient12, recipeIngredient13, recipeIngredient14,
    recipeIngredient15, recipeIngredient16, recipeIngredient17,
    recipeIngredient18, recipeIngredient19,
    recipeIngredient2, recipeIngredient20,
    recipeIngredient21, recipeIngredient22, recipeIngredient23,
    recipeIngredient24, recipeIngredient25,
    recipeIngredient26,
    recipeIngredient27, recipeIngredient28,
    recipeIngredient29,
    recipeIngredient3,
    recipeIngredient30, recipeIngredient4, recipeIngredient5,
    recipeIngredient6, recipeIngredient7, recipeIngredient8,
    recipeIngredient9
} from "./seeds/recipeIngredients";
import {
    burger,
    cheeseNoodles,
    goulash,
    pastaSalad, pizza,
    roastPork,
    schnitzel,
    scrambledEgg,
    spaghetti,
    tafelspitz
} from "./seeds/recipes";
import { session } from "./seeds/sessions";
import { severityEasy, severityHard, severityMedium } from "./seeds/severities";
import { notSentSmtpLog, sentSmtpLog, simulatedSmtpLog } from "./seeds/smtpLogs";
import { statistic, statistic1 } from "./seeds/statistics";
import { therapistPatient1, therapistPatient2 } from "./seeds/therapistsPatients";
import {
    lockedTherapist,
    tooManyFailedLoginAttemptsTherapist,
    unacceptedTherapist,
    validAdminTherapist,
    validPatient,
    validPatient1,
    validTherapist,
} from "./seeds/users";
import { word } from "./seeds/words";
import { databaseConnection } from "./util/db/databaseConnection";
import { inProduction, inTestMode, loggerString } from "./util/Helper";
import logger from "./util/log/logger";

// tslint:disable-next-line:no-var-requires
const marv = require("marv/api/promise"); // <-- Promise API
// tslint:disable-next-line:no-var-requires
const driver = require("marv-mysql-driver");

/**
 * Runs multiple migration processes on the database. Every operation can be
 * disabled in the .env.
 *
 * - truncateTables: Truncate every table in the application.
 * - dropTables: Drop every table in the application.
 * - runMigrations: Run migrations from migrations folder.
 * - seedTables: Seed tables with test data.
 */
export async function migrate(): Promise<void> {
    if (inProduction()) {
        return;
    }

    const runTruncateTable = Number(process.env.RUN_TRUNCATE_TABLE) || 0;
    const runDropTable = Number(process.env.RUN_DROP_TABLE) || 0;
    const runMigration = Number(process.env.RUN_MIGRATIONS) || 0;
    const runSeed = Number(process.env.RUN_SEED) || 0;

    if (runTruncateTable === 1) {
        logger.info(
            `${loggerString(__dirname, "", "", __filename)} Truncate tables!`
        );
        await truncateTables();
    } else {
        logger.warn(
            `${loggerString(__dirname, "", "", __filename)} Running truncate tables is skipped!`
        );
    }

    if (runDropTable === 1) {
        logger.info(
            `${loggerString(__dirname, "", "", __filename)} Drop tables!`
        );
        await dropTables();
    } else {
        logger.warn(
            `${loggerString(__dirname, "", "", __filename)} Running drop tables is skipped!`
        );
    }

    if (runMigration === 1) {
        logger.info(
            `${loggerString(__dirname, "", "", __filename)} Running Migrations!`
        );
        await runMigrations();
    } else {
        logger.warn(
            `${loggerString(__dirname, "", "", __filename)} Running migrations is skipped!`
        );
    }

    if (runSeed === 1) {
        logger.info(
            `${loggerString(__dirname, "", "", __filename)} Seeding tables!`
        );
        await seedTables();
    } else {
        logger.warn(
            `${loggerString(__dirname, "", "", __filename)} Seeding is skipped!`
        );
    }
}

/**
 * Run migrations to create tables in the database. Depending on the environment (test, prod) the test-database or the
 * production-database is seeded.
 */
export async function runMigrations(): Promise<void> {
    const directory = path.resolve("migrations");

    logger.info(
        `${loggerString(__dirname, "", "", __filename)} Running migrations from ${directory}!`
    );

    const options = {
        table: "migrations",

        connection: {
            database: !inTestMode()
                ? process.env.DB_DATABASE
                : process.env.TEST_DB_DATABASE,
            host: !inTestMode()
                ? process.env.DB_HOST
                : process.env.TEST_DB_HOST,
            password: !inTestMode()
                ? process.env.DB_PASS
                : process.env.TEST_DB_PASS,
            port: 3306,
            user: !inTestMode() ? process.env.DB_USER : process.env.TEST_DB_USER
        }
    };

    const migrations = await marv.scan(directory);
    await marv.migrate(migrations, driver(options));

    logger.info(
        `${loggerString(__dirname, "", "", __filename)} Completed running migrations!`
    );
}

/**
 * Truncates every table of the specified database. First it checks if the database contains at least one table.
 * If that is the case, all tables are truncated.
 */
export async function truncateTables(): Promise<number> {
    const results = await getTables();

    if (results.length === 0) {
        logger.info(
            `${loggerString(__dirname, "", "", __filename)} No tables to truncate!`
        );
        return 0;
    }

    logger.info(
        `${loggerString(__dirname, "", "", __filename)} Truncate ${results.length} tables!`
    );

    let stmt = "";
    for (const item of results) {
        stmt += `TRUNCATE TABLE ${item}; `;
    }

    await databaseConnection.query(
        `SET FOREIGN_KEY_CHECKS=0; ${stmt} SET FOREIGN_KEY_CHECKS=1;`
    );

    return 1;
}

/**
 * Drops every table of the specified database. First it checks if the database contains at least one table.
 * If that is the case, all tables are dropped.
 */
export async function dropTables(): Promise<number> {
    const results = await getTables();

    if (results.length === 0) {
        logger.info(
            `${loggerString(__dirname, "", "", __filename)} No tables to drop!`
        );
        return 0;
    }

    logger.info(
        `${loggerString(__dirname, "", "", __filename)} Drop ${results.length} tables!`
    );

    let stmt = "";
    for (const item of results) {
        stmt += `DROP TABLE ${item}; `;
    }

    await databaseConnection.query(
        `SET FOREIGN_KEY_CHECKS=0; ${stmt} SET FOREIGN_KEY_CHECKS=1;`
    );

    return 1;
}

/**
 * Seeds all tables with example data. If no tables were found, the function returns
 * 0. If all tables were seeded successfully, the function returns 1. When an error
 * occurs, the function throws an error.
 */
export async function seedTables(): Promise<number> {
    const results = await getTables();
    if (results.length === 0) {
        logger.info(
            `${loggerString(__dirname, "", "", __filename)} No tables to seed!`
        );
        return 0;
    }

    await seedUsers();
    await seedPatientSettings();
    await seedDifficulties();
    await seedRecipes();
    await seedFoodCategories();
    await seedSeverities();
    await seedImages();
    await seedIngredients();
    await seedRecipeIngredientFacade();
    await seedGames();
    await seedGameSettings();
    await seedHelptexts();
    await seedErrortexts();
    await seedErrortextGames();
    await seedHelptextGames();
    await seedWords();
    await seedStatistics();
    await seedSessions();
    await seedSmtpLogs();
    await seedLogs();
    await seedTherapistPatients();
    await seedErrortextStatistics();

    return 1;
}

/**
 * Inserts example patient-settings into the database.
 */
export async function seedPatientSettings() {
    const patientSettingFacade = new PatientSettingFacade();
    await patientSettingFacade.insert(pSettings);
}

/**
 * Inserts example images into the database.
 */
export async function seedImages() {
    const imageFacade = new ImageFacade();
    const imageArr = await loadImages();
    for (const item of imageArr) {
        await imageFacade.insert(item);
    }
}

/**
 * Inserts example sessions into the database.
 */
export async function seedSessions() {
    const sessionFacade = new SessionFacade();
    const sessionsArr = [session];
    for (const item of sessionsArr) {
        await sessionFacade.insert(item);
    }
}

/**
 * Inserts example statistics into the database.
 */
export async function seedStatistics() {
    const statisticFacade = new StatisticFacade();
    const statisticsArr = [statistic, statistic1];
    for (const item of statisticsArr) {
        await statisticFacade.insert(item);
    }
}

/**
 * Inserts example words into the database.
 */
export async function seedWords() {
    const wordFacade = new WordFacade();
    await wordFacade.insert(word);
}

/**
 * Inserts example errortexts into the database.
 */
export async function seedErrortexts() {
    const errorTextFacade = new ErrortextFacade();
    const errortextArr = [
        mealtimeError,
        shoppingCartError,
        fridgeNotCheckedError,
        itemAlreadyInFridgeError,
        shoppingListError
    ];
    for (const item of errortextArr) {
        await errorTextFacade.insert(item);
    }
}

/**
 * Inserts example errortext-game relationships into the database.
 */
export async function seedErrortextGames() {
    const errortextGameFacade = new ErrortextGamesFacade();
    const errortextGamesArr = [
        mealtimeErrorTextGames,
        shoppingCartErrorTextGames,
        fridgeNotCheckedErrorTextGames,
        itemAlreadyInFridgeErrorTextGames,
        shoppingListErrorTextGames
    ];

    for (const item of errortextGamesArr) {
        await errortextGameFacade.insert(item);
    }
}

/**
 * Inserts example errortext-statistic relationships into the database.
 */
export async function seedErrortextStatistics() {
    const errortextStatisticFacade = new ErrortextStatisticFacade();
    const errortextStatisticArr = [
        mealtimeErrorTextGamesStatistic,
        shoppingCartErrorTextGamesStatistic,
        fridgeNotCheckedErrorTextGamesStatistic,
        itemAlreadyInFridgeErrorTextGamesStatistic,
        shoppingListErrorTextGamesStatistic
    ];

    for (const item of errortextStatisticArr) {
        await errortextStatisticFacade.insert(item);
    }
}

/**
 * Inserts example helptext-game relationships into the database.
 */
export async function seedHelptextGames() {
    const helptextGameFacade = new HelptextsGamesFacade();
    const helptextGameArr = [helptextGames, helptextGames1];

    for (const item of helptextGameArr) {
        await helptextGameFacade.insert(item);
    }
}

/**
 * Inserts example help-texts into the database.
 */
export async function seedHelptexts() {
    const helptextFacade = new HelptextFacade();
    const helptextArr = [helptext, helptext1];

    for (const item of helptextArr) {
        await helptextFacade.insert(item);
    }
}

/**
 * Inserts example game-settings into the database.
 */
export async function seedGameSettings() {
    const gameSettingFacade = new GameSettingFacade();
    const gameSettingsArr = [
        gameSettings,
        gameSettings1,
        gameSettings2,
        gameSettings3
    ];
    for (const item of gameSettingsArr) {
        await gameSettingFacade.insert(item);
    }
}

/**
 * Inserts example games into the database.
 */
export async function seedGames() {
    const gameFacade = new GameFacade();
    const games = [game, game2, game3, game4];
    for (const item of games) {
        await gameFacade.insert(item);
    }
}

/**
 * Inserts example ingredients into the database.
 */
export async function seedIngredients() {
    const ingredientFacade = new IngredientFacade();
    const ingredients = [
        egg, oil, spinach, porkMeat, potato, sauerkraut,
        beef, noodle, ham, cheese, paprika, dough,
        tomatoSauce, salad, bun, onion, spaetzle, chips, chocolate,
        pistachios, pommes, wok, blackbread, icetea, orangejuice, water, zwieback
    ];

    for (const item of ingredients) {
        await ingredientFacade.insert(item);
    }
}

/**
 * Inserts example recipe-ingredient relationships into the database.
 */
export async function seedRecipeIngredientFacade() {
    const recipeIngredientFacade = new RecipeIngredientFacade();
    const recipeIngredients = [
        recipeIngredient1, recipeIngredient2, recipeIngredient3,
        recipeIngredient4, recipeIngredient5, recipeIngredient6,
        recipeIngredient7, recipeIngredient8, recipeIngredient9,
        recipeIngredient10, recipeIngredient11, recipeIngredient12,
        recipeIngredient13, recipeIngredient14, recipeIngredient15,
        recipeIngredient16, recipeIngredient17, recipeIngredient18,
        recipeIngredient19, recipeIngredient20, recipeIngredient21,
        recipeIngredient22, recipeIngredient23, recipeIngredient24,
        recipeIngredient25, recipeIngredient26, recipeIngredient27,
        recipeIngredient28, recipeIngredient29, recipeIngredient30
    ];
    for (const item of recipeIngredients) {
        await recipeIngredientFacade.insert(item);
    }
}

/**
 * Inserts example recipes into the database.
 */
export async function seedRecipes() {
    const recipeFacade = new RecipeFacade();
    const recipes = [
        scrambledEgg, roastPork, schnitzel, pastaSalad,
        pizza, spaghetti, goulash, cheeseNoodles, tafelspitz,
        burger
    ];
    for (const item of recipes) {
        await recipeFacade.insert(item);
    }
}

/**
 * Inserts example food-categories into the database.
 */
export async function seedFoodCategories() {
    const foodCategoryFacade = new FoodCategoryFacade();
    const foodCategories = [
        vegetables,
        bread,
        drinks,
        chilledGoods,
        deepFrozen,
        sweets,
        stapleFood
    ];
    for (const item of foodCategories) {
        await foodCategoryFacade.insert(item);
    }
}

/**
 * Inserts example severities into the database.
 */
export async function seedSeverities() {
    const severityFacade = new SeverityFacade();
    const severities = [severityEasy, severityMedium, severityHard];
    for (const item of severities) {
        await severityFacade.insert(item);
    }
}

/**
 * Inserts example difficulties into the database.
 */
export async function seedDifficulties() {
    const difficultyFacade = new DifficultyFacade();
    const difficulties = [difficultyEasy, difficultyMedium, difficultyHard];
    for (const item of difficulties) {
        await difficultyFacade.insert(item);
    }
}

/**
 * Inserts example users (therapists, patients) into the database.
 */
export async function seedUsers(): Promise<void> {
    const therapistFacade = new TherapistFacade();
    const therapists = [
        validAdminTherapist,
        validTherapist,
        unacceptedTherapist,
        lockedTherapist,
        tooManyFailedLoginAttemptsTherapist
    ];

    for (const item of therapists) {
        await therapistFacade.insert(item);
    }

    const patientFacade = new PatientFacade();
    const patients = [validPatient, validPatient1];
    for (const item of patients) {
        await patientFacade.insert(item);
    }
}

/**
 * inserts example smtp-logs into the database.
 */
export async function seedSmtpLogs(): Promise<void> {
    const smtpLogFacade = new SmtpLogFacade();
    const smtpLogsArr = [sentSmtpLog, simulatedSmtpLog, notSentSmtpLog];
    for (const item of smtpLogsArr) {
        await smtpLogFacade.insert(item);
    }
}

/**
 * Inserts example logs into the database.
 */
export async function seedLogs(): Promise<void> {
    const logFacade = new LogFacade();
    const logArr = [
        debugLog,
        infoLogWithUser,
        errorLogWithUser,
        verboseLogWithUser
    ];
    for (const item of logArr) {
        await logFacade.insert(item);
    }
}

/**
 * Inserts example therapist-patient relationships into the database.
 */
export async function seedTherapistPatients(): Promise<void> {
    const therapistsPatientsFacade = new TherapistsPatientsFacade();
    const therapistPatientArr = [therapistPatient1, therapistPatient2];
    for (const item of therapistPatientArr) {
        await therapistsPatientsFacade.insert(item);
    }
}

/**
 * Retrieves all table-names from the specified database.
 */
async function getTables(): Promise<string[]> {
    logger.debug(
        `${loggerString(__dirname, "", "", __filename)} Retrieve all tables of the application!`
    );

    const results = await databaseConnection.query(
        `SELECT table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = "${
            !inTestMode()
                ? process.env.DB_DATABASE
                : process.env.TEST_DB_DATABASE
        }"`
    );

    return results.map((value) => value.table_name);
}
