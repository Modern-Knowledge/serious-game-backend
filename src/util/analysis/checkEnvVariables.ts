

import logger from "../log/logger";
import { loggerString } from "../Helper";

/**
 * check if environment does not exist
 * @param variable variable to check
 */
function checkEnvVariable(variable: string): boolean {
    return !process.env[variable];
}

/**
 * check an array of environment variables
 * returns the variables that do not exist in process.env
 * @param variables variables to check
 */
function checkEnvVariables(variables: string[]): string[] {
    return variables.filter(checkEnvVariable);
}

/**
 * check if all required environment variables are set
 */
export function checkEnvFunction(): void {
    /**
     * throw an error if these env variables are not present
     */
    const unsetRequiredVars: string[] = checkEnvVariables([
        "DB_HOST", "DB_USER", "DB_PASS", "DB_DATABASE", "VERSION", "PASSWORD_TOKEN_LENGTH", "PASSWORD_LENGTH", "TEST_DB_HOST", "TEST_DB_USER", "TEST_DB_PASS", "TEST_DB_DATABASE"
    ]);

    if (unsetRequiredVars.length > 0) {
        const errorStr = `${loggerString(__dirname, "", "", __filename)} Some required ENV variables are not set: [${unsetRequiredVars.join(", ")}]!`;
        logger.error(errorStr);
        throw new Error(errorStr);
    }

    /**
     * print an warning, if these env variables are not present
     */
    const unsetOptionalVars: string[] = checkEnvVariables([
        "PORT", "LOG_LEVEL", "WARN_ONE_TO_MANY_JOINS", "WARN_EXECUTION_TIME", "MAX_EXECUTION_TIME",
        "SEND_MAILS", "MAX_FAILED_LOGIN_ATTEMPTS", "LOGIN_COOLDOWN_TIME_HOURS",
        "RUN_MIGRATIONS", "RUN_SEED", "RUN_TRUNCATE_TABLE", "RUN_DROP_TABLE", "TOKEN_EXPIRE_TIME"
    ]);

    if (unsetOptionalVars.length > 0) {
        logger.warn(`${loggerString(__dirname, "", "", __filename)} Some optional ENV variables are not set: [${unsetOptionalVars.join(", ")}]!`);
    }

    /**
     * print an warning, if these env variables are not present
     */
    const unsetMailVariables: string[] = checkEnvVariables(
        ["MAIL_HOST", "MAIL_PORT", "MAIL_SECURE", "MAIL_USER", "MAIL_PASS"]
    );

    if (unsetMailVariables.length > 0) {
        process.env.SEND_MAILS = "0";
        logger.warn(`${loggerString(__dirname, "", "", __filename)} Some mail ENV variables are not set: [${unsetMailVariables.join(", ")}]!`);
    }
}