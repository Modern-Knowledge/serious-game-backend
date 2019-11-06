import { Therapist } from "./lib/models/Therapist";

const marv = require("marv/api/promise"); // <-- Promise API
const driver = require("marv-mysql-driver");
import * as path from "path";
import { inProduction, inTestMode, loggerString } from "./util/Helper";
import logger from "./util/log/logger";
import { databaseConnection } from "./util/db/databaseConnection";
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
  validAdminTherapist,
  validPatient,
  validPatient1,
  validTherapist
} from "./seeds/users";
import { ErrortextFacade } from "./db/entity/helptext/ErrortextFacade";
import { WordFacade } from "./db/entity/word/WordFacade";
import {
  difficultyEasy,
  difficultyHard,
  difficultyMedium
} from "./seeds/difficulties";
import { severityEasy, severityHard, severityMedium } from "./seeds/severities";
import {
  bread,
  care,
  chilledGoods,
  deepFrozen,
  drinks,
  household,
  sweets,
  vegetables
} from "./seeds/foodCategories";
import { proteinShake, roastPork, scrambledEgg } from "./seeds/recipes";
import { egg, oil } from "./seeds/ingredients";
import { game, game2, game3, game4 } from "./seeds/games";
import {
  gameSettings,
  gameSettings1,
  gameSettings2,
  gameSettings3
} from "./seeds/gameSettings";
import {
  recipeIngredient1,
  recipeIngredient2
} from "./seeds/recipeIngredients";
import { helptext } from "./seeds/helptexts";
import { errortext, errortext1 } from "./seeds/errortexts";
import { word } from "./seeds/words";
import { helptextGames } from "./seeds/helptextGames";
import { pSettings } from "./seeds/patientSettings";
import { StatisticFacade } from "./db/entity/game/StatisticFacade";
import { statistic, statistic1 } from "./seeds/statistics";
import { SessionFacade } from "./db/entity/game/SessionFacade";
import { session } from "./seeds/sessions";
import { ImageFacade } from "./db/entity/image/ImageFacade";
import { image } from "./seeds/images";
import { SmtpLogFacade } from "./db/entity/log/SmtpLogFacade";
import {
  notSentSmtpLog,
  sentSmtpLog,
  simulatedSmtpLog
} from "./seeds/smtpLogs";
import { LogFacade } from "./db/entity/log/LogFacade";
import {
  debugLog,
  errorLogWithUser,
  infoLogWithUser,
  verboseLogWithUser
} from "./seeds/logs";
import { ErrortextGamesFacade } from "./db/entity/helptext/ErrortextGamesFacade";
import { errortextGames } from "./seeds/errortextGames";
import { TherapistsPatientsFacade } from './db/entity/user/TherapistsPatientsFacade'
import { therapistPatient1, therapistPatient2 } from './seeds/therapistsPatients'

/**
 * runs multiple migrations based on .env variables
 *
 * - truncateTables: truncate every table in the application
 * - dropTables: drop every table in the application
 * - runMigrations: run migrations from migrations folder
 * - seedTables: seed tables with test data
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
      `${loggerString(
        __dirname,
        "",
        "",
        __filename
      )} Running truncate tables is skipped!`
    );
  }

  if (runDropTable === 1) {
    logger.info(`${loggerString(__dirname, "", "", __filename)} Drop tables!`);
    await dropTables();
  } else {
    logger.warn(
      `${loggerString(
        __dirname,
        "",
        "",
        __filename
      )} Running drop tables is skipped!`
    );
  }

  if (runMigration === 1) {
    logger.info(
      `${loggerString(__dirname, "", "", __filename)} Running Migrations!`
    );
    await runMigrations();
  } else {
    logger.warn(
      `${loggerString(
        __dirname,
        "",
        "",
        __filename
      )} Running migrations is skipped!`
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
 * run migration in Database
 * successful migrations are stored in migrations table
 */
