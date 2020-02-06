
import { loggerString } from "../Helper";
import logger from "../log/logger";

/**
 * Checks if a .env does not exist.
 *
 * @param variable name of the .env variable to check
 */
function checkEnvVariable(variable: string): boolean {
    return !process.env[variable];
}

/**
 * Checks an array of environment variables.
 * Returns an array with the variable names that were not found in process.env.
 *
 * @param variables array of .env variable-names to check
 */
function checkEnvVariables(variables: string[]): string[] {
    return variables.filter(checkEnvVariable);
}

/**
 * Check if all required environment variables are set.
 */
export function checkEnvFunction(): void {

    /**
     * Checks an array of .env-variables that are required to run the application
     * properly. If a variable is missing from process.env, the function throws an
     * error. The application does not with one of this variables missing.
     */
    const unsetRequiredVars: string[] = checkEnvVariables([
        "DB_HOST", "DB_USER", "DB_PASS", "DB_DATABASE", "VERSION",
        "PASSWORD_TOKEN_LENGTH", "PASSWORD_LENGTH", "TEST_DB_HOST",
        "TEST_DB_USER", "TEST_DB_PASS", "TEST_DB_DATABASE", "SECRET_KEY",
        "DB_CONNECTION_LIMIT"
    ]);

    if (unsetRequiredVars.length > 0) { // some variables are not found
        const errorStr = `${loggerString(__dirname, "", "", __filename)} ` +
            `Some required ENV variables are not set: [${unsetRequiredVars.join(", ")}]!`;
        logger.error(errorStr);
        throw new Error(errorStr);
    }

    /**
     * Checks an array of .env-variables that are optional for running the application. If one variable is missing
     * the value is replaced with a default value in the application. If a variable is missing, the function prints a
     * warning.
     */
    const unsetOptionalVars: string[] = checkEnvVariables([
        "PORT", "LOG_LEVEL", "WARN_ONE_TO_MANY_JOINS", "WARN_EXECUTION_TIME", "MAX_EXECUTION_TIME",
        "SEND_MAILS", "MAX_FAILED_LOGIN_ATTEMPTS", "LOGIN_COOLDOWN_TIME_HOURS",
        "RUN_MIGRATIONS", "RUN_SEED", "RUN_TRUNCATE_TABLE", "RUN_DROP_TABLE", "TOKEN_EXPIRE_TIME"
    ]);

    if (unsetOptionalVars.length > 0) { // some variables are not found
        logger.warn(`${loggerString(__dirname, "", "", __filename)} ` +
            `Some optional ENV variables are not set: [${unsetOptionalVars.join(", ")}]!`);
    }

    /**
     * Checks the .env variables that are required for sending mails. If one variable is missing, mail-sending is
     * disabled and a warning is printed.
     */
    const unsetMailVariables: string[] = checkEnvVariables(
        ["MAIL_HOST", "MAIL_PORT", "MAIL_SECURE", "MAIL_USER", "MAIL_PASS"]
    );

    if (unsetMailVariables.length > 0) { // some variables are not found
        process.env.SEND_MAILS = "0";
        logger.warn(`${loggerString(__dirname, "", "", __filename)} ` +
            `Some mail ENV variables are not set: [${unsetMailVariables.join(", ")}]!`);
    }
}
