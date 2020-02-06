
import { loggerString } from "../Helper";
import logger from "../log/logger";

/**
 * Analyses the execution time of a function. The recorded times are analysed
 * with environment variables. Prints warnings or errors if execution time
 * exceeds certain values.
 */
export class ExecutionTimeAnalyser {

    private readonly _warnExecutionTime: number;
    private readonly _maxExecutionTime: number;

    public constructor() {
        this._warnExecutionTime = Number(process.env.WARN_EXECUTION_TIME) || 100;
        this._maxExecutionTime = Number(process.env.MAX_EXECUTION_TIME) || 500;
    }

    /**
     * Checks the execution time of a method. If the execution time is higher
     * than a certain value a warning is printed. If the time is very high an
     * error is printed.
     *
     * @param executionTime execution time of the method in ms
     * @param methodName name of method that is analyzed
     */
    public analyse(executionTime: number, methodName: string = ""): void {
        if (executionTime >= this._maxExecutionTime) {
            logger.error(`${loggerString(__dirname, ExecutionTimeAnalyser.name, "analyse")} ` +
                `This operation "${methodName}" is non performant (${executionTime}ms)! Refactor this method!`);

        } else if (executionTime >= this._warnExecutionTime) {
            logger.warn(`${loggerString(__dirname, ExecutionTimeAnalyser.name, "analyse")} ` +
                `This operation "${methodName}" takes very long (${executionTime}ms)! ` +
                `Consider refactoring this method!`);
        }
    }
}
