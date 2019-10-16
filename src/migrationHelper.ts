/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Therapist } from "./lib/models/Therapist";

const marv = require("marv/api/promise"); // <-- Promise API
const driver = require("marv-mysql-driver");
import * as path from "path";
import { inProduction, inTestMode, loggerString } from "./util/Helper";
import logger from "./util/log/logger";
import { databaseConnection } from "./util/db/databaseConnection";
import { Roles } from "./lib/enums/Roles";
import { Gender } from "./lib/enums/Gender";
import { Status } from "./lib/enums/Status";
import { Patient } from "./lib/models/Patient";
import { PatientSetting } from "./lib/models/PatientSetting";
import { Difficulties } from "./lib/enums/Difficulties";
import { Difficulty } from "./lib/models/Difficulty";
import { Severity } from "./lib/models/Severity";
import { Severities } from "./lib/enums/Severities";
import { FoodCategory } from "./lib/models/FoodCategory";
import { Recipe } from "./lib/models/Recipe";
import { Ingredient } from "./lib/models/Ingredient";
import { RecipeIngredient } from "./lib/models/RecipeIngredient";
import { Game } from "./lib/models/Game";
import { GameSetting } from "./lib/models/GameSetting";
import { Helptext } from "./lib/models/Helptext";
import { HelptextGame } from "./lib/models/HelptextGame";
import { TherapistFacade } from "./db/entity/user/TherapistFacade";
import { PatientFacade } from "./db/entity/user/PatientFacade";
import { PatientSettingFacade } from "./db/entity/settings/PatientSettingFacade";
import { DifficultyFacade } from "./db/entity/enum/DifficultyFacade";
import { SeverityFacade } from "./db/entity/enum/SeverityFacade";
import { FoodCategoryFacade } from "./db/entity/enum/FoodCategoryFacade";
import { RecipeFacade } from "./db/entity/kitchen/RecipeFacade";
import { IngredientFacade } from "./db/entity/kitchen/IngredientFacade";
import { RecipeIngredientFacade } from "./db/entity/kitchen/RecipeIngredientFacade";
import { GameFacade } from "./db/entity/game/GameFacade";
import { GameSettingFacade } from "./db/entity/settings/GameSettingFacade";
import { HelptextFacade } from "./db/entity/helptext/HelptextFacade";
import { HelptextsGamesFacade } from "./db/entity/helptext/HelptextsGamesFacade";
import {
    lockedTherapist,
    tooManyFailedLoginAttemptsTherapist,
    unacceptedTherapist,
    validAdminTherapist, validPatient,
    validTherapist
} from "./seeds/users";

/**
 * runs multiple migrations based on .env variables
 *
 * - truncateTables: truncate every table in the application
 * - dropTables: drop every table in the application
 * - runMigrations: run migrations from migrations folder
 * - seedTables: seed tables with test data
 */
export async function migrate(): Promise<void> {
    if (inProduction() || inTestMode()) {
        return;
    }

    const runTruncateTable = Number(process.env.RUN_TRUNCATE_TABLE) || 0;
    const runDropTable     = Number(process.env.RUN_DROP_TABLE) || 0;
    const runMigration     = Number(process.env.RUN_MIGRATIONS) || 0;
    const runSeed          = Number(process.env.RUN_SEED) || 0;

    if (runTruncateTable === 1) {
        logger.info(`${loggerString(__dirname, "", "", __filename)} Truncate tables!`);
        await truncateTables();
    } else {
        logger.warn(`${loggerString(__dirname, "", "", __filename)} Running truncate tables is skipped!`);
    }

    if (runDropTable === 1) {
        logger.info(`${loggerString(__dirname, "", "", __filename)} Drop tables!`);
        await dropTables();
    } else {
        logger.warn(`${loggerString(__dirname, "", "", __filename)} Running drop tables is skipped!`);
    }

    if (runMigration === 1) {
        logger.info(`${loggerString(__dirname, "", "", __filename)} Running Migrations!`);
        await runMigrations();
    } else {
        logger.warn(`${loggerString(__dirname, "", "", __filename)} Running migrations is skipped!`);
    }

    if (runSeed === 1) {
        logger.info(`${loggerString(__dirname, "", "", __filename)} Seeding tables!`);
        await seedTables();
    } else {
        logger.warn(`${loggerString(__dirname, "", "", __filename)} Seeding is skipped!`);
    }
}

/**
 * run migration in Database
 * successful migrations are stored in migrations table
 */
