/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

import { Therapist } from "./lib/models/Therapist";

const marv = require("marv/api/promise"); // <-- Promise API
const driver = require("marv-mysql-driver");
import * as path from "path";
import { inTestMode } from "./util/Helper";
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

/**
 * run migration in Database
 * successful migrations are stored in migrations table
 */
export async function runMigrations(): Promise<void> {
    if (!(process.env.RUN_MIGRATIONS === "1")) {
        logger.warn(`Running migrations is skipped!`);
        return;
    }

    await dropTables();

    const directory = path.resolve("migrations");

    logger.info(`Running migrations from ${directory}!`);

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

    if (process.env.RUN_SEED === "1") {
        await seedTables();
    } else {
        logger.warn(`Seeding is skipped!`);
    }

    logger.info("Completed running migrations!");
    return;
}

/**
 * drop every table in the application
 */
async function dropTables(): Promise<void> {
    logger.info(`Drop every table!`);

    const results = await databaseConnection.query("SELECT table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'serious-game'");
    let stmt = "";
    for (const item of results) {
        const tableName = item["table_name"];
        stmt += `DROP TABLE ${tableName}; `;
    }
    await databaseConnection.query(`SET FOREIGN_KEY_CHECKS=0; ${stmt} SET FOREIGN_KEY_CHECKS=1;`);
}

/**
 * seed tables with default data
 *
 * todo split in multiple files
 */
async function seedTables() {
    const t1 = new Therapist();
    t1.email = "therapist@example.org";
    t1.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
    t1.forename = "Therapeut";
    t1.lastname = "Therapeut";
    t1.gender = Gender.MALE;
    t1.failedLoginAttempts = 0;
    t1.status = Status.ACTIVE;
    t1.role = Roles.ADMIN;
    t1.accepted = true;

    const therapistFacade = new TherapistFacade();
    await therapistFacade.insertTherapist(t1);

    const p2 = new Patient();
    p2.email = "patient@example.org";
    p2.password = "$2y$12$yEETx0N9Rod3tZMeWBfb1enEdjIE19SUWCf4qpiosCX3w.SeDwCZu";
    p2.forename = "Patient";
    p2.lastname = "Patient";
    p2.gender = Gender.MALE;
    p2.failedLoginAttempts = 0;
    p2.status = Status.ACTIVE;
    p2.birthday = new Date();
    p2.info = "Testinfo";

    const patientFacade = new PatientFacade();
    await patientFacade.insertPatient(p2);

    const pSettings = new PatientSetting();
    pSettings.neglect = true;
    pSettings.patientId = p2.id;

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
