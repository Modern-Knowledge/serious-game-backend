/**
 * analyses execution time based on environment variables
 * prints warnings and errors if execution time is to high
 */
import logger from "./logger";
import { loggerString } from "./Helper";

export class ExecutionTimeAnalyser {

    private readonly _warnExecutionTime: number;
    private readonly _maxExecutionTime: number;

    public constructor() {
        this._warnExecutionTime = Number(process.env.WARN_EXECUTION_TIME) || 100;
        this._maxExecutionTime = Number(process.env.MAX_EXECUTION_TIME) || 500;
    }

    /**
     * analyse the passed execution time and print warnings, errors
     * @param executionTime
     * @param methodName
     */
    public analyse(executionTime: number, methodName: string = ""): void {
        if (executionTime >= this._maxExecutionTime) {
            logger.error(`${loggerString(__dirname, ExecutionTimeAnalyser.name, "analyse")} This operation "${methodName}" is non performant (${executionTime}ms)! Refactor this method!`);
        } else if (executionTime >= this._warnExecutionTime) {
            logger.warn(`${loggerString(__dirname, ExecutionTimeAnalyser.name, "analyse")} This operation "${methodName}" takes very long (${executionTime}ms)! Consider refactoring this method!`);
        }
    }
}