export async function runMigrations(): Promise<void> {
    const directory = path.resolve("migrations");

    logger.info(`${loggerString(__dirname, "", "", __filename)} Running migrations from ${directory}!`);

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

    logger.info(`${loggerString(__dirname, "", "", __filename)} Completed running migrations!`);
    return;
}

/**
 * truncate every table in the application
 */
export async function truncateTables(): Promise<void> {
    const results = await getTables();

    if (results.length == 0) {
        logger.info(`${loggerString(__dirname, "", "", __filename)} No tables to truncate!`);
        return;
    }

    logger.info(`${loggerString(__dirname, "", "", __filename)} Truncate ${results.length} tables!`);

    let stmt = "";
    for (const item of results) {
        stmt += `TRUNCATE TABLE ${item}; `;
    }
    await databaseConnection.query(`SET FOREIGN_KEY_CHECKS=0; ${stmt} SET FOREIGN_KEY_CHECKS=1;`);
}

/**
 * drop every table in the application
 */
export async function dropTables(): Promise<void> {
    const results = await getTables();

    if (results.length == 0) {
        logger.info(`${loggerString(__dirname, "", "", __filename)} No tables to drop!`);
        return;
    }

    logger.info(`${loggerString(__dirname, "", "", __filename)} Drop ${results.length} tables!`);

    let stmt = "";
    for (const item of results) {
        stmt += `DROP TABLE ${item}; `;
    }
    await databaseConnection.query(`SET FOREIGN_KEY_CHECKS=0; ${stmt} SET FOREIGN_KEY_CHECKS=1;`);
}

/**
 * seed tables with default data
 *
 * todo split in multiple files
 */