export async function runMigrations(): Promise<void> {
  const directory = path.resolve("migrations");

  logger.info(
    `${loggerString(
      __dirname,
      "",
      "",
      __filename
    )} Running migrations from ${directory}!`
  );

  const options = {
    table: "migrations",

    connection: {
      host: !inTestMode() ? process.env.DB_HOST : process.env.TEST_DB_HOST,
      port: 3306,
      database: !inTestMode()
        ? process.env.DB_DATABASE
        : process.env.TEST_DB_DATABASE,
      user: !inTestMode() ? process.env.DB_USER : process.env.TEST_DB_USER,
      password: !inTestMode() ? process.env.DB_PASS : process.env.TEST_DB_PASS
    }
  };

  const migrations = await marv.scan(directory);
  await marv.migrate(migrations, driver(options));

  logger.info(
    `${loggerString(
      __dirname,
      "",
      "",
      __filename
    )} Completed running migrations!`
  );
  return;
}

/**
 * truncate every table in the application
 */
export async function truncateTables(): Promise<void> {
  const results = await getTables();

  if (results.length == 0) {
    logger.info(
      `${loggerString(__dirname, "", "", __filename)} No tables to truncate!`
    );
    return;
  }

  logger.info(
    `${loggerString(__dirname, "", "", __filename)} Truncate ${
      results.length
    } tables!`
  );

  let stmt = "";
  for (const item of results) {
    stmt += `TRUNCATE TABLE ${item}; `;
  }
  await databaseConnection.query(
    `SET FOREIGN_KEY_CHECKS=0; ${stmt} SET FOREIGN_KEY_CHECKS=1;`
  );
}

/**
 * drop every table in the application
 */
export async function dropTables(): Promise<void> {
  const results = await getTables();

  if (results.length == 0) {
    logger.info(
      `${loggerString(__dirname, "", "", __filename)} No tables to drop!`
    );
    return;
  }

  logger.info(
    `${loggerString(__dirname, "", "", __filename)} Drop ${
      results.length
    } tables!`
  );

  let stmt = "";
  for (const item of results) {
    stmt += `DROP TABLE ${item}; `;
  }
  await databaseConnection.query(
    `SET FOREIGN_KEY_CHECKS=0; ${stmt} SET FOREIGN_KEY_CHECKS=1;`
  );
}

/**
 * seed tables with default data
 *
 */
export async function seedTables(): Promise<void> {
  const results = await getTables();
  if (results.length == 0) {
    logger.info(
      `${loggerString(__dirname, "", "", __filename)} No tables to seed!`
    );
    return;
  }

  await seedUsers();
  await seedPatientSettings();
  await seedDifficulties();
  await seedRecipes();
  await seedFoodCategories();
  await seedSeverities();
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
  await seedImages();
  await seedSmtpLogs();
  await seedLogs();
}

/**
 * inserts example patient-settings into the database.
 */
export async function seedPatientSettings() {
  const patientSettingFacade = new PatientSettingFacade();
  await patientSettingFacade.insertPatientSetting(pSettings);
}

/**
 * inserts example images into the database.
 */
export async function seedImages() {
  const imageFacade = new ImageFacade();
  const imageArr = [image];
  for (const item of imageArr) {
    await imageFacade.insertImage(item);
  }
}

/**
 * inserts example sessions into the database.
 */
export async function seedSessions() {
  const sessionFacade = new SessionFacade();
  const sessionsArr = [session];
  for (const item of sessionsArr) {
    await sessionFacade.insertSession(item);
  }
}

/**
 * inserts example statistics into the database.
 */
export async function seedStatistics() {
  const statisticFacade = new StatisticFacade();
  const statisticsArr = [statistic, statistic1];
  for (const item of statisticsArr) {
    await statisticFacade.insertStatistic(item);
  }
}

/**
 * inserts example words into the database.
 */
export async function seedWords() {
  const wordFacade = new WordFacade();
  await wordFacade.insertWord(word);
}

/**
 * inserts example errortexts into the database.
 */
export async function seedErrortexts() {
  const errorTextFacade = new ErrortextFacade();
  const errortextArr = [errortext, errortext1];
  for (const item of errortextArr) {
    await errorTextFacade.insertErrortext(item);
  }
}

/**
 * inserts example errortext-games into the database.
 */
export async function seedErrortextGames() {
  const errortextGameFacade = new ErrortextGamesFacade();
  await errortextGameFacade.insertErrortextGame(errortextGames);
}