export async function seedTables(): Promise<void> {
    const results = await getTables();
    if (results.length == 0) {
        logger.info(`${loggerString(__dirname, "", "", __filename)} No tables to seed!`);
        return;
    }

    const therapistFacade = new TherapistFacade();
    await therapistFacade.insertTherapist(validAdminTherapist);
    await therapistFacade.insertTherapist(validTherapist);
    await therapistFacade.insertTherapist(unacceptedTherapist);
    await therapistFacade.insertTherapist(lockedTherapist);
    await therapistFacade.insertTherapist(tooManyFailedLoginAttemptsTherapist);

    const patientFacade = new PatientFacade();
    await patientFacade.insertPatient(validPatient);

    const pSettings = new PatientSetting();
    pSettings.neglect = true;
    pSettings.patientId = validPatient.id;

    const patientSettingFacade = new PatientSettingFacade();
    await patientSettingFacade.insertPatientSetting(pSettings);

    const difficultyEasy = new Difficulty();
    difficultyEasy.difficulty = Difficulties.EASY;

    const difficultyMedium = new Difficulty();
    difficultyMedium.difficulty = Difficulties.MEDIUM;

    const difficultyHard = new Difficulty();
    difficultyHard.difficulty = Difficulties.HARD;

    const difficultyFacade = new DifficultyFacade();
    const difficulties = [difficultyEasy, difficultyMedium, difficultyHard];
    for (const item of difficulties) {
        await difficultyFacade.insertDifficulty(item);
    }

    const severityEasy = new Severity();
    severityEasy.severity = Severities.LOW;

    const severityMedium = new Severity();
    severityMedium.severity = Severities.MEDIUM;

    const severityHard = new Severity();
    severityHard.severity = Severities.HIGH;

    const severityFacade = new SeverityFacade();
    const severities = [severityEasy, severityMedium, severityHard];
    for (const item of severities) {
        await severityFacade.insertSeverity(item);
    }

    const vegetables = new FoodCategory();
    vegetables.name = "Obst & Gemüse";

    const bread = new FoodCategory();
    bread.name = "Brot & Gebäck";

    const drinks = new FoodCategory();
    drinks.name = "Getränke";

    const chilledGoods = new FoodCategory();
    chilledGoods.name = "Kühlwaren";

    const deepFrozen = new FoodCategory();
    deepFrozen.name = "Tiefkühl";

    const sweets = new FoodCategory();
    sweets.name = "Süßes & Salziges";

    const care = new FoodCategory();
    care.name = "Pflege";

    const household = new FoodCategory();
    household.name = "Haushalt";

    const foodCategoryFacade = new FoodCategoryFacade();
    const foodCategories = [vegetables, bread, drinks, chilledGoods, deepFrozen, sweets, care, household];
    for (const item of foodCategories) {
        await foodCategoryFacade.insertFoodCategory(item);
    }

    const scrambledEgg = new Recipe();
    scrambledEgg.name = "Rührei";
    scrambledEgg.description = "Die Eier zerschlagen und in der Pfanne ca. 10 Minuten braten lassen.";
    scrambledEgg.difficultyId = difficultyEasy.id;

    const roastPork = new Recipe();
    roastPork.name = "Schweinsbraten";
    roastPork.description = "";
    roastPork.difficultyId = difficultyEasy.id;

    const proteinShake = new Recipe();
    proteinShake.name = "Thunfisch-Proteinshake";
    proteinShake.description = "Thunfisch und Whey Isolat in den Mixer und 5 Sekunden mixen. Danach kühl genießen.";
    proteinShake.difficultyId = difficultyEasy.id;

    const recipeFacade = new RecipeFacade();
    const recipes = [scrambledEgg, roastPork, proteinShake];
    for (const item of recipes) {
        await recipeFacade.insertRecipe(item);
    }

    const egg = new Ingredient();
    egg.name = "Ei";
    egg.foodCategoryId = vegetables.id;

    const oil = new Ingredient();
    oil.name = "Öl";
    oil.foodCategoryId = vegetables.id;

    const ingredientFacade = new IngredientFacade();
    const ingredients = [egg, oil];
    for (const item of ingredients) {
        await ingredientFacade.insertIngredient(item);
    }

    const recipeIngredient1 = new RecipeIngredient();
    recipeIngredient1.recipeId = scrambledEgg.id;
    recipeIngredient1.ingredientId = egg.id;

    const recipeIngredient2 = new RecipeIngredient();
    recipeIngredient2.recipeId = scrambledEgg.id;
    recipeIngredient2.ingredientId = oil.id;

    const recipeIngredientFacade = new RecipeIngredientFacade();
    const recipeIngredients = [recipeIngredient1, recipeIngredient2];
    for (const item of recipeIngredients) {
        await recipeIngredientFacade.insertRecipeIngredient(item);
    }

    const game = new Game();
    game.name = "Tagesplanung";
    game.description = "Planen Sie ihren Tag";
    game.component = "day-planning";

    const game2 = new Game();
    game2.name = "Rezept";
    game2.description = "Merken Sie sich das Rezept.";
    game2.component = "recipe";

    const game3 = new Game();
    game3.name = "Einkaufsliste";
    game3.description = "Erstellen Sie die Einkaufsliste.";
    game3.component = "shopping-list";

    const game4 = new Game();
    game4.name = "Einkaufszentrum";
    game4.description = "Kaufen Sie ein.";
    game4.component = "shopping-center";

    const gameFacade = new GameFacade();
    const games = [game, game2, game3, game4];
    for (const item of games) {
        await gameFacade.insertGame(item);
    }

    const gameSettings = new GameSetting();
    gameSettings.gameId = game.id;
    gameSettings.difficultyId = difficultyEasy.id;

    const gameSettings1 = new GameSetting();
    gameSettings1.gameId = game2.id;
    gameSettings1.difficultyId = difficultyEasy.id;

    const gameSettings2 = new GameSetting();
    gameSettings2.gameId = game3.id;
    gameSettings2.difficultyId = difficultyEasy.id;

    const gameSettings3 = new GameSetting();
    gameSettings3.gameId = game4.id;
    gameSettings3.difficultyId = difficultyEasy.id;

    const gameSettingFacade = new GameSettingFacade();
    const gameSettingsArr = [gameSettings, gameSettings1, gameSettings2, gameSettings3];
    for (const item of gameSettingsArr) {
        await gameSettingFacade.insertGameSetting(item);
    }

    const helptext = new Helptext();
    helptext.name = "recipe";
    helptext.text = `Bitte prägen Sie sich das obrige Rezept gut ein! Sie werden es in den nächsten Schritten benötigen. Klicken Sie auf "Weiter", wenn Sie bereit sind`;

    const helptextFacade = new HelptextFacade();
    await helptextFacade.insertHelptext(helptext);

    const helptextGames = new HelptextGame();
    helptextGames.gameId = game.id;
    helptextGames.helptextId = helptext.id;

    const helptextGameFacade = new HelptextsGamesFacade();
    await helptextGameFacade.insertHelptextGames(helptextGames);

}

/**
 * retrieves every table from the specified database except migrations and migration_lock
 * testMode -> choose tables from test_db
 * prodMode -> choose tables from prod_db
 */
async function getTables(): Promise<string[]> {
    logger.debug(`${loggerString(__dirname, "", "", __filename)} Retrieve all tables of the application!`);

    const results = await databaseConnection.query(`SELECT table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = "${!inTestMode() ? process.env.DB_DATABASE : process.env.TEST_DB_DATABASE}"`);

    return results.map(value => value["table_name"]);
}