/**
 * inserts example helptext-games into the database.
 */
export async function seedHelptextGames() {
  const helptextGameFacade = new HelptextsGamesFacade();
  await helptextGameFacade.insertHelptextGames(helptextGames);
}

/**
 * inserts example helptexts into the database.
 */
export async function seedHelptexts() {
  const helptextFacade = new HelptextFacade();
  await helptextFacade.insertHelptext(helptext);
}

/**
 * inserts example game settings into the database.
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
    await gameSettingFacade.insertGameSetting(item);
  }
}

/**
 * inserts example games into the database.
 */
export async function seedGames() {
  const gameFacade = new GameFacade();
  const games = [game, game2, game3, game4];
  for (const item of games) {
    await gameFacade.insertGame(item);
  }
}

/**
 * inserts example ingredients into the database.
 */
export async function seedIngredients() {
  const ingredientFacade = new IngredientFacade();
  const ingredients = [egg, oil];
  for (const item of ingredients) {
    await ingredientFacade.insertIngredient(item);
  }
}

/**
 * inserts example recipes-ingredients into the database.
 */
export async function seedRecipeIngredientFacade() {
  const recipeIngredientFacade = new RecipeIngredientFacade();
  const recipeIngredients = [recipeIngredient1, recipeIngredient2];
  for (const item of recipeIngredients) {
    await recipeIngredientFacade.insertRecipeIngredient(item);
  }
}

/**
 * inserts example recipes into the database.
 */
export async function seedRecipes() {
  const recipeFacade = new RecipeFacade();
  const recipes = [scrambledEgg, roastPork, proteinShake];
  for (const item of recipes) {
    await recipeFacade.insertRecipe(item);
  }
}

/**
 * inserts example food-categories into the database.
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
    care,
    household
  ];
  for (const item of foodCategories) {
    await foodCategoryFacade.insertFoodCategory(item);
  }
}

/**
 * inserts example severities into the database.
 */
export async function seedSeverities() {
  const severityFacade = new SeverityFacade();
  const severities = [severityEasy, severityMedium, severityHard];
  for (const item of severities) {
    await severityFacade.insertSeverity(item);
  }
}

/**
 * inserts example difficulties into the database.
 */
export async function seedDifficulties() {
  const difficultyFacade = new DifficultyFacade();
  const difficulties = [difficultyEasy, difficultyMedium, difficultyHard];
  for (const item of difficulties) {
    await difficultyFacade.insertDifficulty(item);
  }
}

/**
 * inserts example users into the database.
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
    await therapistFacade.insertTherapist(item);
  }

  const patientFacade = new PatientFacade();
  const patients = [validPatient, validPatient1];
  for (const item of patients) {
    await patientFacade.insertPatient(item);
  }
}

/**
 * inserts example smtp-logs into the database.
 */
export async function seedSmtpLogs(): Promise<void> {
  const smtpLogFacade = new SmtpLogFacade();
  const smtpLogsArr = [sentSmtpLog, simulatedSmtpLog, notSentSmtpLog];
  for (const item of smtpLogsArr) {
    await smtpLogFacade.insertLog(item);
  }
}

/**
 * inserts example logs into the database.
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
    await logFacade.insertLog(item);
  }
}

/**
 * inserts example therapists-patients into the database.
 */
export async function seedTherapistPatients(): Promise<void> {
  const therapistsPatientsFacade = new TherapistsPatientsFacade();
  const therapistPatientArr = [
    therapistPatient1,
    therapistPatient2
  ];
  for (const item of therapistPatientArr) {
    await therapistsPatientsFacade.insertTherapistPatient(item);
  }
}

/**
 * retrieves every table from the specified database except migrations and migration_lock
 * testMode -> choose tables from test_db
 * prodMode -> choose tables from prod_db
 */
async function getTables(): Promise<string[]> {
  logger.debug(
    `${loggerString(
      __dirname,
      "",
      "",
      __filename
    )} Retrieve all tables of the application!`
  );

  const results = await databaseConnection.query(
    `SELECT table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = "${
      !inTestMode() ? process.env.DB_DATABASE : process.env.TEST_DB_DATABASE
    }"`
  );

  return results.map(value => value["table_name"]);
}
